# Cross-Chain Payments Hub Example

This example demonstrates how to use the Across Protocol to create a cross-chain payments hub that supports various types of payments:

- One-time payments
- Recurring payments
- Batch payments
- Payment streaming

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- A Tenderly account for simulation (recommended)

## Dependencies

This project requires the following main dependencies:

```json
{
  "@across-protocol/sdk-v2": "^2.0.0",
  "viem": "^2.0.0",
  "dotenv": "^16.0.0"
}
```

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

## Features

### 1. One-Time Payments

Send a single payment from one chain to another:

```typescript
const paymentId = await paymentHub.sendOneTimePayment(
  recipientAddress,
  amount,
  tokenAddress,
  'Payment description'
);
```

### 2. Recurring Payments

Set up automatic recurring payments:

```typescript
const paymentId = await paymentHub.setupRecurringPayment(
  recipientAddress,
  amount,
  tokenAddress,
  frequency, // in seconds
  endTime, // unix timestamp
  'Monthly subscription'
);
```

### 3. Batch Payments

Send payments to multiple recipients in one transaction:

```typescript
const paymentId = await paymentHub.sendBatchPayment(
  [
    { address: recipient1, amount: amount1 },
    { address: recipient2, amount: amount2 },
  ],
  tokenAddress,
  'Team payments'
);
```

### 4. Payment Streaming

Create continuous payment streams:

```typescript
const streamId = await paymentHub.startStream(
  recipientAddress,
  totalAmount,
  tokenAddress,
  endTime,
  'Streaming payment'
);
```

### Payment Management

Track payments and get receipts:

```typescript
// Check payment status
const status = paymentHub.getPaymentStatus(paymentId);

// Get payment receipt
const receipt = await paymentHub.getPaymentReceipt(paymentId);

// Get payment history
const history = await paymentHub.getPaymentHistory(address);
```

## Supported Networks

The payment hub supports transfers between the following chains:

- Ethereum Mainnet (Chain ID: 1)
- Arbitrum (Chain ID: 42161)
- Base (Chain ID: 8453)
- Optimism (Chain ID: 10)

## Supported Tokens

Each supported chain includes the following tokens:

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

## Development

To add new features or modify existing ones:

1. Payment Types are defined in `config.ts`
2. Payment execution logic is in `index.ts`
3. Cross-chain message creation is in `message.ts`
4. Receipt generation is handled by `receipt.ts`
5. Payment tracking is managed by `tracker.ts`

## Security Considerations

1. Never commit your `.env` file
2. Always use environment variables for sensitive data
3. Test thoroughly in simulation mode before running real transactions
4. Validate all input parameters, especially addresses and amounts
5. Monitor transaction status and implement proper error handling

## Contributing

Feel free to contribute by:

1. Opening issues for bugs or feature requests
2. Submitting pull requests with improvements
3. Adding more examples or documentation
4. Suggesting new payment types or features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This is an example implementation and should not be used in production without proper security audits and testing. The code is provided as-is with no warranties or guarantees.
