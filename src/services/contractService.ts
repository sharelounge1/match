import { supabase } from '@/lib/supabase';

// Types
export interface ContractTerms {
  equity_distribution: Record<string, number>;
  roles_responsibilities: Record<string, string[]>;
  milestones?: Array<{
    title: string;
    deadline: string;
    deliverables: string[];
  }>;
  confidentiality_clause?: boolean;
  non_compete_clause?: boolean;
  dispute_resolution?: string;
  termination_conditions?: string[];
  additional_terms?: string;
}

export interface Contract {
  id: string;
  project_id: string;
  meeting_id: string | null;
  party1_id: string;
  party2_id: string;
  contract_type: 'equity_share' | 'revenue_share' | 'hybrid';
  terms: ContractTerms;
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'terminated' | 'disputed';
  party1_signature: string | null;
  party1_signed_at: string | null;
  party2_signature: string | null;
  party2_signed_at: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  termination_reason: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractInsert {
  project_id: string;
  meeting_id?: string;
  party2_id: string;
  contract_type?: 'equity_share' | 'revenue_share' | 'hybrid';
  terms: ContractTerms;
  effective_date?: string;
  expiry_date?: string;
}

export interface ContractUpdate {
  terms?: ContractTerms;
  status?: Contract['status'];
  effective_date?: string;
  expiry_date?: string;
}

export interface ContractWithDetails extends Contract {
  project: {
    id: string;
    title: string;
  };
  party1: {
    id: string;
    name: string;
    avatar_url: string | null;
    email: string;
  };
  party2: {
    id: string;
    name: string;
    avatar_url: string | null;
    email: string;
  };
}

export const contractService = {
  // Get user's contracts
  getContracts: async (status?: string): Promise<ContractWithDetails[]> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('contracts')
      .select(`
        *,
        project:projects!project_id(id, title),
        party1:profiles!party1_id(id, name, avatar_url, email),
        party2:profiles!party2_id(id, name, avatar_url, email)
      `)
      .or(`party1_id.eq.${user.id},party2_id.eq.${user.id}`);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as ContractWithDetails[];
  },

  // Get single contract
  getContract: async (contractId: string): Promise<ContractWithDetails> => {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        project:projects!project_id(id, title),
        party1:profiles!party1_id(id, name, avatar_url, email),
        party2:profiles!party2_id(id, name, avatar_url, email)
      `)
      .eq('id', contractId)
      .single();

    if (error) throw error;
    return data as ContractWithDetails;
  },

  // Create contract (uses Edge Function for complex logic)
  createContract: async (contract: ContractInsert): Promise<Contract> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('create-contract', {
      body: {
        ...contract,
        party1_id: user.id,
        contract_type: contract.contract_type || 'equity_share',
      },
    });

    if (error) throw error;
    return data as Contract;
  },

  // Update contract terms
  updateContract: async (contractId: string, updates: ContractUpdate): Promise<Contract> => {
    // Only allow updates on draft contracts
    const { data: existing, error: fetchError } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', contractId)
      .single();

    if (fetchError) throw fetchError;
    if (existing.status !== 'draft') {
      throw new Error('Only draft contracts can be updated');
    }

    const { data, error } = await supabase
      .from('contracts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;
    return data as Contract;
  },

  // Sign contract (uses Edge Function for secure signature handling)
  signContract: async (contractId: string, signature: string): Promise<Contract> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('sign-contract', {
      body: {
        contract_id: contractId,
        signature,
        user_id: user.id,
      },
    });

    if (error) throw error;
    return data as Contract;
  },

  // Get contract PDF (generate via Edge Function)
  getContractPDF: async (contractId: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-contract-pdf', {
      body: { contract_id: contractId },
    });

    if (error) throw error;
    return data.pdf_url as string;
  },

  // Terminate contract
  terminateContract: async (contractId: string, reason?: string): Promise<Contract> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    // Use Edge Function for termination logic (notifications, cleanup, etc.)
    const { data, error } = await supabase.functions.invoke('terminate-contract', {
      body: {
        contract_id: contractId,
        reason: reason || 'Mutual agreement',
        user_id: user.id,
      },
    });

    if (error) throw error;
    return data as Contract;
  },

  // Get contracts pending signature
  getPendingContracts: async (): Promise<ContractWithDetails[]> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        project:projects!project_id(id, title),
        party1:profiles!party1_id(id, name, avatar_url, email),
        party2:profiles!party2_id(id, name, avatar_url, email)
      `)
      .or(`party1_id.eq.${user.id},party2_id.eq.${user.id}`)
      .eq('status', 'pending_signature')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ContractWithDetails[];
  },
};
