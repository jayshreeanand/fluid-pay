import { type Address } from 'viem';
import { PaymentStatus, PaymentType } from './config.js';
import { paymentTracker } from './tracker.js';

export interface Receipt {
  receiptId: string;
  paymentId: string;
  timestamp: number;
  paymentType: PaymentType;
  token: Address;
  status: string;
  txHash?: string;
  metadata?: string;
  sender: Address;
  recipient?: Address;
  recipients?: { address: Address; amount: bigint }[];
  amount: bigint;
  error?: string;
}

export class ReceiptGenerator {
  static generateReceipt(paymentId: string): Receipt {
    const payment = paymentTracker.getPayment(paymentId);
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    const receiptId = `RCPT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    return {
      receiptId,
      paymentId,
      timestamp: payment.timestamp,
      paymentType: payment.config.type,
      token: payment.config.token,
      status: PaymentStatus[payment.status],
      txHash: payment.txHash,
      metadata: payment.config.metadata,
      sender: payment.config.sender,
      recipient: payment.config.recipient,
      recipients: payment.config.recipients,
      amount: payment.config.amount,
      error: payment.error,
    };
  }

  static generateReceipts(payments: string[]): Receipt[] {
    return payments.map((paymentId) => this.generateReceipt(paymentId));
  }
} 