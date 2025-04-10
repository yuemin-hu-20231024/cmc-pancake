import { mainnet } from 'wagmi/chains'
import { defineChain } from 'viem'

// Define BSC chain
export const bsc = defineChain({
  id: 56,
  name: 'BNB Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: ['https://bsc-dataseed.binance.org']
    },
    public: {
      http: ['https://bsc-dataseed.binance.org']
    }
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
})

export interface ChainInfo {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_CHAINS: ChainInfo[] = [
  {
    id: mainnet.id,
    name: 'Ethereum',
    nativeCurrency: mainnet.nativeCurrency
  },
  {
    id: bsc.id,
    name: 'BNB Chain',
    nativeCurrency: bsc.nativeCurrency
  }
] 

export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
}

export const TOKEN_INFOS: Record<number, TokenInfo[]> = {
  [bsc.id]: [{
    "name": "PancakeSwap Token",
    "symbol": "CAKE",
    "address": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    "chainId": 56,
    "decimals": 18,
    "logoURI": "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png"
    },{
      "name": "Binance Pegged USDT",
      "symbol": "USDT",
      "address": "0x55d398326f99059fF775485246999027B3197955",
      "chainId": 56,
      "decimals": 18,
      "logoURI": "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png"
    }
  ],
  [mainnet.id]: [
    {
      "name": "Ethereum",
      "symbol": "ETH",
      "address": "0x0000000000000000000000000000000000000000",
      "chainId": 1,
      "decimals": 18,
      "logoURI": "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png"
    },
    {
      "name": "USD Coin",
      "symbol": "USDC",
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "chainId": 1,
      "decimals": 6,
      "logoURI": "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png"
    }
  ]
}
