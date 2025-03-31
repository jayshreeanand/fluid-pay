import { parseUnits, type Address } from 'viem';
import type { Config } from '../../types/index.js';

// Supported payment tokens on each chain
export const PAYMENT_TOKENS = {
  // Ethereum Mainnet
  1: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  // Arbitrum
  42161: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  // Base
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  },
  // Optimism
  10: {
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
} as const;

// Payment Hub contract addresses on each chain
export const PAYMENT_HUB_CONTRACTS = {
  1: '0x1234567890123456789012345678901234567890' as Address, // Ethereum
  42161: '0x1234567890123456789012345678901234567890' as Address, // Arbitrum
  8453: '0x1234567890123456789012345678901234567890' as Address, // Base
  10: '0x1234567890123456789012345678901234567890' as Address, // Optimism
} as const;

// Default configuration for the example
export const config: Config = {
  // We'll use Base as source chain and Arbitrum as destination for this example
  contractAddress: PAYMENT_HUB_CONTRACTS[42161], // Arbitrum payment hub
  sourceChain: 8453, // Base
  destinationChain: 42161, // Arbitrum
  inputToken: PAYMENT_TOKENS[8453].USDC as `0x${string}`, // USDC on Base
  outputToken: PAYMENT_TOKENS[42161].USDC as `0x${string}`, // USDC on Arbitrum
  amount: parseUnits('100', 6), // 100 USDC
  fallbackRecipient: '', // Will be set in the message.ts
};

// Payment types supported by the hub
export enum PaymentType {
  OneTime = 0,
  Recurring = 1,
  Batch = 2,
  Stream = 3,
}

// Payment status tracking
export enum PaymentStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
}

// Configuration for different payment types
export interface PaymentConfig {
  type: PaymentType;
  sender: Address;
  recipient?: Address;
  recipients?: { address: Address; amount: bigint }[];
  amount: bigint;
  token: Address;
  metadata?: string;
  // Optional fields for specific payment types
  frequency?: number; // For recurring payments (in seconds)
  endTime?: number; // For recurring payments and streams (Unix timestamp)
} 