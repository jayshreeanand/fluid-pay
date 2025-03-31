import { type Address } from 'viem';
import { PaymentType } from './config.js';
import { paymentTracker } from './tracker.js';

export interface Receipt {
  receiptId: string;
  paymentId: string;
  timestamp: number;
  paymentType: PaymentType;
  sender: Address;
  recipient: Address | Address[];
  amount: bigint | bigint[];
  token: Address;
  status: string;
  txHash?: string;
  metadata?: string;
  // Additional fields for specific payment types
  frequency?: number;
  endTime?: number;
  nextPaymentDate?: number;
  streamRate?: string;
  remainingAmount?: bigint;
}

export class ReceiptGenerator {
  // Generate a receipt for a payment
  public static generateReceipt(paymentId: string): Receipt {
    const payment = paymentTracker.getPaymentDetails(paymentId);
    const { config, status, txHash } = payment;

    if (!config.recipient && !config.recipients) {
      throw new Error('Payment must have either recipient or recipients');
    }

    const baseReceipt = {
      receiptId: this.generateReceiptId(),
      paymentId,
      timestamp: payment.timestamp,
      paymentType: config.type,
      token: config.token,
      status: status.toString(),
      txHash,
      metadata: config.metadata,
    };

    let nextPayment: number;
    let remainingAmount: bigint;
    let streamRate: string;

    switch (config.type) {
      case PaymentType.OneTime:
        if (!config.recipient) {
          throw new Error('One-time payment must have a recipient');
        }
        return {
          ...baseReceipt,
          sender: config.sender,
          recipient: config.recipient,
          amount: config.amount,
        };

      case PaymentType.Recurring:
        if (!config.recipient || !config.frequency) {
          throw new Error('Recurring payment must have a recipient and frequency');
        }
        nextPayment = this.calculateNextPaymentDate(
          payment.timestamp,
          config.frequency
        );
        return {
          ...baseReceipt,
          sender: config.sender,
          recipient: config.recipient,
          amount: config.amount,
          frequency: config.frequency,
          endTime: config.endTime,
          nextPaymentDate: nextPayment,
        };

      case PaymentType.Batch:
        if (!config.recipients) {
          throw new Error('Batch payment must have recipients');
        }
        return {
          ...baseReceipt,
          sender: config.sender,
          recipient: config.recipients.map((r) => r.address),
          amount: config.recipients.map((r) => r.amount),
        };

      case PaymentType.Stream:
        if (!config.recipient || !config.endTime) {
          throw new Error('Stream payment must have a recipient and end time');
        }
        ({ remainingAmount, streamRate } = this.calculateStreamDetails(
          config.amount,
          payment.timestamp,
          config.endTime
        ));
        return {
          ...baseReceipt,
          sender: config.sender,
          recipient: config.recipient,
          amount: config.amount,
          endTime: config.endTime,
          streamRate,
          remainingAmount,
        };

      default:
        throw new Error('Unsupported payment type');
    }
  }

  // Helper method to generate unique receipt ID
  private static generateReceiptId(): string {
    return `RCPT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  // Calculate next payment date for recurring payments
  private static calculateNextPaymentDate(
    lastPayment: number,
    frequency: number
  ): number {
    return lastPayment + frequency * 1000; // Convert frequency from seconds to milliseconds
  }

  // Calculate stream details
  private static calculateStreamDetails(
    totalAmount: bigint,
    startTime: number,
    endTime: number
  ): { remainingAmount: bigint; streamRate: string } {
    const now = Date.now();
    const totalDuration = endTime - startTime / 1000; // Convert to seconds
    const elapsed = Math.min(now - startTime, endTime * 1000 - startTime) / 1000;
    
    const remainingAmount = totalAmount - 
      (totalAmount * BigInt(Math.floor(elapsed))) / BigInt(totalDuration);
    
    const streamRate = `${(Number(totalAmount) / totalDuration).toFixed(6)} tokens/second`;

    return {
      remainingAmount,
      streamRate,
    };
  }
} 