import { type PaymentConfig, PaymentStatus } from './config.js';
import { paymentTracker } from './tracker.js';

export interface Receipt {
  id: string;
  paymentId: string;
  sender: string;
  recipient: string;
  amount: bigint;
  token: string;
  timestamp: number;
  status: PaymentStatus;
  metadata?: string;
  txHash?: string;
  error?: string;
}

export function generateReceipt(paymentId: string): Receipt {
  const payment = paymentTracker.getPayment(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }

  return {
    id: Math.random().toString(36).substring(7),
    paymentId,
    sender: payment.sender,
    recipient: payment.recipient,
    amount: payment.amount,
    token: payment.token,
    timestamp: payment.timestamp,
    status: payment.status,
    metadata: payment.metadata,
    txHash: payment.txHash,
    error: payment.error,
  };
}

export class ReceiptGenerator {
  static generateReceipt(paymentId: string): Receipt {
    const payment = paymentTracker.getPayment(paymentId);
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    const receiptId = `RCPT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    return {
      id: receiptId,
      paymentId,
      sender: payment.sender,
      recipient: payment.recipient || '',
      amount: payment.amount,
      token: payment.token,
      timestamp: payment.timestamp,
      status: 'completed',
      metadata: payment.metadata,
    };
  }

  static generateReceipts(payments: string[]): Receipt[] {
    return payments.map((paymentId) => this.generateReceipt(paymentId));
  }
} 