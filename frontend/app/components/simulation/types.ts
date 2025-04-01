export interface TransactionSimulation {
  id: string;
  type: 'one-time' | 'recurring' | 'multi-recipient';
  amount: string;
  sourceChain: string;
  destinationChain: string;
  recipients: {
    address: string;
    amount: string;
  }[];
  frequency?: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  simulationResult?: {
    gasUsed: string;
    status: boolean;
    error?: string;
    logs: any[];
  };
}

export interface SimulationConfig {
  sourceChain: string;
  destinationChain: string;
  tokenAddress?: string;
  amount: string;
  recipients: {
    address: string;
    amount: string;
  }[];
  type: 'one-time' | 'recurring' | 'multi-recipient';
  frequency?: 'daily' | 'weekly' | 'monthly';
} 