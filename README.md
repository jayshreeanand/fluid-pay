# Fluid Pay - Cross-Chain Payment Application

Fluid Pay is a modern web3 application that enables seamless cross-chain payments between different blockchain networks. Built with Next.js, TypeScript, and Tailwind CSS, it provides a user-friendly interface for sending payments across chains. The application leverages Espresso Decaf test and Arbitrum Sepolia rollup for enhanced transaction processing and security.

## 🌟 Features

- **Cross-Chain Payments**: Send payments between different blockchain networks
- **Wallet Integration**: Connect with popular Web3 wallets using RainbowKit
- **Transaction History**: Track all your cross-chain transactions
- **Modern UI**: Clean, responsive interface with light theme
- **Real-time Updates**: Instant feedback on transaction status
- **Multi-Chain Support**: Currently supports Ethereum and Polygon networks
- **Espresso Integration**: Leverages Espresso Decaf test for enhanced transaction processing
- **Arbitrum Rollup**: Utilizes Arbitrum Sepolia rollup for secure and efficient transaction execution

## 🏗️ Project Architecture

```
frontend/
├── app/
│   ├── hooks/
│   │   └── useCrossChainPayment.ts    # Custom hook for payment logic
│   ├── globals.css                     # Global styles and Tailwind config
│   ├── layout.tsx                      # Root layout component
│   ├── page.tsx                        # Main application page
│   └── providers.tsx                   # Web3 providers setup
├── public/                            # Static assets
└── package.json                       # Project dependencies
```

### Key Components

1. **Web3 Integration**

   - Uses Wagmi for Ethereum interactions
   - RainbowKit for wallet connection
   - Custom hooks for payment logic
   - Espresso Decaf test integration
   - Arbitrum Sepolia rollup support

2. **UI Components**

   - Responsive design with Tailwind CSS
   - Modern light theme with subtle animations
   - Form validation and error handling
   - Transaction history display

3. **State Management**
   - React hooks for local state
   - Web3 state management through Wagmi
   - Transaction history tracking

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Web3 wallet (MetaMask, Rainbow, etc.)
- Access to Espresso Decaf test environment
- Arbitrum Sepolia rollup configuration

### Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd fluid-pay
   ```

2. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the frontend directory with:

   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_ARBITRUM_ROLLUP_ID=your_rollup_id
   NEXT_PUBLIC_ESPRESSO_API_KEY=your_espresso_api_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3 Integration**:
  - Wagmi
  - RainbowKit
  - Viem
- **UI Components**: Custom components with Tailwind
- **State Management**: React Hooks
- **Infrastructure**:
  - Espresso Decaf test
  - Arbitrum Sepolia rollup

## 🔧 Configuration

### WalletConnect Setup

1. Create a project at [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Get your project ID
3. Add it to your `.env.local` file

### Espresso Decaf Setup

1. Get access to Espresso Decaf test environment
2. Obtain your API key
3. Configure the environment variables

### Arbitrum Rollup Setup

1. Deploy your rollup on Arbitrum Sepolia
2. Configure the rollup ID in environment variables
3. Set up the necessary endpoints

### Chain Configuration

Currently supported chains:

- Ethereum Mainnet
- Polygon Mainnet
- Arbitrum Sepolia (via rollup)

To add more chains, update the `chains` array in `providers.tsx`

## 📝 Usage

1. Connect your wallet using the "Connect Wallet" button
2. Enter the payment amount
3. Select the destination chain
4. Enter the recipient address
5. Click "Send Payment"
6. Confirm the transaction in your wallet
7. View transaction status in the history section
8. Monitor transaction progress through Espresso and Arbitrum networks

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run type checking
npm run type-check

# Test Espresso integration
npm run test:espresso

# Test Arbitrum rollup
npm run test:rollup
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Wagmi](https://wagmi.sh/) for Web3 integration
- [RainbowKit](https://www.rainbowkit.com/) for wallet connection
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Espresso](https://www.espressosys.com/) for transaction processing
- [Arbitrum](https://arbitrum.io/) for rollup infrastructure
