import { type Address, encodeFunctionData, parseAbiItem } from 'viem';
import { config } from './config.js';
import type { CrossChainMessage } from '../../types/index.js';
import type { PaymentConfig } from './config.js';
import { PaymentType } from './config.js';

// ABI for the payment hub functions
const PAYMENT_HUB_ABI = [
  // One-time payment
  'function sendPayment(address recipient, address token, uint256 amount, string metadata)',
  // Recurring payment
  'function setupRecurringPayment(address recipient, address token, uint256 amount, uint256 frequency, uint256 endTime, string metadata)',
  // Batch payment
  'function sendBatchPayment(address[] recipients, uint256[] amounts, address token, string metadata)',
  // Payment streaming
  'function startStream(address recipient, address token, uint256 amount, uint256 endTime, string metadata)',
] as const;

// ABI for ERC20 approve function
const APPROVE_ABI = 'function approve(address spender, uint256 value)' as const;

// Helper function to generate approve call data
function generateApproveCallData(
  spender: Address,
  amount: bigint
): `0x${string}` {
  return encodeFunctionData({
    abi: [parseAbiItem(APPROVE_ABI)],
    args: [spender, amount],
  });
}

export async function createCrossChainMessage(
  address: Address,
  paymentConfig?: PaymentConfig
): Promise<CrossChainMessage> {
  // If no payment config is provided, use default one-time payment
  const payment = paymentConfig || {
    type: PaymentType.OneTime,
    sender: address,
    recipient: address,
    amount: config.amount,
    token: config.outputToken as Address,
    metadata: 'Default one-time payment',
  };

  if (!payment.token || !payment.recipient) {
    throw new Error('Token and recipient are required');
  }

  return {
    fallbackRecipient: address,
    actions: [
      // First action: Approve the payment hub to spend tokens
      {
        target: payment.token,
        callData: generateApproveCallData(
          config.contractAddress,
          payment.amount
        ),
        value: 0n,
        update: (outputAmount: bigint) => ({
          callData: generateApproveCallData(
            config.contractAddress,
            outputAmount
          ),
        }),
      },
      // Second action: Execute the payment
      {
        target: config.contractAddress,
        callData: generatePaymentCallData(payment),
        value: 0n,
        update: (outputAmount: bigint) => ({
          callData: generatePaymentCallData({
            ...payment,
            amount: outputAmount,
          }),
        }),
      },
    ],
  };
}

// Helper function to generate payment call data based on payment type
function generatePaymentCallData(payment: PaymentConfig): `0x${string}` {
  if (!payment.token || !payment.recipient) {
    throw new Error('Token and recipient are required');
  }

  switch (payment.type) {
    case PaymentType.OneTime:
      return encodeFunctionData({
        abi: [parseAbiItem(PAYMENT_HUB_ABI[0])],
        args: [
          payment.recipient,
          payment.token,
          payment.amount,
          payment.metadata || '',
        ],
      });

    case PaymentType.Recurring:
      if (!payment.frequency || !payment.endTime) {
        throw new Error(
          'Frequency and endTime required for recurring payments'
        );
      }
      return encodeFunctionData({
        abi: [parseAbiItem(PAYMENT_HUB_ABI[1])],
        args: [
          payment.recipient,
          payment.token,
          payment.amount,
          BigInt(payment.frequency),
          BigInt(payment.endTime),
          payment.metadata || '',
        ],
      });

    case PaymentType.Batch:
      if (!payment.recipients) {
        throw new Error('Recipients array required for batch payments');
      }
      return encodeFunctionData({
        abi: [parseAbiItem(PAYMENT_HUB_ABI[2])],
        args: [
          payment.recipients.map((r) => r.address),
          payment.recipients.map((r) => r.amount),
          payment.token,
          payment.metadata || '',
        ],
      });

    case PaymentType.Stream:
      if (!payment.endTime) {
        throw new Error('EndTime required for payment streaming');
      }
      return encodeFunctionData({
        abi: [parseAbiItem(PAYMENT_HUB_ABI[3])],
        args: [
          payment.recipient,
          payment.token,
          payment.amount,
          BigInt(payment.endTime),
          payment.metadata || '',
        ],
      });

    default:
      throw new Error('Unsupported payment type');
  }
} 