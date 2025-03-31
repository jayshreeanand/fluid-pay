import { type Address } from 'viem';
import { PaymentStatus } from './config.js';
import { paymentTracker } from './tracker.js';

export interface Receipt {
  paymentId: string;
  status: PaymentStatus;
  sender: Address;
  recipient?: Address;
  recipients?: { address: Address; amount: bigint }[];
  amount: bigint;
  token: Address;
  metadata?: string;
  transactionHash?: string;
  error?: string;
  timestamp: number;
}

export function generateReceipt(paymentId: string): Receipt {
  const payment = paymentTracker.getPayment(paymentId);
  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  const status = paymentTracker.getPaymentStatus(paymentId);
  const transactionHash = paymentTracker.getTransactionHash(paymentId);
  const error = paymentTracker.getError(paymentId);

  return {
    paymentId,
    status,
    sender: payment.sender,
    recipient: payment.recipient,
    recipients: payment.recipients,
    amount: payment.amount,
    token: payment.token,
    metadata: payment.metadata,
    transactionHash,
    error,
    timestamp: Date.now(),
  };
}

// Deprecated - use generateReceipt function instead
export class ReceiptGenerator {
  static generateReceipt(paymentId: string): Receipt {
    const payment = paymentTracker.getPayment(paymentId);
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    return {
      paymentId,
      sender: payment.sender,
      recipient: payment.recipient,
      recipients: payment.recipients,
      amount: payment.amount,
      token: payment.token,
      status: PaymentStatus.Completed,
      metadata: payment.metadata,
      transactionHash: payment.transactionHash,
      error: payment.error,
      timestamp: Date.now(),
    };
  }

  static generateReceipts(payments: string[]): Receipt[] {
    return payments.map((paymentId) => this.generateReceipt(paymentId));
  }
} 