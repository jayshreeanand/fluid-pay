'use client';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { createPublicClient, http } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient } = {
  chains: [mainnet, polygon, optimism, arbitrum],
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http()
  })
};

const { connectors } = getDefaultWallets({
  appName: 'Cross-Chain Payment Demo',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 