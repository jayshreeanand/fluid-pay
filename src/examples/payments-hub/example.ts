import { PaymentHub } from './index.js';
import { config } from './config.js';
import { type Address } from 'viem';

async function main() {
  // Example addresses (replace with actual addresses for real transactions)
  const senderAddress = '0x1234567890123456789012345678901234567890' as Address;
  const recipientAddress = '0x0987654321098765432109876543210987654321' as Address;
  
  // Initialize payment hub with Tenderly config for simulation
  const paymentHub = new PaymentHub(senderAddress, {
    TENDERLY_ACCESS_KEY: process.env.TENDERLY_ACCESS_KEY || '',
    TENDERLY_ACCOUNT: process.env.TENDERLY_ACCOUNT || '',
    TENDERLY_PROJECT: process.env.TENDERLY_PROJECT || '',
  });

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

// Run the example
main().catch(console.error); 