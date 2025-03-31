import { type Address } from 'viem';
import { executeAcrossTxs } from '@across-protocol/sdk-v2';
import { config } from './config.js';
import { createCrossChainMessage } from './message.js';
import { paymentTracker } from './tracker.js';
import { ReceiptGenerator } from './receipt.js';
import type { PaymentConfig } from './config.js';
import { PaymentStatus, PaymentType } from './config.js';
import type { Receipt } from './receipt.js';
import type { TenderlyConfig } from '../../types/index.js';
import type { ExecuteAcrossTxsResult } from './types.js';

export interface PaymentHubInterface {
  sendOneTimePayment(
    recipient: Address,
    amount: bigint,
    token: Address,
    metadata?: string
  ): Promise<string>;
  
  setupRecurringPayment(
    recipient: Address,
    amount: bigint,
    token: Address,
    frequency: number,
    endTime: number,
    metadata?: string
  ): Promise<string>;
  
  sendBatchPayment(
    recipients: Array<{ address: Address; amount: bigint }>,
    token: Address,
    metadata?: string
  ): Promise<string>;
  
  startStream(
    recipient: Address,
    amount: bigint,
    token: Address,
    endTime: number,
    metadata?: string
  ): Promise<string>;
  
  getPaymentStatus(paymentId: string): PaymentStatus;
  getPaymentReceipt(paymentId: string): Promise<Receipt>;
  getPaymentHistory(address: Address): Promise<Receipt[]>;
}

export class PaymentHub implements PaymentHubInterface {
  private readonly sender: Address;
  private readonly tenderlyConfig?: TenderlyConfig;

  constructor(sender: Address, tenderlyConfig?: TenderlyConfig) {
    this.sender = sender;
    this.tenderlyConfig = tenderlyConfig;
  }

  public async sendOneTimePayment(
    recipient: Address,
    amount: bigint,
    token: Address,
    metadata?: string
  ): Promise<string> {
    const paymentConfig: PaymentConfig = {
      type: PaymentType.OneTime,
      sender: this.sender,
      recipient,
      amount,
      token,
      metadata,
    };
    return this.executePayment(paymentConfig);
  }

  public async setupRecurringPayment(
    recipient: Address,
    amount: bigint,
    token: Address,
    frequency: number,
    endTime: number,
    metadata?: string
  ): Promise<string> {
    const paymentConfig: PaymentConfig = {
      type: PaymentType.Recurring,
      sender: this.sender,
      recipient,
      amount,
      token,
      frequency,
      endTime,
      metadata,
    };
    return this.executePayment(paymentConfig);
  }

  public async sendBatchPayment(
    recipients: Array<{ address: Address; amount: bigint }>,
    token: Address,
    metadata?: string
  ): Promise<string> {
    const paymentConfig: PaymentConfig = {
      type: PaymentType.Batch,
      sender: this.sender,
      recipients,
      amount: recipients.reduce((sum, r) => sum + r.amount, 0n),
      token,
      metadata,
    };
    return this.executePayment(paymentConfig);
  }

  public async startStream(
    recipient: Address,
    amount: bigint,
    token: Address,
    endTime: number,
    metadata?: string
  ): Promise<string> {
    const paymentConfig: PaymentConfig = {
      type: PaymentType.Stream,
      sender: this.sender,
      recipient,
      amount,
      token,
      endTime,
      metadata,
    };
    return this.executePayment(paymentConfig);
  }

  public getPaymentStatus(paymentId: string): PaymentStatus {
    return paymentTracker.getPaymentStatus(paymentId);
  }

  public async getPaymentReceipt(paymentId: string): Promise<Receipt> {
    return ReceiptGenerator.generateReceipt(paymentId);
  }

  public async getPaymentHistory(address: Address): Promise<Receipt[]> {
    return paymentTracker.getPaymentHistory(address);
  }

  private async executePayment(paymentConfig: PaymentConfig): Promise<string> {
    const paymentId = paymentTracker.createPayment(paymentConfig);

    try {
      const message = await createCrossChainMessage(
        paymentConfig.sender,
        paymentConfig
      );

      const result = (await executeAcrossTxs(
        config,
        false,
        async () => message,
        {
          TENDERLY_ACCESS_KEY: this.tenderlyConfig?.TENDERLY_ACCESS_KEY || '',
          TENDERLY_ACCOUNT: this.tenderlyConfig?.TENDERLY_ACCOUNT || '',
          TENDERLY_PROJECT: this.tenderlyConfig?.TENDERLY_PROJECT || '',
        }
      )) as ExecuteAcrossTxsResult | undefined;

      if (!result) {
        paymentTracker.updatePaymentStatus(
          paymentId,
          PaymentStatus.Failed,
          undefined,
          'Transaction execution failed'
        );
      } else {
        paymentTracker.updatePaymentStatus(
          paymentId,
          result.destinationTxSuccess
            ? PaymentStatus.Completed
            : PaymentStatus.Failed,
          result.quote.sourceTxHash
        );
      }

      return paymentId;
    } catch (error) {
      paymentTracker.updatePaymentStatus(
        paymentId,
        PaymentStatus.Failed,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }
}

// This function is required by the project's main entry point
export async function executeAcrossTxsWrapper(
  simulate: boolean,
  tenderlyConfig: TenderlyConfig
) {
  // Example addresses (replace with actual addresses for real transactions)
  const senderAddress = '0x1234567890123456789012345678901234567890' as Address;
  const recipientAddress = '0x0987654321098765432109876543210987654321' as Address;
  
  // Initialize payment hub
  const paymentHub = new PaymentHub(senderAddress, tenderlyConfig);

  try {
    // Example 1: One-time payment
    console.log('Sending one-time payment...');
    const oneTimePaymentId = await paymentHub.sendOneTimePayment(
      recipientAddress,
      BigInt('1000000'), // 1 USDC (6 decimals)
      config.outputToken as Address,
      'One-time payment example'
    );
    console.log(`One-time payment initiated with ID: ${oneTimePaymentId}`);
    
    // Track payment status
    const status = paymentHub.getPaymentStatus(oneTimePaymentId);
    console.log(`Payment status: ${status}`);

    // Get payment receipt
    const receipt = await paymentHub.getPaymentReceipt(oneTimePaymentId);
    console.log('Payment receipt:', receipt);

    // Example 2: Batch payment
    console.log('\nSending batch payment...');
    const recipients = [
      { address: recipientAddress, amount: BigInt('500000') },
      {
        address: '0x5555555555555555555555555555555555555555' as Address,
        amount: BigInt('500000'),
      },
    ];
    
    const batchPaymentId = await paymentHub.sendBatchPayment(
      recipients,
      config.outputToken as Address,
      'Batch payment example'
    );
    console.log(`Batch payment initiated with ID: ${batchPaymentId}`);

    // Example 3: Get payment history
    console.log('\nGetting payment history...');
    const history = await paymentHub.getPaymentHistory(senderAddress);
    console.log('Payment history:', history);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
} 