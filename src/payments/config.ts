import { parseUnits, type Address } from 'viem';
import type { Config } from '../types/index.js';

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

// Payment types supported by the hub
export enum PaymentType {
  OneTime = 'OneTime',
  Recurring = 'Recurring',
  Batch = 'Batch',
  Stream = 'Stream',
}

// Payment status tracking
export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

// Configuration for different payment types
export interface PaymentConfig {
  type: PaymentType;
  sender: Address;
  recipient?: Address;
  recipients?: { address: Address; amount: bigint }[];
  token: Address;
  amount: bigint;
  metadata?: string;
  sourceChainId: number;
  destinationChainId: number;
  inputToken: Address;
  outputToken: Address;
  frequency?: number; // For recurring payments
  endTime?: number; // For recurring payments and streams
}

// Helper function to validate payment config
export function validatePaymentConfig(paymentConfig: PaymentConfig): void {
  if (!paymentConfig.token) {
    throw new Error('Token is required');
  }

  if (paymentConfig.type === PaymentType.Batch) {
    if (!paymentConfig.recipients || paymentConfig.recipients.length === 0) {
      throw new Error('At least one recipient is required for batch payments');
    }
  } else {
    if (!paymentConfig.recipient) {
      throw new Error('Recipient is required for non-batch payments');
    }
  }

  if (paymentConfig.type === PaymentType.Recurring) {
    if (!paymentConfig.frequency) {
      throw new Error('Frequency is required for recurring payments');
    }
    if (!paymentConfig.endTime) {
      throw new Error('End time is required for recurring payments');
    }
  }

  if (paymentConfig.type === PaymentType.Stream) {
    if (!paymentConfig.endTime) {
      throw new Error('End time is required for streams');
    }
  }
}

// Default configuration for the payment hub
export const config: Config = {
  sourceChainId: 8453,
  destinationChainId: 42161,
  inputToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  outputToken: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  amount: BigInt(1000000),
  contractAddress: '0x1234567890123456789012345678901234567890',
  tenderly: {
    TENDERLY_ACCESS_KEY: '',
    TENDERLY_ACCOUNT: '',
    TENDERLY_PROJECT: '',
  },
}; 