'use client';

import { useState } from 'react';
import { SimulationConfig, TransactionSimulation } from '../components/simulation/types';

export function useTenderlySimulation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateTransaction = async (config: SimulationConfig): Promise<TransactionSimulation> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Tenderly API call
      // This is a mock implementation
      const response = await fetch('https://api.tenderly.co/api/v1/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': process.env.NEXT_PUBLIC_TENDERLY_ACCESS_KEY || '',
        },
        body: JSON.stringify({
          network_id: config.sourceChain,
          from: '0x0000000000000000000000000000000000000000', // Mock sender
          to: '0x0000000000000000000000000000000000000000', // Mock recipient
          input: '0x', // Mock input data
          value: config.amount,
          save: true,
          save_if_fails: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const data = await response.json();

      return {
        id: Math.random().toString(36).substr(2, 9),
        type: config.type,
        amount: config.amount,
        sourceChain: config.sourceChain,
        destinationChain: config.destinationChain,
        recipients: config.recipients,
        frequency: config.frequency,
        status: 'completed',
        timestamp: Date.now(),
        simulationResult: {
          gasUsed: data.transaction.gas_used,
          status: true,
          logs: data.transaction.logs || [],
        },
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during simulation');
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: config.type,
        amount: config.amount,
        sourceChain: config.sourceChain,
        destinationChain: config.destinationChain,
        recipients: config.recipients,
        frequency: config.frequency,
        status: 'failed',
        timestamp: Date.now(),
        simulationResult: {
          gasUsed: '0',
          status: false,
          error: err instanceof Error ? err.message : 'An error occurred',
          logs: [],
        },
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    simulateTransaction,
    isLoading,
    error,
  };
} 