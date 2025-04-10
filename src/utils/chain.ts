export const getNetworkName = (id: number | undefined) => {
  if (!id) return 'Unknown'
  switch (id) {
    case 1: return 'Ethereum'
    case 56: return 'BNB Chain'
    default: return `Chain ID: ${id}`
  }
}

export const formatBalance = (balance: bigint | undefined, decimals: number): string => {
  if (!balance) return '0'
  
  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = balance / divisor
  const fractionalPart = balance % divisor
  
  // Convert the fractional part to a string and pad with leading zeros
  let fractionalStr = fractionalPart.toString()
  fractionalStr = fractionalStr.padStart(decimals, '0')
  
  // Trim trailing zeros and optionally the decimal point
  const trimmedFractionalStr = fractionalStr.replace(/0+$/, '')
  
  if (trimmedFractionalStr.length === 0) {
    return integerPart.toString()
  }
  
  // Display only up to 4 decimal places for better readability
  const displayDecimals = Math.min(4, trimmedFractionalStr.length)
  return `${integerPart}.${trimmedFractionalStr.slice(0, displayDecimals)}`
}

// Format last updated time in a human-readable format
export const formatLastUpdated = (date: Date): string => {
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffSeconds < 5) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`
  
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes === 1) return '1 minute ago'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  
  return date.toLocaleTimeString()
}

// Format gas price to a human-readable format
export const formatGasPrice = (gasPrice: bigint | undefined): string => {
  if (!gasPrice) return 'Unknown'
  
  // Convert from wei to gwei
  const gweiValue = Number(gasPrice) / 1e9
  
  // Format to at most 2 decimal places
  return gweiValue.toFixed(gweiValue < 10 ? 2 : 1) + ' Gwei'
}

  // Get the native token symbol
  export const getNativeTokenSymbol = (chainId: number) => {
    switch (chainId) {
      case 1: return 'ETH';
      case 56: return 'BNB';
      case 137: return 'MATIC';
      default: return 'Native Token';
    }
  };