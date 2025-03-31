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
  // const fallbackRecipient = config.fallbackRecipient && isAddress(config.fallbackRecipient) 
  //   ? config.fallbackRecipient as Address
  //   : address;

  try {
    const quote = await walletClient.getQuote({
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

    const txReceipt = await walletClient.executeAcrossTxs(quote, {
      privateKey,
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
        sourceTxHash: txReceipt.transactionHash,
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
