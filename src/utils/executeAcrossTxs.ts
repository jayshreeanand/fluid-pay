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

  const client = walletClient as unknown as AcrossWalletClient;
  
  const crossChainMessage = await createMessageFn();
  if (!crossChainMessage) {
    throw new Error('Failed to create cross-chain message');
  }

  // No need to validate fallback recipient as it's already set in createCrossChainMessage
  // const fallbackRecipient = config.fallbackRecipient && isAddress(config.fallbackRecipient) 
  //   ? config.fallbackRecipient as Address
  //   : address;

  try {
    const quote = await client.getQuote({
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

    const txReceipt = await client.executeAcrossTxs(quote, {
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
