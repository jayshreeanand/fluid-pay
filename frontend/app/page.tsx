'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { useCrossChainPayment } from './hooks/useCrossChainPayment';

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
  const [amount, setAmount] = useState('');
  const [destinationChainId, setDestinationChainId] = useState('1');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const chains: Chain[] = [
    {
      id: 1,
      name: 'Ethereum',
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
      const chainName = selectedChain?.name;
      const newTransaction: Transaction = {
        hash: result.transactionHash,
        amount,
        destinationChain: typeof chainName === 'string' ? chainName : 'Unknown Chain',
        recipient: recipientAddress,
        timestamp: Date.now(),
      };
      setTransactions([newTransaction, ...transactions]);
      setAmount('');
      setRecipientAddress('');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Cross-Chain Payment Demo</h1>
        <ConnectButton />
      </div>

      {isConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Destination Chain</label>
                <select
                  value={destinationChainId}
                  onChange={(e) => setDestinationChainId(e.target.value)}
                  className="input-field"
                >
                  {chains.map((chain: Chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="input-field"
                  placeholder="Enter recipient address"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <button
                onClick={handleSendPayment}
                disabled={isLoading}
                className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Sending...' : 'Send Payment'}
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="transaction-card">
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.hash} className="transaction-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">Amount: {tx.amount}</p>
                        <p className="text-sm">To: {tx.recipient}</p>
                        <p className="text-sm">Chain: {tx.destinationChain}</p>
                      </div>
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View on Explorer
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Connect your wallet to get started</h2>
          <p className="text-gray-400">Please connect your wallet to make cross-chain payments</p>
        </div>
      )}
    </main>
  );
}
