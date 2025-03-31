import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  RPC,
} from '../types/index.js';
import { eligibleChains, DEFAULT_TENDERLY_CONFIG } from './constants.js';
import { logger } from './logger.js';
import dotenv from 'dotenv';
import { appendIdToFile } from './helpers.js';
import { type Address } from 'viem';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getTenderlyConfig() {
  return {
    TENDERLY_ACCESS_KEY:
      process.env.TENDERLY_ACCESS_KEY ||
      DEFAULT_TENDERLY_CONFIG.TENDERLY_ACCESS_KEY,
    TENDERLY_ACCOUNT:
      process.env.TENDERLY_ACCOUNT || DEFAULT_TENDERLY_CONFIG.TENDERLY_ACCOUNT,
    TENDERLY_PROJECT:
      process.env.TENDERLY_PROJECT || DEFAULT_TENDERLY_CONFIG.TENDERLY_PROJECT,
  };
}

export async function createVirtualTestnet(
  chainId: number,
  tenderlyConfig: TenderlyConfig
) {
  if (!tenderlyConfig.TENDERLY_ACCESS_KEY || !tenderlyConfig.TENDERLY_ACCOUNT) {
    logger.error('No TENDERLY_ACCESS_KEY or TENDERLY_ACCOUNT');
    return;
  }

  const timestamp = Date.now();
  const options = {
    method: 'POST',
    url: `https://api.tenderly.co/api/v1/account/${tenderlyConfig.TENDERLY_ACCOUNT}/project/${tenderlyConfig.TENDERLY_PROJECT}/vnets`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Access-Key': tenderlyConfig.TENDERLY_ACCESS_KEY,
    },
    data: {
      slug: `my-staging-testnet-${chainId}-${timestamp}`, // Use chainId and timestamp for slug
      display_name: `My Staging TestNet - Chain ${chainId} - ${timestamp}`, // Use chainId and timestamp for display_name
      fork_config: { network_id: chainId, block_number: 'latest' },
      virtual_network_config: { chain_config: { chain_id: chainId } },
      sync_state_config: { enabled: false },
      explorer_page_config: {
        enabled: true,
        verification_visibility: 'src',
      },
    },
  };

  try {
    const { data } = await axios.request(options);

    const chainInfo = eligibleChains.find((chain) => chain.id === chainId);
    if (!chainInfo) {
      logger.error(`No chain info found for chain ${chainId}`);
      return;
    }

    const extractedData: VirtualTestnetParams = {
      id: data.id,
      chainId: data.virtual_network_config.chain_config.chain_id,
      rpcUrl: data.rpcs.find((rpc: RPC) => rpc.name === 'Admin RPC')?.url, // URL for "Admin RPC"
      blockExplorerUrl: data.rpcs.find((rpc: RPC) => rpc.name === 'Public RPC')
        ?.url, // URL for "Public RPC"
      project: tenderlyConfig.TENDERLY_ACCOUNT,
      tenderlyName: chainInfo.tenderlyName,
      testnet: chainInfo.testnet,
    };

    logger.info('Created Virtual network with id: ' + extractedData.id);

    appendIdToFile(extractedData.id.toString());

    return extractedData;
  } catch (error) {
    logger.error('Error setting up virtual testnet: ' + error);
    return undefined;
  }
}

async function deleteVirtualTestnet(
  vnetId: string,
  tenderlyConfig: TenderlyConfig
) {
  if (!tenderlyConfig.TENDERLY_ACCESS_KEY) {
    logger.error('No TENDERLY_ACCESS_KEY');
    return;
  }
  const options = {
    method: 'DELETE',
    url: `https://api.tenderly.co/api/v1/account/${tenderlyConfig.TENDERLY_ACCOUNT}/project/${tenderlyConfig.TENDERLY_PROJECT}/vnets/${vnetId}`,
    headers: {
      Accept: 'application/json',
      'X-Access-Key': tenderlyConfig.TENDERLY_ACCESS_KEY,
    },
  };

  try {
    const { data } = await axios.request(options);
    logger.info('- Testnet deleted with id: ' + vnetId);
    return data;
  } catch (error) {
    logger.error('Error deleting virtual testnet' + error);
  }
}

export async function deleteTestnets(tenderlyConfig: TenderlyConfig) {
  try {
    const filePath = path.join(__dirname, '..', '..', 'testnet-ids.json'); // Adjusted path to root
    const data = await fs.readFile(filePath, 'utf-8');
    let testnetIds: string[] = JSON.parse(data);

    for (const id of testnetIds) {
      await deleteVirtualTestnet(id, tenderlyConfig);
    }

    // Clear the array after processing
    testnetIds = [];

    // Write the updated array back to the file
    await fs.writeFile(filePath, JSON.stringify(testnetIds, null, 2), 'utf-8');
  } catch (error) {
    logger.error(`Error processing testnet IDs: ${error}`);
  }
}

export function generateVirtualConfig(virtualChain: VirtualTestnetParams) {
  if (!virtualChain.rpcUrl || !virtualChain.blockExplorerUrl) {
    logger.error('Unable to create virtual config');
    return;
  }

  return {
    id: virtualChain.chainId,
    name: `Virtual ${virtualChain.chainId}`,
    nativeCurrency: { name: 'VETH', symbol: 'vETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: [virtualChain.rpcUrl], // Use non-null assertion
      },
    },
    blockExplorers: {
      default: {
        name: 'Tenderly Explorer',
        url: virtualChain.blockExplorerUrl,
      },
    },
    testnet: virtualChain.testnet,
  };
}

export interface TenderlyConfig {
  TENDERLY_ACCESS_KEY: string;
  TENDERLY_ACCOUNT: string;
  TENDERLY_PROJECT: string;
}

export interface VirtualTestnetParams {
  id: number;
  chainId: number;
  rpcUrl?: string;
  blockExplorerUrl?: string;
  project: string;
  tenderlyName: string;
  testnet: boolean;
}

// Add this helper function to handle JSON serialization with BigInt values
function stringifyWithBigInt(obj: any) {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
}

/**
 * Sets up a virtual client for testing/simulation
 */
export async function setupVirtualClient(
  chainId: number,
  tenderlyConfig: TenderlyConfig,
  isDestination: boolean
): Promise<{
  walletClient: any;
  chain: VirtualTestnetParams;
  address: Address;
  publicClient: any;
  privateKey: `0x${string}`;
}> {
  const { TENDERLY_ACCESS_KEY, TENDERLY_ACCOUNT, TENDERLY_PROJECT } = tenderlyConfig;

  try {
    console.log("Setting up a virtual client for chain ID:", chainId);
    
    // Generate a mock fork ID
    const forkId = `mock-fork-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Generate a random private key for the virtual client
    const privateKey = `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` as `0x${string}`;
    
    // Mock Address for testing
    const mockAddress = '0x1234567890123456789012345678901234567890' as Address;

    // Create a virtual testnet params object
    const virtualTestnet: VirtualTestnetParams = {
      id: Date.now(),
      chainId,
      rpcUrl: `https://mock-rpc-${chainId}.example.com`,
      blockExplorerUrl: `https://mock-explorer-${chainId}.example.com`,
      project: TENDERLY_PROJECT,
      tenderlyName: isDestination ? 'destination' : 'origin',
      testnet: true,
    };

    // This is a mock implementation for simulation purposes
    const mockWalletClient = {
      getQuote: async (params: any) => {
        console.log("Getting quote with params:", stringifyWithBigInt(params));
        
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
        console.log("Executing transaction with quote:", stringifyWithBigInt(quote));
        
        return {
          transactionHash: quote.sourceTxHash || `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
          status: 'success',
          blockNumber: 123456,
          blockHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
        };
      },
      account: {
        address: mockAddress,
      },
      request: async <T>(params: any): Promise<T> => {
        console.log("Request with params:", stringifyWithBigInt(params));
        return `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` as unknown as T;
      }
    };

    const mockPublicClient = {
      // Public client methods
      getBalance: async () => BigInt(1000000000000000000), // 1 ETH
      getBlock: async () => ({ number: 123456, timestamp: Date.now() }),
      getTransaction: async () => ({
        hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
        blockNumber: 123456,
      }),
    };

    console.log(`Successfully set up virtual client for chain ${chainId}`);
    
    return {
      walletClient: mockWalletClient,
      chain: virtualTestnet,
      address: mockAddress,
      publicClient: mockPublicClient,
      privateKey,
    };
  } catch (error) {
    console.error("Error setting up virtual client:", error);
    throw new Error(`Failed to create Tenderly fork: ${error instanceof Error ? error.message : String(error)}`);
  }
}
