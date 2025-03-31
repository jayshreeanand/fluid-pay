import { type Address, encodeFunctionData, parseAbi } from 'viem';
import { config } from './config.js';
import type { CrossChainMessage, CrossChainAction } from '../types/index.js';
import { PaymentType, type PaymentConfig } from './config.js';

// ABI for the payment hub functions
const PAYMENT_HUB_ABI = [
  'function sendPayment(address recipient, address token, uint256 amount)',
  'function sendPaymentWithMetadata(address recipient, address token, uint256 amount, bytes calldata metadata)',
  'function sendBatchPayment(address[] calldata recipients, address token, uint256[] calldata amounts)',
  'function sendBatchPaymentWithMetadata(address recipient, address token, uint256[] calldata amounts, bytes[] calldata metadata)',
] as const;

// ABI for ERC20 approve function
const APPROVE_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
] as const;

// Helper function to generate approve call data
function generateApproveCallData(
  spender: Address,
  amount: bigint
): `0x${string}` {
  return encodeFunctionData({
    abi: parseAbi(APPROVE_ABI),
    args: [spender, amount],
  });
}

function encodeMetadata(metadata: string): `0x${string}` {
  return `0x${Buffer.from(metadata).toString('hex')}` as `0x${string}`;
}

export function createCrossChainMessage(paymentConfig: PaymentConfig): CrossChainMessage {
  if (!paymentConfig.token) {
    throw new Error('Token is required');
  }

  const approveAction: CrossChainAction = {
    target: paymentConfig.token,
    callData: generateApproveCallData(config.contractAddress, paymentConfig.amount),
    value: 0n,
    update: (outputAmount: bigint) => ({
      target: paymentConfig.token,
      callData: generateApproveCallData(config.contractAddress, outputAmount),
      value: 0n,
    }),
  };

  const paymentAction: CrossChainAction = {
    target: config.contractAddress,
    callData: generatePaymentCallData(paymentConfig),
    value: 0n,
    update: (outputAmount: bigint) => ({
      target: config.contractAddress,
      callData: generatePaymentCallData({
        ...paymentConfig,
        amount: outputAmount,
      }),
      value: 0n,
    }),
  };

  return {
    actions: [approveAction, paymentAction],
    fallbackRecipient: paymentConfig.sender,
  };
}

// Helper function to generate payment call data based on payment type
function generatePaymentCallData(
  payment: PaymentConfig
): `0x${string}` {
  if (!payment.token) {
    throw new Error('Token is required');
  }

  switch (payment.type) {
    case PaymentType.OneTime: {
      if (!payment.recipient) {
        throw new Error('Recipient is required for one-time payments');
      }
      return encodeFunctionData({
        abi: parseAbi([PAYMENT_HUB_ABI[payment.metadata ? 1 : 0]]),
        args: payment.metadata
          ? [payment.recipient, payment.token, payment.amount, encodeMetadata(payment.metadata)]
          : [payment.recipient, payment.token, payment.amount],
      });
    }
    case PaymentType.Batch: {
      if (!payment.recipients || payment.recipients.length === 0) {
        throw new Error('At least one recipient is required for batch payments');
      }
      return encodeFunctionData({
        abi: parseAbi([PAYMENT_HUB_ABI[2]]),
        args: [
          payment.recipients.map((r) => r.address),
          payment.token,
          payment.recipients.map((r) => r.amount),
        ],
      });
    }
    case PaymentType.Recurring:
    case PaymentType.Stream: {
      if (!payment.recipient) {
        throw new Error('Recipient is required for recurring/stream payments');
      }
      if (!payment.endTime) {
        throw new Error('End time is required for recurring/stream payments');
      }
      return encodeFunctionData({
        abi: parseAbi([PAYMENT_HUB_ABI[1]]),
        args: [
          payment.recipient,
          payment.token,
          payment.amount,
          encodeMetadata(payment.metadata || ''),
        ],
      });
    }
    default:
      throw new Error(`Unsupported payment type: ${payment.type}`);
  }
} 