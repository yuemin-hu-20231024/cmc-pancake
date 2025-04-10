const host = 'https://test.hub.pancakeswap.com';

const KEY = 'bccea4e6b9345f503380e787f1aa5f4326972d2e591e4799b5f56a5b00f10c83';

interface QuoteParams {
  chainId: number;
  src: string;
  dst: string;
  amountIn: string;
  maxHops?: string;
  maxSplits?: string;
  gasPrice?: string;
}

interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  chainId: number;
  isNative?: boolean;
  isToken?: boolean;
}

interface PoolInfo {
  type: number;
  liquidityProvider: string;
  address: string;
  token0: TokenInfo;
  token1: TokenInfo;
  fee: number;
  liquidity: string;
  sqrtRatioX96: string;
  tick: number;
  token0ProtocolFee: string;
  token1ProtocolFee: string;
  reserve0: string;
  reserve1: string;
}

interface Protocol {
  percent: number;
  path: TokenInfo[];
  pools: PoolInfo[];
  inputAmount: string;
  outputAmount: string;
}

export interface QuoteResponse {
  srcToken: TokenInfo;
  dstToken: TokenInfo;
  fromAmount: string;
  dstAmount: string;
  protocols: Protocol[];
  gas: number;
}

/**
 * Fetches a swap quote from the PancakeSwap aggregator API
 * 
 * @param params - Parameters for the quote request
 * @param params.chainId - The blockchain network ID (Currently only supports 56 - BSC)
 * @param params.src - Source token contract address. Use zero address "0x0000000000000000000000000000000000000000" for native token
 * @param params.dst - Destination token contract address. Use zero address "0x0000000000000000000000000000000000000000" for native token
 * @param params.amountIn - Amount of source tokens to swap in wei (raw units)
 * @param params.gasPrice - (Optional) Gas price in wei, used for route optimization calculations.
 *                         - Higher values favor simpler routes with fewer hops
 *                         - Lower values allow more complex routes if they provide better output
 *                         - This is NOT a gas limit and does NOT set the actual transaction gas price
 *                         - If not provided, current network gas price will be used
 * @param params.maxHops - (Optional) Maximum number of hops in a route. Default: 2, Min: 1, Max: 4
 *                         Higher numbers will lower performance
 * @param params.maxSplits - (Optional) Maximum number of splits for the route. Default: 2, Min: 1, Max: 4
 * 
 * @returns A promise that resolves to the quote response containing details about the swap
 */
export async function getQuote(params: QuoteParams): Promise<QuoteResponse> {
  
  const { chainId, src, dst, amountIn, maxHops, maxSplits, gasPrice } = params;

  if (!chainId || !src || !dst || !amountIn) {
    throw new Error('Missing required parameters');
  }
  
  try {
    const response = await fetch(`${host}/aggregator/api/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secure-token': KEY,
        'User-Agent': 'pancake-aggregator-app'
      },
      body: JSON.stringify({
        chainId,
        src,
        dst,
        amountIn,
        maxHops,
        maxSplits,
        gasPrice
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Quote request failed with status ${response.status}: ${
          errorData?.message || response.statusText
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
}

type CallDataParams = QuoteResponse & {
  recipient?: `0x${string}`;
  slippageTolerance?: number;
}

export type CalldataResponse = {
  calldata: string;
  value: string;
  to: string;
}

export const getCalldata = async (params: CallDataParams): Promise<CalldataResponse> => {
  try {
    const response = await fetch(`${host}/aggregator/api/calldata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secure-token': KEY,
        'User-Agent': 'pancake-aggregator-app'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Quote request failed with status ${response.status}: ${
          errorData?.message || response.statusText
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching calldata:', error);
    throw error;
  }
}