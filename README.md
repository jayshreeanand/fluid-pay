### Fluid Pay - Cross Chain Payments Hub

A seamless cross-chain payments hub on Arbitrum-Decaf rollup using ERC-7683 for intent-based transfers. Supports multi-chain payments, rapid confirmations, and recurring transactions with Espresso.

Demo Video: [vimeo.com/1071643471](https://vimeo.com/1071643471)

---

**Cracking Composability**

**Core Rollup Requirements - Rollup Liveness Verification**

1. CreateRollUp Transaction Hash - [https://sepolia.arbiscan.io/tx/0xfc28328b17991e4e18e70217c42e285cadc698f05047c10e56b9003206ba7833](https://sepolia.arbiscan.io/tx/0xfc28328b17991e4e18e70217c42e285cadc698f05047c10e56b9003206ba7833)
2. IP Address of the cloud server - 16.16.170.251
3. Chain ID / Namespace of the deployed Rollup - 620306

**Open Intents Pool - Yes**

**OIF Utilization -** This project utilizes ERC-7683, designed for decentralized intents-based payments and transfers across multiple chains. This standard allows users to create, execute, and track payment intents seamlessly, leveraging Espresso confirmations for rapid transaction finality. This is build using Across Protocol SDK.

The Open Intents Framework is integrated with FluidPay to enable:

- Cross-Chain Payments (One-time & Recurring)
- Multi-Recipient Payments
- Real-Time Transaction Tracking
- Intent Creation & Execution via getQuote() and executeQuote()

## Project Structure

To create a new example:

1. Copy the `template` folder
2. Rename it based on your use case (e.g., `token-bridge`, `usdc-transfer`)
3. Add your configuration in `config.ts`
4. Modify the message handler in `message.ts`

## Installation

Install dependencies using yarn:

```bash
yarn install
```

## Running Examples

You can run examples using the following command:

```bash
yarn start --project payments-hub --simulate <true|false>
```

Where:

- `--simulate`:
  - `true`: Uses Tenderly virtual networks for simulation
  - `false`: Executes actual transactions (requires PRIVATE_KEY in env)

## Environment Variables

### Required for Simulation

Create a `.env` file with the following Tenderly credentials:

```env
TENDERLY_ACCESS_KEY=your_access_key
TENDERLY_ACCOUNT=your_account_name
TENDERLY_PROJECT=your_project_name
```

> Note: A fallback Tenderly configuration is provided, but it's recommended to use your own credentials as the fallback cannot be guaranteed to always work.

### Required for Transaction Execution

When running with `--simulate false`, add PRIVATE_KEY to your environment variables:

```env
PRIVATE_KEY=your_wallet_private_key
```

## Contributing

Feel free to contribute by adding new examples or improving existing ones. Follow the project structure guidelines mentioned above.
