### Fluid Pay - Cross Chain Payments Hub

A seamless cross-chain payments hub on Arbitrum-Decaf rollup using ERC-7683 for intent-based transfers. Supports multi-chain payments, rapid confirmations, and recurring transactions with Espresso.

Demo Video: [vimeo.com/1071643471](https://vimeo.com/1071643471)

---

**Caffeinate & Code**

**Rollup Details**

This project works on a fully functional and live rollup using Espresso confirmations on Decaf Testnet and Arbitrum Sepolia. It is deployed on cloud using AWS EC2 instance.

**Rollup Liveness Verification**

1. CreateRollUp Transaction Hash - [https://sepolia.arbiscan.io/tx/0xfc28328b17991e4e18e70217c42e285cadc698f05047c10e56b9003206ba7833](https://sepolia.arbiscan.io/tx/0xfc28328b17991e4e18e70217c42e285cadc698f05047c10e56b9003206ba7833)
2. IP Address of the cloud server - 16.16.170.251
3. Chain ID / Namespace of the deployed Rollup - 620306

Docker Logs video - [https://vimeo.com/1071645653](https://vimeo.com/1071645653)

Github (Rollup config) - [https://github.com/jayshreeanand/rapid-rollup](https://github.com/jayshreeanand/rapid-rollup)

---

**Cracking Composability**

**Core Rollup Requirements - Rollup Liveness Verification**

(Used the same rollup as above)

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

**Presentation / One Pager Link - [https://jayshree.notion.site/Fluid-Pay-1c99e89ff06880c69f2de2cd6055d569?pvs=4](https://jayshree.notion.site/Fluid-Pay-1c99e89ff06880c69f2de2cd6055d569?pvs=4)**

**Demo Video -** [vimeo.com/1071643471](https://vimeo.com/1071643471)
