import { supabase } from '@/lib/supabase';
import type {
  Portfolio,
  PortfolioInsert,
  PortfolioUpdate,
} from '@/types/database';

// Image upload response type
interface ImageUploadResponse {
  path: string;
  url: string;
}

// Order map type for reordering
type OrderMap = Record<string, number>;

export const portfolioService = {
  /**
   * Get all portfolios for a user
   * @param userId - User's ID
   * @returns Array of portfolios ordered by order_index
   */
  getPortfolios: async (userId: string): Promise<Portfolio[]> => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  /**
   * Get a single portfolio by ID
   * @param portfolioId - Portfolio ID
   * @returns Portfolio data
   */
  getPortfolio: async (portfolioId: string): Promise<Portfolio> => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Create a new portfolio item
   * @param portfolio - Portfolio data to create
   * @returns Created portfolio
   */
  createPortfolio: async (
    portfolio: Omit<PortfolioInsert, 'order_index'>
  ): Promise<Portfolio> => {
    // Get current max order_index for the user
    const { data: existingPortfolios } = await supabase
      .from('portfolios')
      .select('order_index')
      .eq('user_id', portfolio.user_id)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingPortfolios && existingPortfolios.length > 0
      ? existingPortfolios[0].order_index + 1
      : 0;

    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        ...portfolio,
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Update a portfolio item
   * @param portfolioId - Portfolio ID
   * @param updates - Portfolio fields to update
   * @returns Updated portfolio
   */
  updatePortfolio: async (
    portfolioId: string,
    updates: PortfolioUpdate
  ): Promise<Portfolio> => {
    const { data, error } = await supabase
      .from('portfolios')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', portfolioId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Delete a portfolio item
   * @param portfolioId - Portfolio ID
   */
  deletePortfolio: async (portfolioId: string): Promise<void> => {
    // Get portfolio to find any associated image
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('image_url, user_id')
      .eq('id', portfolioId)
      .single();

    // Delete associated image from storage if exists
    if (portfolio?.image_url) {
      const urlParts = portfolio.image_url.split('/');
      const path = urlParts.slice(-2).join('/');
      await supabase.storage.from('portfolio-images').remove([path]);
    }

    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId);

    if (error) {
      throw new Error(error.message);
    }

    // Reorder remaining portfolios
    if (portfolio?.user_id) {
      const { data: remaining } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', portfolio.user_id)
        .order('order_index', { ascending: true });

      if (remaining) {
        const newOrderMap: OrderMap = {};
        remaining.forEach((item, index) => {
          newOrderMap[item.id] = index;
        });

        if (Object.keys(newOrderMap).length > 0) {
          await portfolioService.reorderPortfolios(portfolio.user_id, newOrderMap);
        }
      }
    }
  },

  /**
   * Reorder portfolio items
   * @param userId - User's ID
   * @param orderMap - Object mapping portfolio IDs to new order indices
   */
  reorderPortfolios: async (
    userId: string,
    orderMap: OrderMap
  ): Promise<void> => {
    // Verify all portfolios belong to the user
    const portfolioIds = Object.keys(orderMap);

    const { data: portfolios, error: fetchError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .in('id', portfolioIds);

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!portfolios || portfolios.length !== portfolioIds.length) {
      throw new Error('Invalid portfolio IDs provided');
    }

    // Update each portfolio's order_index
    const updatePromises = Object.entries(orderMap).map(([id, orderIndex]) =>
      supabase
        .from('portfolios')
        .update({
          order_index: orderIndex,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      throw new Error('Failed to reorder some portfolios');
    }
  },

  /**
   * Upload portfolio image to Supabase Storage
   * @param portfolioId - Portfolio ID
   * @param file - Image file to upload
   * @returns Upload response with path and public URL
   */
  uploadImage: async (
    portfolioId: string,
    file: File
  ): Promise<ImageUploadResponse> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).');
    }

    // Validate file size (max 10MB for portfolio images)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    // Get portfolio to find user_id
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('user_id, image_url')
      .eq('id', portfolioId)
      .single();

    if (fetchError || !portfolio) {
      throw new Error('Portfolio not found');
    }

    // Delete existing image if present
    if (portfolio.image_url) {
      const urlParts = portfolio.image_url.split('/');
      const oldPath = urlParts.slice(-2).join('/');
      await supabase.storage.from('portfolio-images').remove([oldPath]);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${portfolio.user_id}/${portfolioId}_${Date.now()}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(uploadData.path);

    // Update portfolio with new image URL
    await supabase
      .from('portfolios')
      .update({
        image_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', portfolioId);

    return {
      path: uploadData.path,
      url: urlData.publicUrl,
    };
  },

  /**
   * Delete portfolio image
   * @param portfolioId - Portfolio ID
   */
  deleteImage: async (portfolioId: string): Promise<void> => {
    // Get current portfolio to find image path
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('image_url')
      .eq('id', portfolioId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (portfolio?.image_url) {
      // Extract path from URL
      const urlParts = portfolio.image_url.split('/');
      const path = urlParts.slice(-2).join('/');

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('portfolio-images')
        .remove([path]);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Update portfolio
      await supabase
        .from('portfolios')
        .update({
          image_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolioId);
    }
  },

  /**
   * Get portfolios with pagination
   * @param userId - User's ID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Paginated portfolios with total count
   */
  getPortfoliosPaginated: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Portfolio[]; total: number; hasMore: boolean }> => {
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get paginated data
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  },

  /**
   * Duplicate a portfolio item
   * @param portfolioId - Portfolio ID to duplicate
   * @returns New duplicated portfolio
   */
  duplicatePortfolio: async (portfolioId: string): Promise<Portfolio> => {
    const { data: original, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (fetchError || !original) {
      throw new Error('Portfolio not found');
    }

    // Create a copy without id and timestamps
    const { id, created_at, updated_at, ...portfolioData } = original;

    return portfolioService.createPortfolio({
      ...portfolioData,
      title: `${portfolioData.title} (Copy)`,
    });
  },
};
