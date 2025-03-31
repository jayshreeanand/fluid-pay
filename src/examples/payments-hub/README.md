# Cross-Chain Payments Hub Example

This example demonstrates how to use the Across Protocol to create a cross-chain payments hub that supports various types of payments:

- One-time payments
- Recurring payments
- Batch payments
- Payment streaming

## Setup

1. Install dependencies:

```bash
yarn install
```

2. Set up environment variables in `.env`:

For simulation (recommended for testing):

```env
TENDERLY_ACCESS_KEY=your_access_key
TENDERLY_ACCOUNT=your_account_name
TENDERLY_PROJECT=your_project_name
```

For real transactions:

```env
PRIVATE_KEY=your_wallet_private_key
```

## Usage

### Running in Simulation Mode (Recommended for Testing)

```bash
yarn start --project payments-hub --simulate true
```

### Running Real Transactions

```bash
yarn start --project payments-hub --simulate false
```

## Example Usage

```typescript
import { PaymentHub } from './index';
import { type Address } from 'viem';

// Initialize PaymentHub with sender address and optional Tenderly config
const paymentHub = new PaymentHub(senderAddress, {
  TENDERLY_ACCESS_KEY: process.env.TENDERLY_ACCESS_KEY,
  TENDERLY_ACCOUNT: process.env.TENDERLY_ACCOUNT,
  TENDERLY_PROJECT: process.env.TENDERLY_PROJECT,
});

// Send one-time payment
const oneTimePaymentId = await paymentHub.sendOneTimePayment(
  recipientAddress,
  amount,
  tokenAddress,
  'Payment for services'
);

// Setup recurring payment
const recurringPaymentId = await paymentHub.setupRecurringPayment(
  recipientAddress,
  amount,
  tokenAddress,
  frequency, // in seconds
  endTime, // unix timestamp
  'Monthly subscription'
);

// Send batch payment
const batchPaymentId = await paymentHub.sendBatchPayment(
  [
    { address: recipient1, amount: amount1 },
    { address: recipient2, amount: amount2 },
  ],
  tokenAddress,
  'Team payments'
);

// Start payment stream
const streamId = await paymentHub.startStream(
  recipientAddress,
  totalAmount,
  tokenAddress,
  endTime,
  'Streaming payment'
);

// Track payment status
const status = paymentHub.getPaymentStatus(paymentId);

// Get payment receipt
const receipt = await paymentHub.getPaymentReceipt(paymentId);

// Get payment history for an address
const history = await paymentHub.getPaymentHistory(address);
```

## Supported Chains and Tokens

The payment hub supports transfers between the following chains:

- Ethereum Mainnet (Chain ID: 1)
- Arbitrum (Chain ID: 42161)
- Base (Chain ID: 8453)
- Optimism (Chain ID: 10)

Supported tokens on each chain:

- USDC
- USDT
- DAI

## Error Handling

The payment hub includes comprehensive error handling:

- Validates all required parameters
- Tracks payment status
- Generates detailed receipts
- Provides clear error messages for failed transactions

## Payment Tracking

All payments are automatically tracked and include:

- Unique payment ID
- Transaction status
- Transaction hash
- Timestamp
- Payment details
- Error messages (if any)
