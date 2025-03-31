import { type Address } from 'viem';
import { PaymentStatus, type PaymentConfig } from './config.js';
import { ReceiptGenerator } from './receipt.js';
import type { Receipt } from './receipt.js';
import { generateReceipt } from './receipt.js';

interface Payment {
  id: string;
  type: string;
  sender: Address;
  recipient?: Address;
  recipients?: { address: Address; amount: bigint }[];
  token: Address;
  amount: bigint;
  metadata?: string;
  status: PaymentStatus;
  transactionHash?: string;
  error?: string;
  timestamp: number;
}

export class PaymentTracker {
  private payments: Map<string, Payment> = new Map();
  private paymentsByAddress: Map<Address, Set<string>> = new Map();

  public createPayment(paymentConfig: PaymentConfig): string {
    const paymentId = Math.random().toString(36).substring(7);
    const payment: Payment = {
      id: paymentId,
      type: paymentConfig.type,
      sender: paymentConfig.sender,
      recipient: paymentConfig.recipient,
      recipients: paymentConfig.recipients,
      token: paymentConfig.token,
      amount: paymentConfig.amount,
      metadata: paymentConfig.metadata,
      status: PaymentStatus.Pending,
      timestamp: Date.now(),
    };

    this.payments.set(paymentId, payment);

    // Track payment by sender address
    if (!this.paymentsByAddress.has(paymentConfig.sender)) {
      this.paymentsByAddress.set(paymentConfig.sender, new Set());
    }
    this.paymentsByAddress.get(paymentConfig.sender)?.add(paymentId);

    // Track payment by recipient address if it's a single recipient payment
    if (paymentConfig.recipient) {
      if (!this.paymentsByAddress.has(paymentConfig.recipient)) {
        this.paymentsByAddress.set(paymentConfig.recipient, new Set());
      }
      this.paymentsByAddress.get(paymentConfig.recipient)?.add(paymentId);
    }

    // Track payments by recipients if it's a batch payment
    if (paymentConfig.recipients) {
      for (const recipient of paymentConfig.recipients) {
        if (!this.paymentsByAddress.has(recipient.address)) {
          this.paymentsByAddress.set(recipient.address, new Set());
        }
        this.paymentsByAddress.get(recipient.address)?.add(paymentId);
      }
    }

    return paymentId;
  }

  public getPayment(paymentId: string): Payment | undefined {
    return this.payments.get(paymentId);
  }

  public getPaymentStatus(paymentId: string): PaymentStatus {
    const payment = this.payments.get(paymentId);
    return payment?.status || PaymentStatus.Failed;
  }

  public getTransactionHash(paymentId: string): string | undefined {
    const payment = this.payments.get(paymentId);
    return payment?.transactionHash;
  }

  public getError(paymentId: string): string | undefined {
    const payment = this.payments.get(paymentId);
    return payment?.error;
  }

  public updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionHash?: string,
    error?: string
  ): void {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = status;
      if (transactionHash) {
        payment.transactionHash = transactionHash;
      }
      if (error) {
        payment.error = error;
      }
      this.payments.set(paymentId, payment);
    }
  }

  public getPaymentHistory(): Payment[] {
    return Array.from(this.payments.values());
  }
}

export const paymentTracker = new PaymentTracker(); 