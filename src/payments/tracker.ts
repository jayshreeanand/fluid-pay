import { type Address } from 'viem';
import { PaymentStatus, PaymentType } from './config.js';
import type { PaymentConfig } from './config.js';
import { ReceiptGenerator } from './receipt.js';
import type { Receipt } from './receipt.js';
import { generateReceipt } from './receipt.js';

interface Payment {
  id: string;
  config: PaymentConfig;
  status: PaymentStatus;
  timestamp: number;
  txHash?: string;
  error?: string;
  sender: string;
  recipient: string;
  amount: bigint;
  token: string;
  metadata?: string;
}

export class PaymentTracker {
  private payments: Map<string, Payment> = new Map();
  private addressPayments: Map<string, Set<string>> = new Map();

  createPayment(paymentConfig: PaymentConfig): string {
    const id = `PMT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const payment: Payment = {
      id,
      config: paymentConfig,
      status: PaymentStatus.Pending,
      timestamp: Date.now(),
      sender: paymentConfig.sender,
      recipient: paymentConfig.recipient || '',
      amount: paymentConfig.amount,
      token: paymentConfig.token,
      metadata: paymentConfig.metadata,
    };

    this.payments.set(id, payment);

    // Track payments by address
    if (!this.addressPayments.has(paymentConfig.sender)) {
      this.addressPayments.set(paymentConfig.sender, new Set());
    }
    this.addressPayments.get(paymentConfig.sender)?.add(id);

    return id;
  }

  getPayment(paymentId: string): Payment | undefined {
    return this.payments.get(paymentId);
  }

  getPaymentHistory(): Payment[] {
    return Array.from(this.payments.values());
  }

  updatePaymentStatus(paymentId: string, status: PaymentStatus, txHash?: string, error?: string): void {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = status;
      if (txHash) {
        payment.txHash = txHash;
      }
      if (error) {
        payment.error = error;
      }
    }
  }

  getPaymentStatus(paymentId: string): PaymentStatus {
    return this.payments.get(paymentId)?.status ?? PaymentStatus.Failed;
  }

  getPaymentsByAddress(address: Address): Payment[] {
    const paymentIds = this.addressPayments.get(address.toString());
    if (!paymentIds) return [];

    return Array.from(paymentIds)
      .map((id) => this.payments.get(id))
      .filter((payment): payment is Payment => payment !== undefined);
  }
}

export const paymentTracker = new PaymentTracker(); 