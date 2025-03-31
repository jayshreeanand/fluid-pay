import { type Address, type Hex, type PublicClient, type Chain } from 'viem';
import { type ConfiguredWalletClient } from '@across-protocol/app-sdk';

export interface RPC {
  url: string;
  chainId: number;
  name?: string;
}

export interface RpcUrls {
  [chainId: number]: string; // Maps chain IDs to their corresponding RPC URLs
}

export interface VirtualTestnetParams {
  id: number;
  chainId: number;
  rpcUrl?: string; // Optional in case the RPC is not found
  blockExplorerUrl?: string; // Optional in case the RPC is not found
  project: string;
  tenderlyName: string;
  testnet: boolean;
}

export interface QuoteDeposit {
  inputAmount: bigint;
  outputAmount: bigint;
  recipient: Address;
  message: Hex;
  quoteTimestamp: number;
  exclusiveRelayer: Address;
  exclusivityDeadline: number;
  spokePoolAddress: Address;
  destinationSpokePoolAddress: Address;
  originChainId: number;
  destinationChainId: number;
  inputToken: Address;
  outputToken: Address;
  isNative?: boolean;
}

export type CreateMessageFn = (
  recipient: Address,
  privateKey?: string
) => Promise<CrossChainMessage | undefined>;

export interface CrossChainMessage {
  actions: CrossChainAction[];
  fallbackRecipient: Address;
}

export interface CrossChainAction {
  target: Address;
  callData: Hex;
  value: bigint;
  update?: (outputAmount: bigint) => CrossChainAction;
}

export interface SetupResult {
  walletClient: ConfiguredWalletClient | undefined;
  chain: VirtualTestnetParams | Chain | undefined;
  address: Address | undefined;
  publicClient?: PublicClient | undefined;
  privateKey: `0x${string}` | undefined;
}

export interface Config {
  sourceChainId: number;
  destinationChainId: number;
  inputToken: Address;
  outputToken: Address;
  amount: bigint;
  contractAddress: Address;
  tenderly?: {
    TENDERLY_ACCESS_KEY: string;
    TENDERLY_ACCOUNT: string;
    TENDERLY_PROJECT: string;
  };
}

export interface TenderlyConfig {
  TENDERLY_ACCESS_KEY: string;
  TENDERLY_ACCOUNT: string;
  TENDERLY_PROJECT: string;
}

export type EligibleChain = Chain & {
  testnet: boolean;
  tenderlyName: string;
};

export interface ChainConfig {
  chainId: number;
  rpc: RPC;
  publicClient: PublicClient;
  walletClient: ConfiguredWalletClient;
}

export interface ChainConfigs {
  [chainId: number]: ChainConfig;
}
