import { type Address } from 'viem';
import type { Config } from '../../types/index.js';

export interface ExecuteAcrossTxsResult {
  destinationTxSuccess: boolean;
  quote: {
    // Transaction details
    sourceTxHash: `0x${string}`;
    destinationTxHash?: `0x${string}`;
    // Chain details
    sourceChainId: number;
    destinationChainId: number;
    // Token details
    inputToken: Address;
    outputToken: Address;
    // Amount details
    inputAmount: bigint;
    outputAmount: bigint;
    // Additional details
    timestamp: number;
    gasFee?: bigint;
    bridgeFee?: bigint;
    relayerFee?: bigint;
  };
}

export interface PaymentHubConfig extends Config {
  // Additional payment hub specific configuration
  supportedChains: number[];
  supportedTokens: Record<number, Record<string, Address>>;
  paymentHubContracts: Record<number, Address>;
  defaultGasLimit: bigint;
  defaultGasPrice: bigint;
}

export * from './types/index.js'; 