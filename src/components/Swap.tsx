import { useAccount, useEstimateFeesPerGas } from "wagmi"
import { TOKEN_INFOS, TokenInfo } from "../constants"
import { useEffect, useState, useCallback } from "react"
import "./Swap.css"
import { CalldataResponse, QuoteResponse, getCalldata, getQuote } from "../http";
import { useQuery, useMutation } from "@tanstack/react-query";
import { normalizeWeiToString, normalizeNumber, convertNumberToWei } from "../utils/number";
import { useDebounce } from "../utils/hooks";
import { fetchNativeTokenPriceUSD, formatUSDPrice } from "../utils/price";
import { getNativeTokenSymbol, getNetworkName } from "../utils/chain";
import { queryClient } from "../App";

const Swap = () => {
  const { address, chainId } = useAccount();
  const [fromAmount, setFromAmount] = useState<string>('');
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [slippage, setSlippage] = useState<number>(0.005);
  const [callData, setCallData] = useState<CalldataResponse | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Get gas price data for the current chain
  const { data: feeData } = useEstimateFeesPerGas({
    query: {
      // Poll every 15 seconds for fee data updates
      refetchInterval: 15_000,
      refetchOnWindowFocus: true,
    }
  });

  // Fetch native token price
  const {
    data: nativeTokenPrice,
    isLoading: isLoadingPrice,
  } = useQuery({
    queryKey: ['nativeTokenPrice', chainId],
    queryFn: async () => {
      if (!chainId) return null;
      return await fetchNativeTokenPriceUSD(chainId);
    },
    enabled: !!chainId,
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    if (chainId && TOKEN_INFOS[chainId as keyof typeof TOKEN_INFOS]) {
      setFromToken(TOKEN_INFOS[chainId as keyof typeof TOKEN_INFOS][0]);
      setToToken(TOKEN_INFOS[chainId as keyof typeof TOKEN_INFOS][1]);
    }
  }, [chainId]);

  // Debounce the amount input
  const debouncedAmount = useDebounce(fromAmount, 500);

  // Prepare query inputs
  const canFetchQuote = !!(
    debouncedAmount &&
    parseFloat(debouncedAmount) > 0 &&
    fromToken &&
    toToken &&
    chainId
  );

  // Calculate amount in wei
  const getAmountInWei = useCallback(() => {
    if (!fromToken || !debouncedAmount) return "0";
    return convertNumberToWei(parseFloat(debouncedAmount));
  }, [debouncedAmount, fromToken]);

  // Use React Query to fetch the quote
  const {
    data: quoteInfo,
    isLoading: isLoadingQuote,
    error: quoteError,
    refetch
  } = useQuery<QuoteResponse, Error>({
    queryKey: ['quote', chainId, fromToken?.address, toToken?.address, getAmountInWei()],
    queryFn: async () => {
      if (!chainId || !fromToken || !toToken || !debouncedAmount) {
        throw new Error("Missing required parameters");
      }

      return await getQuote({
        chainId: chainId,
        src: fromToken.address,
        dst: toToken.address,
        amountIn: getAmountInWei(),
      });
    },
    enabled: canFetchQuote, // Only run the query when we have all required data
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
    retry: 1, // Only retry once on failure
  });

  // Prepare swap calldata
  const { mutateAsync: prepareSwap, isPending: isPreparingSwap, error: prepareError } = useMutation({
    mutationFn: async () => {
      if (!quoteInfo || !address) {
        throw new Error("Missing quote information or wallet address");
      }
      
      const callDataResponse = await getCalldata({
        ...quoteInfo,
        recipient: address as `0x${string}`,
        slippageTolerance: slippage
      });

      setCallData(callDataResponse);
      return callDataResponse;
    },
  });

  // Execute the swap
  const executeSwap = async () => {
    try {
      // First get the calldata if we don't have it yet
      const callDataToUse = callData || await prepareSwap();
      
      if (!callDataToUse) {
        throw new Error("Failed to prepare transaction");
      }

      // For raw transaction, we need to use the raw transaction method
      // This typically requires using a Wallet or Provider's sendTransaction method
      // For now, let's just simulate successful transaction and set the hash
      
      // In a real implementation, you would use something like:
      // const hash = await walletClient.sendTransaction({
      //   account,
      //   to: callDataToUse.to,
      //   value: BigInt(callDataToUse.value || '0'),
      //   data: callDataToUse.calldata,
      // })
      
      // Mock a transaction hash for now
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 64)}`;
      setTxHash(mockTxHash);

      queryClient.invalidateQueries({ queryKey: ['quote'] });
      setCallData(null);
      setFromAmount('');
      
      // In a real app, you would wait for transaction to be mined
    } catch (error) {
      console.error("Error executing swap:", error);
    }
  };

  if (!address || !chainId) {
    return null;
  }

  const tokenInfos = TOKEN_INFOS[chainId as keyof typeof TOKEN_INFOS];

  if (!tokenInfos) {
    return <div className="card">Unsupported chain</div>;
  }

  // Format the displayed output amount
  const formatOutputAmount = () => {
    if (!quoteInfo || !toToken) return '0';
    return normalizeWeiToString(quoteInfo.dstAmount);
  };

  // Format slippage as percentage
  const formatSlippage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Calculate gas cost in USD
  const getGasCostUSD = () => {
    if (!feeData?.maxFeePerGas || !quoteInfo?.gas || !nativeTokenPrice) return null;

    // Gas cost in native token (ETH/BNB/etc)
    const gasCostInNative = Number(feeData.maxFeePerGas) * Number(quoteInfo.gas) / 1e18;

    // Gas cost in USD
    return gasCostInNative * nativeTokenPrice;
  };

  // Check if swap is in progress
  const isSwapping = isPreparingSwap;
  
  // Get any swap-related error
  const swapError = prepareError;

  return (
    <div className="card">
      <div className="swap-container">
        <div className="network-info">
          <div className="network-name">
            Network: {getNetworkName(chainId)}
          </div>
          <div className="token-price">
            {getNativeTokenSymbol(chainId)} Price: {isLoadingPrice ? 'Loading...' : formatUSDPrice(nativeTokenPrice)}
          </div>
        </div>

        <div className="token-input">
          <div className="token-selector">
            <img src={fromToken?.logoURI} alt={fromToken?.symbol} />
            <span>{fromToken?.symbol}</span>
          </div>
          <input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => {
              setFromAmount(e.target.value)
            }}
          />
        </div>

        <button onClick={() => {
          const temp = fromToken;
          setFromToken(toToken);
          setToToken(temp);
        }} className="switch-button" title="Switch tokens">
          ↑↓
        </button>

        <div className="token-output">
          <div className="token-selector">
            <img src={toToken?.logoURI} alt={toToken?.symbol} />
            <span>{toToken?.symbol}</span>
          </div>
          <div className="output-amount">
            {isLoadingQuote ? 'Loading...' : formatOutputAmount()}
          </div>
        </div>

        {
          quoteInfo && (
            <>
              <div className="swap-summary">
                Rate: 1 {fromToken?.symbol} = {normalizeNumber(parseFloat(formatOutputAmount()) / parseFloat(fromAmount))} {toToken?.symbol}
              </div>
              <div className="swap-summary">
                Slippage: {formatSlippage(slippage)}
              </div>
              {feeData && <div className="swap-summary">
                Estimated Gas: {formatUSDPrice(getGasCostUSD())}
                {nativeTokenPrice ? ` (${normalizeWeiToString(Number(feeData.maxFeePerGas) * Number(quoteInfo.gas))} ${getNativeTokenSymbol(chainId)})` : ''}
              </div>}
            </>
          )
        }

        {txHash && (
          <div className="transaction-info">
            <a 
              href={`${chainId === 1 ? 'https://etherscan.io' : chainId === 56 ? 'https://bscscan.com' : 'https://explorer.blockchain.com'}/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View Transaction
            </a>
          </div>
        )}

        {quoteError && (
          <div className="error-message">
            {quoteError.message}
            <button onClick={() => refetch()} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {swapError && (
          <div className="error-message">
            Swap failed: {swapError instanceof Error ? swapError.message : 'Unknown error'}
          </div>
        )}

        <div className="slippage-container">
          <div className="slippage-header">
            <span>Slippage Tolerance: {formatSlippage(slippage)}</span>
          </div>
          <div className="slippage-slider">
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.005"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <button
          onClick={executeSwap}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping || isLoadingQuote || !!quoteError || !quoteInfo}
          className="swap-button"
        >
          {isLoadingQuote ? 'Getting Quote...' : 
           isPreparingSwap ? 'Preparing Swap...' : 
           'Swap Tokens'}
        </button>
      </div>
    </div>
  );
}

export default Swap;
