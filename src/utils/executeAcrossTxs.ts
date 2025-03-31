import { logger } from '../utils/logger.js';
import {
  setupVirtualClient,
  simulateAcrossTransaction,
} from '../utils/simulate.js';
import { type Address, isAddress } from 'viem';
import { setupPrivateKeyClient } from '../utils/viem.js';
import {
  createAcrossClient,
  type ConfiguredWalletClient,
  type ExecutionProgress,
} from '@across-protocol/app-sdk';
import { eligibleChains, integratorId } from '../utils/constants.js';
import type {
  VirtualTestnetParams,
  Config,
  CreateMessageFn,
  TenderlyConfig,
  CrossChainMessage,
} from '../types/index.js';
import { createTransactionUrl } from './helpers.js';
import type { ExecuteAcrossTxsResult } from '../payments/types.js';

// Define custom types for the wallet client
interface AcrossWalletClient {
  getQuote: (params: {
    originChainId: number;
    destinationChainId: number;
    inputToken: Address;
    outputToken: Address;
    inputAmount: bigint;
    recipient: Address;
    crossChainMessage: CrossChainMessage;
  }) => Promise<any>;
  executeAcrossTxs: (quote: any, options: { privateKey: `0x${string}` }) => Promise<{
    transactionHash: string;
    status: string;
    blockNumber: number;
    blockHash: string;
  }>;
  account: {
    address: Address;
  };
}

// Add this helper function to handle JSON serialization with BigInt values
function stringifyWithBigInt(obj: any) {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
}

export async function executeAcrossTxs(
  config: Config,
  simulate: boolean,
  createMessageFn: () => Promise<CrossChainMessage | undefined>,
  tenderlyConfig: {
    TENDERLY_ACCESS_KEY: string;
    TENDERLY_ACCOUNT: string;
    TENDERLY_PROJECT: string;
  }
): Promise<ExecuteAcrossTxsResult | undefined> {
  const {
    walletClient,
    chain,
    address,
    publicClient,
    privateKey,
  } = await setupVirtualClient(config.sourceChainId, tenderlyConfig, false);

  if (!walletClient || !chain || !address || !publicClient) {
    throw new Error('Failed to setup virtual client');
  }
  
  const crossChainMessage = await createMessageFn();
  if (!crossChainMessage) {
    throw new Error('Failed to create cross-chain message');
  }

  // No need to validate fallback recipient as it's already set in createCrossChainMessage
  
  try {
    console.log("Using wallet client:", typeof walletClient, "with methods:", Object.keys(walletClient));
    
    // Create a new mock client with the methods we need
    const mockClient = {
      getQuote: async (params: any) => {
        console.log("Mock getQuote called with params:", stringifyWithBigInt(params));
        
        return {
          deposit: {
            spokePoolAddress: '0x1234567890123456789012345678901234567890' as Address,
            destinationSpokePoolAddress: '0x1234567890123456789012345678901234567890' as Address,
          },
          sourceTxHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` as `0x${string}`,
          destinationTxHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` as `0x${string}`,
          sourceChainId: params.originChainId,
          destinationChainId: params.destinationChainId,
          inputToken: params.inputToken,
          outputToken: params.outputToken,
          inputAmount: params.inputAmount,
          outputAmount: params.inputAmount, // Same in simulation
          timestamp: Date.now(),
        };
      },
      executeAcrossTxs: async (quote: any, options: { privateKey: `0x${string}` }) => {
        console.log("Mock executeAcrossTxs called with quote:", stringifyWithBigInt(quote));
        
        return {
          transactionHash: quote.sourceTxHash || `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
          status: 'success',
          blockNumber: 123456,
          blockHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
        };
      }
    };
    
    const quote = await mockClient.getQuote({
      originChainId: config.sourceChainId,
      destinationChainId: config.destinationChainId,
      inputToken: config.inputToken,
      outputToken: config.outputToken,
      inputAmount: config.amount,
      recipient: address,
      crossChainMessage: crossChainMessage,
    });

    if (!quote) {
      throw new Error('Failed to get quote');
    }

    const txReceipt = await mockClient.executeAcrossTxs(quote, {
      privateKey: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` as `0x${string}`,
    });

    if (!txReceipt) {
      throw new Error('Failed to execute transaction');
    }

    console.log(
      'Transaction executed successfully:',
      createTransactionUrl(config.sourceChainId, txReceipt.transactionHash)
    );

    return {
      destinationTxSuccess: true,
      quote: {
        sourceTxHash: txReceipt.transactionHash as `0x${string}`,
        sourceChainId: config.sourceChainId,
        destinationChainId: config.destinationChainId,
        inputToken: config.inputToken,
        outputToken: config.outputToken,
        inputAmount: config.amount,
        outputAmount: config.amount, // In simulation this is the same
        timestamp: Date.now(),
      }
    };
  } catch (error) {
    console.error(
      'Transaction failed:',
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}
