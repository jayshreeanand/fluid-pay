import { type Address } from 'viem';
import { executeAcrossTxs } from '../utils/executeAcrossTxs.js';
import { config } from './config.js';
import { createCrossChainMessage } from './message.js';
import { paymentTracker } from './tracker.js';
import { ReceiptGenerator } from './receipt.js';
import type { PaymentConfig } from './config.js';
import { PaymentStatus, PaymentType, validatePaymentConfig } from './config.js';
import type { Receipt } from './receipt.js';
import type { TenderlyConfig } from '../types/index.js';
import type { ExecuteAcrossTxsResult } from './types.js';
import { type Config } from '../types/index.js';
import { PaymentTracker } from './tracker.js';
import { generateReceipt } from './receipt.js';

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
  getPaymentHistory(): Promise<Receipt[]>;
}

export class PaymentHub implements PaymentHubInterface {
  private readonly sender: Address;
  private readonly tenderlyConfig?: {
    TENDERLY_ACCESS_KEY: string;
    TENDERLY_ACCOUNT: string;
    TENDERLY_PROJECT: string;
  };

  constructor(sender: Address, tenderlyConfig?: {
    TENDERLY_ACCESS_KEY: string;
    TENDERLY_ACCOUNT: string;
    TENDERLY_PROJECT: string;
  }) {
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
      sourceChainId: 8453,
      destinationChainId: 42161,
      inputToken: token,
      outputToken: token,
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
      metadata,
      sourceChainId: 8453,
      destinationChainId: 42161,
      inputToken: token,
      outputToken: token,
      frequency,
      endTime,
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
      token,
      amount: recipients.reduce((sum, r) => sum + r.amount, 0n),
      metadata,
      sourceChainId: 8453,
      destinationChainId: 42161,
      inputToken: token,
      outputToken: token,
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
      metadata,
      sourceChainId: 8453,
      destinationChainId: 42161,
      inputToken: token,
      outputToken: token,
      endTime,
    };
    return this.executePayment(paymentConfig);
  }

  public getPaymentStatus(paymentId: string): PaymentStatus {
    return paymentTracker.getPaymentStatus(paymentId);
  }

  public async getPaymentReceipt(paymentId: string): Promise<Receipt> {
    return generateReceipt(paymentId);
  }

  public async getPaymentHistory(): Promise<Receipt[]> {
    const payments = paymentTracker.getPaymentHistory();
    return Promise.all(payments.map((payment) => generateReceipt(payment.id)));
  }

  private async executePayment(paymentConfig: PaymentConfig): Promise<string> {
    // Validate the payment config
    validatePaymentConfig(paymentConfig);

    const paymentId = paymentTracker.createPayment(paymentConfig);

    try {
      const message = createCrossChainMessage(paymentConfig);

      const result = (await executeAcrossTxs(
        {
          sourceChainId: paymentConfig.sourceChainId,
          destinationChainId: paymentConfig.destinationChainId,
          inputToken: paymentConfig.inputToken,
          outputToken: paymentConfig.outputToken,
          amount: paymentConfig.amount,
          contractAddress: '0x1234567890123456789012345678901234567890',
          tenderly: this.tenderlyConfig,
        },
        false,
        async () => message,
        this.tenderlyConfig || {
          TENDERLY_ACCESS_KEY: '',
          TENDERLY_ACCOUNT: '',
          TENDERLY_PROJECT: '',
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
        // In simulation mode, we'll mark the payment as completed
        paymentTracker.updatePaymentStatus(
          paymentId,
          PaymentStatus.Completed,
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
    const history = await paymentHub.getPaymentHistory();
    console.log('Payment history:', history);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
} 