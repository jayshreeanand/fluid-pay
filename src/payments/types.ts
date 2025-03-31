import { type Address } from 'viem';

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