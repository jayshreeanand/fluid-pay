import { type Address } from 'viem';
import { PaymentStatus, type PaymentConfig } from './config.js';
import { ReceiptGenerator } from './receipt.js';
import type { Receipt } from './receipt.js';

interface PaymentRecord {
  id: string;
  timestamp: number;
  status: PaymentStatus;
  config: PaymentConfig;
  txHash?: string;
  error?: string;
}

class PaymentTracker {
  private payments: Map<string, PaymentRecord>;

  constructor() {
    this.payments = new Map();
  }

  // Create a new payment record
  public createPayment(config: PaymentConfig): string {
    const id = this.generatePaymentId();
    const record: PaymentRecord = {
      id,
      timestamp: Date.now(),
      status: PaymentStatus.Pending,
      config,
    };
    this.payments.set(id, record);
    return id;
  }

  // Update payment status
  public updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    txHash?: string,
    error?: string
  ): void {
    const payment = this.payments.get(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }

    this.payments.set(id, {
      ...payment,
      status,
      ...(txHash && { txHash }),
      ...(error && { error }),
    });
  }

  // Get payment status
  public getPaymentStatus(id: string): PaymentStatus {
    const payment = this.payments.get(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    return payment.status;
  }

  // Get payment details
  public getPaymentDetails(id: string): PaymentRecord {
    const payment = this.payments.get(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  // Get payment history for an address (as sender or recipient)
  public getPaymentHistory(address: Address): Receipt[] {
    const relevantPayments = Array.from(this.payments.values()).filter((payment) => {
      const isRecipient =
        'recipient' in payment.config &&
        payment.config.recipient === address;
      const isInRecipients =
        'recipients' in payment.config &&
        payment.config.recipients?.some((r) => r.address === address);
      return isRecipient || isInRecipients;
    });

    return relevantPayments.map((payment) => 
      ReceiptGenerator.generateReceipt(payment.id)
    );
  }

  // Get all payments
  public getAllPayments(): Receipt[] {
    return Array.from(this.payments.values()).map((payment) =>
      ReceiptGenerator.generateReceipt(payment.id)
    );
  }

  // Helper method to generate unique payment ID
  private generatePaymentId(): string {
    return `PMT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

// Export singleton instance
export const paymentTracker = new PaymentTracker(); 