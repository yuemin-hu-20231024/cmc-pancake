import { useState } from 'react'
import { useConnect, useAccount, useDisconnect, useSwitchChain, useBalance, useFeeData } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { getNetworkName, formatBalance, formatLastUpdated, formatGasPrice } from '../utils/chain'
import { SUPPORTED_CHAINS, ChainInfo } from '../constants'

export function ConnectWallet() {
  const { connect } = useConnect()
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  // Get the balance for the current chain with polling enabled for real-time updates
  const { data: balanceData, isLoading: isBalanceLoading, refetch } = useBalance({
    address,
    query: {
      // Poll every 10 seconds for balance updates
      refetchInterval: 10_000,
      // Refetch when the window regains focus
      refetchOnWindowFocus: true,
      // Also refetch when the network/chain changes
      refetchOnMount: true,
    },
  })
  
  // Get gas price data for the current chain
  const { data: feeData, isLoading: isFeeLoading } = useFeeData({
    query: {
      // Poll every 15 seconds for fee data updates
      refetchInterval: 15_000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  })
  
  // Find the current chain from supported chains
  const currentChain: ChainInfo | undefined = SUPPORTED_CHAINS.find(chain => chain.id === chainId)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await connect({ connector: injected() })
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Manual refresh handler
  const handleRefresh = async () => {
    await refetch()
    setLastUpdated(new Date())
  }

  if (isConnected) {
    return (
      <div className="wallet-connection">
        <div className="address">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <div className="network">
          Network: {getNetworkName(chainId)}
        </div>
        <div className="balance">
          {isBalanceLoading ? (
            <span>Loading balance...</span>
          ) : (
            <>
              <span className="balance-amount">
                Balance: {formatBalance(balanceData?.value, currentChain?.nativeCurrency.decimals || 18)} {currentChain?.nativeCurrency.symbol || ''}
              </span>
              <div className="last-updated">
                Last updated: {formatLastUpdated(lastUpdated)} 
                <button className="refresh-button" onClick={handleRefresh} title="Refresh balance">
                  ↻
                </button>
              </div>
              <div className="gas-price">
                Gas price: {isFeeLoading ? 'Loading...' : formatGasPrice(feeData?.maxFeePerGas)}
              </div>
            </>
          )}
        </div>
        <div className="actions">
          {SUPPORTED_CHAINS.map(chain => (
            <button
              key={chain.id}
              onClick={() => switchChain({ chainId: chain.id })}
              disabled={isSwitching || chainId === chain.id}
              className="switch-button"
            >
              {isSwitching && chainId !== chain.id ? 'Switching...' : `Switch to ${chain.name}`}
            </button>
          ))}
          <button onClick={() => disconnect()} className="disconnect-button">
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="connect-button"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
} 