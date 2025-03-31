import { type Address } from 'viem';
import { PaymentStatus, PaymentType } from './config.js';
import type { PaymentConfig } from './config.js';
import { ReceiptGenerator } from './receipt.js';
import type { Receipt } from './receipt.js';

interface Payment {
  id: string;
  config: PaymentConfig;
  status: PaymentStatus;
  txHash?: string;
  error?: string;
  timestamp: number;
}

class PaymentTracker {
  private payments: Map<string, Payment> = new Map();
  private addressPayments: Map<Address, Set<string>> = new Map();

  createPayment(config: PaymentConfig): string {
    const id = `PMT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const payment: Payment = {
      id,
      config,
      status: PaymentStatus.Pending,
      timestamp: Date.now(),
    };

    this.payments.set(id, payment);

    // Track payments by address
    if (!this.addressPayments.has(config.sender)) {
      this.addressPayments.set(config.sender, new Set());
    }
    this.addressPayments.get(config.sender)?.add(id);

    return id;
  }

  updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    txHash?: string,
    error?: string
  ): void {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = status;
      payment.txHash = txHash;
      payment.error = error;
      this.payments.set(paymentId, payment);
    }
  }

  getPaymentStatus(paymentId: string): PaymentStatus {
    return this.payments.get(paymentId)?.status ?? PaymentStatus.Failed;
  }

  getPayment(paymentId: string): Payment | undefined {
    return this.payments.get(paymentId);
  }

  getPaymentsByAddress(address: Address): Payment[] {
    const paymentIds = this.addressPayments.get(address);
    if (!paymentIds) return [];

    return Array.from(paymentIds)
      .map((id) => this.payments.get(id))
      .filter((payment): payment is Payment => payment !== undefined);
  }

  getPaymentHistory(address: Address): Receipt[] {
    const payments = this.getPaymentsByAddress(address);
    return payments.map((payment) => ReceiptGenerator.generateReceipt(payment.id));
  }
}

export const paymentTracker = new PaymentTracker(); 