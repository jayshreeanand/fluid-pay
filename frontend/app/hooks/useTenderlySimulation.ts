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
      // Convert amount to wei (assuming 18 decimals for ETH)
      const amountInWei = BigInt(Math.floor(Number(config.amount) * 1e18));
      const valueHex = `0x${amountInWei.toString(16)}`;

      const simulationRequest = {
        network_id: parseInt(config.sourceChain),
        from: '0x0000000000000000000000000000000000000000',
        to: config.recipients[0].address,
        input: '0x',
        value: valueHex,
        gas: 8000000,
        gas_price: '0x0',
        save: true,
        save_if_fails: true
      };

      console.log('Simulation request:', JSON.stringify(simulationRequest, null, 2));

      const response = await fetch(`https://api.tenderly.co/api/v1/account/${process.env.NEXT_PUBLIC_TENDERLY_ACCOUNT}/project/${process.env.NEXT_PUBLIC_TENDERLY_PROJECT}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': process.env.NEXT_PUBLIC_TENDERLY_ACCESS_KEY || '',
        },
        body: JSON.stringify(simulationRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Tenderly API Error:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.error?.message || 'Simulation failed');
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
    } catch (error) {
      console.error('Simulation error:', error);
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
          gasUsed: 0,
          status: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
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