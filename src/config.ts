import { type Config } from './types/index.js';

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