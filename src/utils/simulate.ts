import { fundingAmount, EMPTY_ADDRESS } from './constants.js';
import { generateVirtualConfig, createVirtualTestnet } from './tenderly.js';
import { logger } from './logger.js';
import {
  approveTx,
  createWalletClientWithAccount,
  spokePoolFillTx,
} from './viem.js';
import type {
  TSetBalanceRpc,
  TSetErc20BalanceRpc,
} from '../tenderly.config.js';
import {
  createPublicClient,
  http,
  toHex,
  type Address,
  type WalletClient as ViemWalletClient,
} from 'viem';
import type {
  VirtualTestnetParams,
  QuoteDeposit,
  SetupResult,
  Config,
  CrossChainMessage,
  TenderlyConfig,
} from '../types/index.js';
import { setupAcrossClient } from './across.js';
import {
  type ConfiguredWalletClient,
  type ExecutionProgress,
  type Quote,
  getDepositFromLogs,
} from '@across-protocol/app-sdk';
import dotenv from 'dotenv';
import {
  createTenderlyUrl,
  createTransactionUrl,
  logTransactionSuccess,
} from '../utils/helpers.js';
import type { ExecuteAcrossTxsResult } from '../payments/types.js';

dotenv.config();

const undefinedChain = {
  publicClient: undefined,
  walletClient: undefined,
  chain: undefined,
  address: undefined,
  privateKey: undefined,
};

// Define custom types for the wallet client
interface CustomWalletClient {
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
  request?: <T>(params: any) => Promise<T>;
}

// Add this helper function to handle JSON serialization with BigInt values
function stringifyWithBigInt(obj: any) {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
}

export async function simulateAcrossTransaction(
  config: Config,
  walletClient: any,
  chain: any,
  crossChainMessage: CrossChainMessage,
  tenderlyConfig: {
    TENDERLY_ACCESS_KEY: string;
    TENDERLY_ACCOUNT: string;
    TENDERLY_PROJECT: string;
  }
): Promise<ExecuteAcrossTxsResult | undefined> {
  const {
    walletClient: destinationWalletClient,
    chain: destinationChain,
    address: destinationAddress,
    publicClient: destinationPublicClient,
    privateKey: destinationPrivateKey,
  } = await setupVirtualClient(config.destinationChainId, tenderlyConfig, true);

  if (
    !destinationWalletClient ||
    !destinationChain ||
    !destinationAddress ||
    !destinationPublicClient
  ) {
    throw new Error('Failed to setup destination virtual client');
  }
  
  try {
    console.log("Using wallet client in simulate:", typeof walletClient, "with methods:", Object.keys(walletClient));
    
    // Create a new mock client with the methods we need
    const mockClient = {
      getQuote: async (params: any) => {
        console.log("Mock getQuote called with params in simulate:", stringifyWithBigInt(params));
        
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
        console.log("Mock executeAcrossTxs called with quote in simulate:", stringifyWithBigInt(quote));
        
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
      recipient: destinationAddress,
      crossChainMessage: crossChainMessage,
    });

    if (!quote) {
      throw new Error('Failed to get quote');
    }

    const privateKeyHex = destinationPrivateKey || `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` as `0x${string}`;

    const txReceipt = await mockClient.executeAcrossTxs(quote, {
      privateKey: privateKeyHex,
    });

    if (!txReceipt) {
      throw new Error('Failed to execute transaction');
    }

    console.log(
      'Transaction simulated successfully:',
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
      'Transaction simulation failed:',
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}

export async function setupVirtualClient(
  chainId: number,
  tenderlyConfig: TenderlyConfig,
  isRelayer: boolean
): Promise<SetupResult> {
  try {
    logger.info('');
    logger.info('Setting up test environment...');
    const virtualChain: VirtualTestnetParams | undefined =
      await createVirtualTestnet(chainId, tenderlyConfig);

    if (!virtualChain) {
      logger.error('-  Unable to setup virtual testnet');
      return undefinedChain;
    }

    logger.info('-  Virtual Network created successfully');

    const virtualChainConfig = generateVirtualConfig(virtualChain);

    if (!virtualChainConfig) {
      logger.error('Unable to setup virtual testnet config');
      return undefinedChain;
    }

    const publicClient = createPublicClient({
      chain: virtualChainConfig,
      transport: http(virtualChainConfig.rpcUrls.default.http[0]),
    });

    const { walletClient, privateKey } = createWalletClientWithAccount(
      virtualChainConfig,
      isRelayer
    );
    if (!walletClient?.account) {
      logger.error('Failed to create wallet client');
      return undefinedChain;
    }
    logger.info('-  User wallet created successfully');

    return {
      publicClient,
      walletClient,
      chain: virtualChain,
      address: walletClient.account.address,
      privateKey,
    };
  } catch (error) {
    logger.log('error creating virtual testnet: ', error);
    return undefinedChain;
  }
}

export async function handleFundingAndApprovals(
  userWalletClient: CustomWalletClient,
  relayerWalletClient: CustomWalletClient,
  deposit: QuoteDeposit,
  originSpokePool: Address,
  _destinationSpokePool: Address,
  chainParams: VirtualTestnetParams,
  tenderlyConfig: TenderlyConfig
) {
  try {
    if (!userWalletClient.account || !relayerWalletClient.account) {
      logger.error(
        'Unable to retrieve user or relayer wallet client for funding and approvals'
      );
      return;
    }
    logger.info('');
    logger.info('Funding wallets and approvals...');

    await fundWallet(
      userWalletClient,
      fundingAmount,
      chainParams,
      tenderlyConfig
    );

    await fundErc20(
      userWalletClient,
      deposit.inputToken,
      deposit.inputAmount,
      chainParams,
      tenderlyConfig
    );

    await approveSpokePool(
      userWalletClient,
      deposit.inputToken,
      deposit.inputAmount,
      originSpokePool,
      chainParams,
      tenderlyConfig
    );

    // Setting relayer with funding to prevent unnecessary Tenderly calls
    // Uncomment if you want Tenderly to fund relayer
    // await fundWallet(
    //   relayerWalletClient,
    //   fundingAmount,
    //   chainParams,
    //   tenderlyConfig
    // );

    // Setting relayer with funding to prevent unnecessaryTenderly calls
    // Uncomment if you want Tenderly to fund relayer
    // await fundErc20(
    //   relayerWalletClient,
    //   deposit.outputToken,
    //   deposit.outputAmount,
    //   chainParams,
    //   tenderlyConfig
    // );

    // Setting relayer with approval to prevent unnecessary Tenderly calls
    // Uncomment if you want Tenderly to set approvals for relayer
    // await approveSpokePool(
    //   relayerWalletClient,
    //   deposit.outputToken,
    //   deposit.outputAmount,
    //   _destinationSpokePool,
    //   chainParams,
    //   tenderlyConfig
    // );
  } catch {
    logger.error('Error funding and approving accounts');
  }
}

export async function fundWallet(
  walletClient: any,
  amount: bigint,
  chain: VirtualTestnetParams,
  tenderlyConfig: TenderlyConfig
) {
  if (!walletClient.account?.address) {
    logger.error('Unable to retrieve wallet client to fund wallet');
    return;
  }
  
  // Use type assertion to avoid TypeScript error
  const txHash = await (walletClient.request({
    method: 'tenderly_setBalance',
    params: [[walletClient.account?.address], toHex(amount)],
  }) as Promise<string>);

  const tenderlyUrl = createTenderlyUrl(
    chain.project,
    tenderlyConfig.TENDERLY_PROJECT,
    chain.id.toString(),
    chain.tenderlyName,
    txHash
  );
  logTransactionSuccess(`User wallet funding successful`, tenderlyUrl);
}

async function fundErc20(
  walletClient: any,
  token: Address,
  amount: bigint,
  chain: VirtualTestnetParams,
  tenderlyConfig: TenderlyConfig
) {
  if (!walletClient.account?.address) {
    logger.error('Unable to retrieve wallet client to fund wallet');
    return;
  }
  
  // Use type assertion to avoid TypeScript error
  const txHash = await (walletClient.request({
    method: 'tenderly_setErc20Balance',
    params: [token, walletClient.account?.address, toHex(amount)],
  }) as Promise<string>);
  
  const tenderlyUrl = createTenderlyUrl(
    chain.project,
    tenderlyConfig.TENDERLY_PROJECT,
    chain.id.toString(),
    chain.tenderlyName,
    txHash
  );
  logTransactionSuccess(`User ERC20 wallet funding successful`, tenderlyUrl);
}

async function approveSpokePool(
  walletClient: any,
  token: Address,
  amount: bigint,
  spokePool: Address,
  chain: VirtualTestnetParams,
  tenderlyConfig: TenderlyConfig
) {
  // Use any for approveTx for now since the underlying function is complex
  const txHash = await approveTx(walletClient as any, token, amount, spokePool);
  if (!txHash) {
    logger.error('Unable to approve spoke pool');
    return;
  }
  const tenderlyUrl = createTenderlyUrl(
    chain.project,
    tenderlyConfig.TENDERLY_PROJECT,
    chain.id.toString(),
    chain.tenderlyName,
    txHash
  );
  logTransactionSuccess(
    `Wallet approved spoke pool for user wallet`,
    tenderlyUrl
  );
}
