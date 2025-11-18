import { supabase, getCurrentUser } from '@/lib/supabase';

// Types
export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  project_id: string;
  contract_id: string | null;
  rating: number;
  comment: string | null;
  categories: ReviewCategories | null;
  created_at: string;
  updated_at: string;
  reviewer?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  reviewee?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  project?: {
    id: string;
    title: string;
  };
}

export interface ReviewCategories {
  communication?: number;
  expertise?: number;
  punctuality?: number;
  collaboration?: number;
  quality?: number;
}

export interface CreateReviewParams {
  reviewee_id: string;
  project_id: string;
  contract_id?: string;
  rating: number;
  comment?: string;
  categories?: ReviewCategories;
}

export interface UpdateReviewParams {
  rating?: number;
  comment?: string;
  categories?: ReviewCategories;
}

export interface UserRatingStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
  category_averages: ReviewCategories;
}

export const reviewService = {
  // Get reviews received by a user
  getUserReviews: async (userId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, name, avatar_url),
        project:project_id(id, title)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  },

  // Get reviews written by a user
  getReviewsByUser: async (userId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewee:reviewee_id(id, name, avatar_url),
        project:project_id(id, title)
      `)
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  },

  // Get a single review
  getReview: async (reviewId: string): Promise<Review> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, name, avatar_url),
        reviewee:reviewee_id(id, name, avatar_url),
        project:project_id(id, title)
      `)
      .eq('id', reviewId)
      .single();

    if (error) throw error;

    return data;
  },

  // Get reviews for a project
  getProjectReviews: async (projectId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, name, avatar_url),
        reviewee:reviewee_id(id, name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  },

  // Create a review
  createReview: async (review: CreateReviewParams): Promise<Review> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user already reviewed this person for this project
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('reviewee_id', review.reviewee_id)
      .eq('project_id', review.project_id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingReview) {
      throw new Error('You have already reviewed this user for this project');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewee_id: review.reviewee_id,
        project_id: review.project_id,
        contract_id: review.contract_id || null,
        rating: review.rating,
        comment: review.comment || null,
        categories: review.categories || null,
      })
      .select(`
        *,
        reviewer:reviewer_id(id, name, avatar_url),
        reviewee:reviewee_id(id, name, avatar_url),
        project:project_id(id, title)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  // Update a review
  updateReview: async (reviewId: string, updates: UpdateReviewParams): Promise<Review> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('reviewer_id', user.id)
      .select(`
        *,
        reviewer:reviewer_id(id, name, avatar_url),
        reviewee:reviewee_id(id, name, avatar_url),
        project:project_id(id, title)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('reviewer_id', user.id);

    if (error) throw error;
  },

  // Get average rating for a user
  getAverageRating: async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return 0;
    }

    const total = data.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / data.length) * 10) / 10;
  },

  // Get detailed rating statistics for a user
  getUserRatingStats: async (userId: string): Promise<UserRatingStats> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating, categories')
      .eq('reviewee_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        category_averages: {},
      };
    }

    // Calculate average rating
    const total = data.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((total / data.length) * 10) / 10;

    // Calculate rating distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach((review) => {
      const roundedRating = Math.round(review.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        distribution[roundedRating]++;
      }
    });

    // Calculate category averages
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    data.forEach((review) => {
      if (review.categories) {
        Object.entries(review.categories).forEach(([key, value]) => {
          if (typeof value === 'number') {
            if (!categoryTotals[key]) {
              categoryTotals[key] = { sum: 0, count: 0 };
            }
            categoryTotals[key].sum += value;
            categoryTotals[key].count++;
          }
        });
      }
    });

    const categoryAverages: ReviewCategories = {};
    Object.entries(categoryTotals).forEach(([key, { sum, count }]) => {
      (categoryAverages as Record<string, number>)[key] = Math.round((sum / count) * 10) / 10;
    });

    return {
      average_rating: averageRating,
      total_reviews: data.length,
      rating_distribution: distribution,
      category_averages: categoryAverages,
    };
  },

  // Check if user can review another user for a project
  canReview: async (revieweeId: string, projectId: string): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    // Can't review yourself
    if (user.id === revieweeId) return false;

    // Check if already reviewed
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', user.id)
      .eq('reviewee_id', revieweeId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (checkError) throw checkError;

    return !existingReview;
  },

  // Get pending reviews (projects where user can leave reviews)
  getPendingReviews: async (): Promise<{ project_id: string; reviewee_id: string }[]> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // This would typically involve checking completed contracts/projects
    // and finding team members who haven't been reviewed yet
    // Implementation depends on your specific business logic

    const { data, error } = await supabase.rpc('get_pending_reviews', {
      user_id: user.id,
    });

    if (error) {
      // If RPC doesn't exist, return empty array
      if (error.code === 'PGRST202') {
        return [];
      }
      throw error;
    }

    return data || [];
  },
};
