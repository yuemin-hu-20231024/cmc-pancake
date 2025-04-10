import './App.css'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectWallet } from './components/ConnectWallet'
import { bsc } from './constants'
import Swap from './components/Swap'

// Create wagmi config
const config = createConfig({
  chains: [mainnet, bsc],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
  },
})

// Create a react-query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="card">
          <ConnectWallet />
        </div>
        <Swap />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
