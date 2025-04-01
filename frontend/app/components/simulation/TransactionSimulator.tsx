'use client';

import { useState, useEffect } from 'react';
import { SimulationConfig, TransactionSimulation } from './types';
import { Chain } from 'wagmi/chains';

interface TransactionSimulatorProps {
  chains: Chain[];
  onSimulate: (config: SimulationConfig) => Promise<TransactionSimulation>;
}

export function TransactionSimulator({ chains, onSimulate }: TransactionSimulatorProps) {
  const [type, setType] = useState<'one-time' | 'recurring' | 'multi-recipient'>('one-time');
  const [sourceChain, setSourceChain] = useState(chains[0]?.id.toString() || '');
  const [destinationChain, setDestinationChain] = useState(chains[1]?.id.toString() || '');
  const [amount, setAmount] = useState('');
  const [recipients, setRecipients] = useState([{ address: '', amount: '' }]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<TransactionSimulation | null>(null);

  // Add logging for initial state and chain values
  useEffect(() => {
    console.log('Initial chains:', chains);
    console.log('Initial sourceChain:', sourceChain);
    console.log('Initial destinationChain:', destinationChain);
  }, []);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  const handleRecipientChange = (index: number, field: 'address' | 'amount', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const handleQuickFill = () => {
    console.log('Quickfill button clicked');
    console.log('Current state:', {
      type,
      sourceChain,
      destinationChain,
      amount,
      recipients,
      frequency
    });

    try {
      // Test addresses (these are example addresses, not real ones)
      const testAddresses = {
        recipient1: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        recipient2: '0x742d35Cc6634C0532925a3b844Bc454e4438f44f',
        recipient3: '0x742d35Cc6634C0532925a3b844Bc454e4438f44g',
      };

      console.log('Available chains:', chains);

      // Create a new state object to batch updates
      const newState = {
        sourceChain: chains[0]?.id.toString() || '',
        destinationChain: chains[1]?.id.toString() || '',
        amount: '',
        recipients: [] as { address: string; amount: string }[],
        frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
      };

      // Set values based on transaction type
      switch (type) {
        case 'one-time':
          newState.amount = '1.5';
          newState.recipients = [{ address: testAddresses.recipient1, amount: '1.5' }];
          break;
        case 'recurring':
          newState.amount = '0.5';
          newState.recipients = [{ address: testAddresses.recipient1, amount: '0.5' }];
          newState.frequency = 'weekly';
          break;
        case 'multi-recipient':
          newState.amount = '3.0';
          newState.recipients = [
            { address: testAddresses.recipient1, amount: '1.0' },
            { address: testAddresses.recipient2, amount: '1.0' },
            { address: testAddresses.recipient3, amount: '1.0' },
          ];
          break;
      }

      // Apply all state updates
      setSourceChain(newState.sourceChain);
      setDestinationChain(newState.destinationChain);
      setAmount(newState.amount);
      setRecipients(newState.recipients);
      setFrequency(newState.frequency);
      setSimulationResult(null);

      console.log('Quickfill completed. New state:', newState);
    } catch (error) {
      console.error('Error in quickfill:', error);
    }
  };

  // Add effect to log state changes
  useEffect(() => {
    console.log('State updated:', {
      type,
      sourceChain,
      destinationChain,
      amount,
      recipients,
      frequency
    });
  }, [type, sourceChain, destinationChain, amount, recipients, frequency]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const config: SimulationConfig = {
        sourceChain,
        destinationChain,
        amount,
        recipients,
        type,
        ...(type === 'recurring' && { frequency }),
      };

      const result = await onSimulate(config);
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Configure Transaction</h3>
        <button
          onClick={handleQuickFill}
          className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors duration-200"
        >
          Quick Fill Demo Values
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="one-time">One-time Payment</option>
              <option value="recurring">Recurring Payment</option>
              <option value="multi-recipient">Multi-recipient Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Chain</label>
            <select
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Chain</label>
            <select
              value={destinationChain}
              onChange={(e) => setDestinationChain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {type === 'recurring' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Recipients</label>
              <button
                type="button"
                onClick={handleAddRecipient}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                + Add Recipient
              </button>
            </div>
            {recipients.map((recipient, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Recipient address"
                />
                <input
                  type="number"
                  value={recipient.amount}
                  onChange={(e) => handleRecipientChange(index, 'amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Amount"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSimulate}
        disabled={isSimulating}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSimulating ? 'Simulating...' : 'Simulate Transaction'}
      </button>

      {simulationResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Simulation Result</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium ${simulationResult.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                {simulationResult.status}
              </span>
            </p>
            {simulationResult.simulationResult && (
              <>
                <p className="text-sm text-gray-600">
                  Gas Used: {simulationResult.simulationResult.gasUsed}
                </p>
                {simulationResult.simulationResult.error && (
                  <p className="text-sm text-red-600">
                    Error: {simulationResult.simulationResult.error}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 