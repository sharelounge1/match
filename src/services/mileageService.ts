import { supabase, getCurrentUser } from '@/lib/supabase';

// Types
export interface MileageTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'charge' | 'use' | 'refund';
  description: string;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface MileageBalance {
  balance: number;
  last_updated: string;
}

export interface MileageFilters {
  type?: 'charge' | 'use' | 'refund';
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface ChargePackage {
  id: string;
  name: string;
  amount: number;
  mileage: number;
  bonus_percentage: number;
}

// Predefined charge packages
export const CHARGE_PACKAGES: ChargePackage[] = [
  {
    id: 'starter',
    name: '스타터',
    amount: 10000,
    mileage: 10000,
    bonus_percentage: 0,
  },
  {
    id: 'standard',
    name: '스탠다드',
    amount: 50000,
    mileage: 55000,
    bonus_percentage: 10,
  },
  {
    id: 'premium',
    name: '프리미엄',
    amount: 100000,
    mileage: 120000,
    bonus_percentage: 20,
  },
];

// Service fee constants
export const SERVICE_FEES = {
  PROJECT_REGISTRATION: 5000,
  APPLICATION_VIEW: 1000,
  MEETING_REQUEST: 3000,
  CONTRACT_GENERATION: 10000,
};

export const mileageService = {
  /**
   * Get current user's mileage balance
   */
  getBalance: async (): Promise<MileageBalance> => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('mileage, updated_at')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to get mileage balance: ${error.message}`);
    }

    return {
      balance: data?.mileage || 0,
      last_updated: data?.updated_at || new Date().toISOString(),
    };
  },

  /**
   * Get mileage transaction history
   */
  getTransactions: async (filters?: MileageFilters): Promise<MileageTransaction[]> => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('mileage_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.from) {
      query = query.gte('created_at', filters.from);
    }

    if (filters?.to) {
      query = query.lte('created_at', filters.to);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get mileage transactions: ${error.message}`);
    }

    return data as MileageTransaction[];
  },

  /**
   * Use mileage (deduct from balance)
   */
  useMileage: async (
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Use the database function
    const { data, error } = await supabase.rpc('use_mileage', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description,
      p_reference_type: referenceType || null,
      p_reference_id: referenceId || null,
    });

    if (error) {
      throw new Error(`Failed to use mileage: ${error.message}`);
    }

    return data as boolean;
  },

  /**
   * Charge mileage (add to balance)
   */
  chargeMileage: async (
    amount: number,
    description: string
  ): Promise<number> => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Use the database function
    const { data, error } = await supabase.rpc('charge_mileage', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description,
    });

    if (error) {
      throw new Error(`Failed to charge mileage: ${error.message}`);
    }

    return data as number;
  },

  /**
   * Check if user has sufficient balance
   */
  hasSufficientBalance: async (amount: number): Promise<boolean> => {
    const { balance } = await mileageService.getBalance();
    return balance >= amount;
  },

  /**
   * Purchase a charge package
   */
  purchasePackage: async (packageId: string): Promise<number> => {
    const pkg = CHARGE_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      throw new Error('Invalid package ID');
    }

    // In production, this would integrate with payment gateway
    // For testing, directly charge the mileage
    return mileageService.chargeMileage(
      pkg.mileage,
      `${pkg.name} 패키지 충전`
    );
  },

  /**
   * Pay for project registration
   */
  payForProjectRegistration: async (projectId: string): Promise<boolean> => {
    return mileageService.useMileage(
      SERVICE_FEES.PROJECT_REGISTRATION,
      '프로젝트 공고 등록',
      'project',
      projectId
    );
  },

  /**
   * Pay for viewing application
   */
  payForApplicationView: async (applicationId: string): Promise<boolean> => {
    return mileageService.useMileage(
      SERVICE_FEES.APPLICATION_VIEW,
      '지원서 열람',
      'application',
      applicationId
    );
  },

  /**
   * Pay for meeting request
   */
  payForMeetingRequest: async (meetingId: string): Promise<boolean> => {
    return mileageService.useMileage(
      SERVICE_FEES.MEETING_REQUEST,
      '미팅 요청',
      'meeting',
      meetingId
    );
  },

  /**
   * Get monthly spending summary
   */
  getMonthlySummary: async (): Promise<{
    totalCharged: number;
    totalUsed: number;
    transactionCount: number;
  }> => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('mileage_transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      throw new Error(`Failed to get monthly summary: ${error.message}`);
    }

    let totalCharged = 0;
    let totalUsed = 0;

    for (const tx of data || []) {
      if (tx.type === 'charge' || tx.type === 'refund') {
        totalCharged += Math.abs(tx.amount);
      } else if (tx.type === 'use') {
        totalUsed += Math.abs(tx.amount);
      }
    }

    return {
      totalCharged,
      totalUsed,
      transactionCount: data?.length || 0,
    };
  },

  /**
   * Get available charge packages
   */
  getChargePackages: (): ChargePackage[] => {
    return CHARGE_PACKAGES;
  },

  /**
   * Get service fee by type
   */
  getServiceFee: (type: keyof typeof SERVICE_FEES): number => {
    return SERVICE_FEES[type];
  },
};
