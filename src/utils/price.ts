// Utility functions for fetching and formatting token prices

// Map of chain IDs to CoinGecko network IDs
const CHAIN_TO_COINGECKO_NETWORK: Record<number, string> = {
  1: 'ethereum', // Ethereum
  56: 'binance-smart-chain', // BSC
  137: 'polygon-pos', // Polygon
  // Add more chains as needed
};

// Map of chain IDs to native token IDs in CoinGecko
const CHAIN_TO_NATIVE_TOKEN_ID: Record<number, string> = {
  1: 'ethereum', // ETH
  56: 'binancecoin', // BNB
  137: 'matic-network', // MATIC
  // Add more chains as needed
};

/**
 * Fetches the USD price of a token from CoinGecko
 * @param tokenAddress The token address
 * @param chainId The chain ID
 * @returns Promise with the token price in USD
 */
export const fetchTokenPriceUSD = async (
  tokenAddress: string,
  chainId: number
): Promise<number | null> => {
  try {
    const networkId = CHAIN_TO_COINGECKO_NETWORK[chainId];
    
    if (!networkId) {
      console.error(`Network ID ${chainId} is not supported for price fetching`);
      return null;
    }
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/${networkId}?contract_addresses=${tokenAddress}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch token price: ${response.statusText}`);
    }

    const data = await response.json();
    return data[tokenAddress.toLowerCase()]?.usd || null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
};

/**
 * Fetches the USD price of the native token for a given chain ID
 * @param chainId The chain ID
 * @returns Promise with the native token price in USD
 */
export const fetchNativeTokenPriceUSD = async (chainId: number): Promise<number | null> => {
  try {
    const tokenId = CHAIN_TO_NATIVE_TOKEN_ID[chainId];
    
    if (!tokenId) {
      console.error(`Native token for chain ID ${chainId} is not supported for price fetching`);
      return null;
    }
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch native token price: ${response.statusText}`);
    }

    const data = await response.json();
    return data[tokenId]?.usd || null;
  } catch (error) {
    console.error('Error fetching native token price:', error);
    return null;
  }
};

/**
 * Formats a price value to a readable USD string
 * @param price The price value
 * @returns Formatted price string with $ symbol
 */
export const formatUSDPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return 'N/A';
  
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
  }
}; 