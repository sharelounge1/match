import { supabase } from '@/lib/supabase';

// Types
export interface Payment {
  id: string;
  user_id: string;
  project_id: string | null;
  meeting_id: string | null;
  contract_id: string | null;
  type: 'project_registration' | 'premium_subscription' | 'meeting_booking' | 'contract_fee' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_method: 'card' | 'bank_transfer' | 'kakao_pay' | 'naver_pay' | 'toss';
  pg_transaction_id: string | null;
  pg_response: Record<string, unknown> | null;
  refund_amount: number | null;
  refund_reason: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentInsert {
  project_id?: string;
  meeting_id?: string;
  contract_id?: string;
  type: Payment['type'];
  amount: number;
  payment_method: Payment['payment_method'];
  pg_transaction_id?: string;
  currency?: string;
}

export interface PaymentFilters {
  type?: Payment['type'];
  status?: Payment['status'];
  from?: string;
  to?: string;
}

export interface PaymentWithDetails extends Payment {
  project?: {
    id: string;
    title: string;
  } | null;
  meeting?: {
    id: string;
    scheduled_at: string;
  } | null;
  contract?: {
    id: string;
    contract_type: string;
  } | null;
}

export interface PaymentSummary {
  total_spent: number;
  total_refunded: number;
  payment_count: number;
  by_type: Record<string, number>;
  by_month: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export const paymentService = {
  // Get payment history
  getPayments: async (filters?: PaymentFilters): Promise<PaymentWithDetails[]> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('payments')
      .select(`
        *,
        project:projects!project_id(id, title),
        meeting:meetings!meeting_id(id, scheduled_at),
        contract:contracts!contract_id(id, contract_type)
      `)
      .eq('user_id', user.id);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.from) {
      query = query.gte('created_at', filters.from);
    }

    if (filters?.to) {
      query = query.lte('created_at', filters.to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as PaymentWithDetails[];
  },

  // Get single payment
  getPayment: async (paymentId: string): Promise<PaymentWithDetails> => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        project:projects!project_id(id, title),
        meeting:meetings!meeting_id(id, scheduled_at),
        contract:contracts!contract_id(id, contract_type)
      `)
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data as PaymentWithDetails;
  },

  // Create payment record (called after successful PG payment via Edge Function)
  createPayment: async (payment: PaymentInsert): Promise<Payment> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    // Use Edge Function to handle payment processing securely
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        ...payment,
        user_id: user.id,
        currency: payment.currency || 'KRW',
      },
    });

    if (error) throw error;
    return data as Payment;
  },

  // Request refund
  requestRefund: async (paymentId: string, reason: string): Promise<Payment> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    // Use Edge Function for refund processing (PG API integration)
    const { data, error } = await supabase.functions.invoke('request-refund', {
      body: {
        payment_id: paymentId,
        reason,
        user_id: user.id,
      },
    });

    if (error) throw error;
    return data as Payment;
  },

  // Get payment summary (for dashboard)
  getPaymentSummary: async (period: string = '6months'): Promise<PaymentSummary> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    // Calculate date range
    const now = new Date();
    let fromDate: Date;

    switch (period) {
      case '1month':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        fromDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Calculate summary
    const summary: PaymentSummary = {
      total_spent: 0,
      total_refunded: 0,
      payment_count: 0,
      by_type: {},
      by_month: [],
    };

    const monthlyData: Record<string, { amount: number; count: number }> = {};

    for (const payment of payments || []) {
      if (payment.status === 'completed') {
        summary.total_spent += payment.amount;
        summary.payment_count += 1;

        // By type
        if (!summary.by_type[payment.type]) {
          summary.by_type[payment.type] = 0;
        }
        summary.by_type[payment.type] += payment.amount;

        // By month
        const monthKey = payment.created_at.substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { amount: 0, count: 0 };
        }
        monthlyData[monthKey].amount += payment.amount;
        monthlyData[monthKey].count += 1;
      }

      if (payment.status === 'refunded' && payment.refund_amount) {
        summary.total_refunded += payment.refund_amount;
      }
    }

    // Convert monthly data to array
    summary.by_month = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return summary;
  },

  // Get recent payments (for dashboard widget)
  getRecentPayments: async (limit: number = 5): Promise<PaymentWithDetails[]> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        project:projects!project_id(id, title),
        meeting:meetings!meeting_id(id, scheduled_at),
        contract:contracts!contract_id(id, contract_type)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as PaymentWithDetails[];
  },

  // Initialize payment (get payment intent from PG)
  initializePayment: async (params: {
    type: Payment['type'];
    amount: number;
    payment_method: Payment['payment_method'];
    project_id?: string;
    meeting_id?: string;
    contract_id?: string;
  }): Promise<{ client_secret: string; payment_id: string }> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    // Use Edge Function to create payment intent with PG
    const { data, error } = await supabase.functions.invoke('initialize-payment', {
      body: {
        ...params,
        user_id: user.id,
      },
    });

    if (error) throw error;
    return data as { client_secret: string; payment_id: string };
  },
};
