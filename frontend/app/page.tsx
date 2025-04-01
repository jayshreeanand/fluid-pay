'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { useCrossChainPayment } from './hooks/useCrossChainPayment';
import { useTenderlySimulation } from './hooks/useTenderlySimulation';
import { TransactionSimulator } from './components/simulation/TransactionSimulator';

interface Transaction {
  hash: string;
  amount: string;
  destinationChain: string;
  recipient: string;
  timestamp: number;
}

export default function Home() {
  const { isConnected } = useAccount();
  const { sendPayment, isLoading, error } = useCrossChainPayment();
  const { simulateTransaction } = useTenderlySimulation();
  const [amount, setAmount] = useState('');
  const [destinationChainId, setDestinationChainId] = useState('1');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const chains: Chain[] = [
    {
      id: 1,
      name: 'Ethereum',
      network: 'ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://eth.llamarpc.com'] },
        public: { http: ['https://eth.llamarpc.com'] },
      },
      blockExplorers: {
        default: { name: 'Etherscan', url: 'https://etherscan.io' },
      },
    },
    {
      id: 137,
      name: 'Polygon',
      network: 'polygon',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://polygon.llamarpc.com'] },
        public: { http: ['https://polygon.llamarpc.com'] },
      },
      blockExplorers: {
        default: { name: 'Polygonscan', url: 'https://polygonscan.com' },
      },
    },
  ];

  const handleSendPayment = async () => {
    const result = await sendPayment(amount, parseInt(destinationChainId), recipientAddress);
    if (result?.success) {
      const selectedChain = chains.find(c => c.id === parseInt(destinationChainId));
      const chainName = (selectedChain?.name ?? 'Unknown Chain') as string;
      const newTransaction: Transaction = {
        hash: result.transactionHash,
        amount,
        destinationChain: chainName,
        recipient: recipientAddress,
        timestamp: Date.now(),
      };
      setTransactions([newTransaction, ...transactions]);
      setAmount('');
      setRecipientAddress('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="title">Fluid Pay</h1>
            <p className="subtitle">Seamless cross-chain payments</p>
          </div>
          <ConnectButton />
        </div>

        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="card">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Payment Details</h2>
                <div className="space-y-6">
                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input-field"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="label">Destination Chain</label>
                    <select
                      value={destinationChainId}
                      onChange={(e) => setDestinationChainId(e.target.value)}
                      className="select-field"
                    >
                      {chains.map((chain: Chain) => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Recipient Address</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="input-field"
                      placeholder="Enter recipient address"
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
                  )}
                  <button
                    onClick={handleSendPayment}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Sending...' : 'Send Payment'}
                  </button>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Transaction History</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {transactions.length === 0 ? (
                    <div className="transaction-card">
                      <p className="text-gray-500 text-center">No transactions yet</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.hash} className="transaction-card">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <p className="text-gray-900 font-medium">Amount: {tx.amount}</p>
                            <p className="text-gray-600 text-sm">To: {tx.recipient}</p>
                            <p className="text-gray-600 text-sm">Chain: {tx.destinationChain}</p>
                          </div>
                          <a
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 text-sm transition-colors duration-200"
                          >
                            View on Explorer
                          </a>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Transaction Simulator</h2>
              <TransactionSimulator
                chains={chains}
                onSimulate={simulateTransaction}
              />
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Connect your wallet to get started</h2>
            <p className="text-gray-600">Please connect your wallet to make cross-chain payments</p>
          </div>
        )}
      </div>
    </main>
  );
}
