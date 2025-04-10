/**
 * Normalize a number to a human-readable format
 * @param value - The number to normalize
 * @param decimals - The number of decimals to normalize to
 * @returns The normalized number
 * @example normalizeWei("1000000000000000000", 18) => "1"
 */
export const normalizeWeiToString = (value: string | number, precision: number = 6, decimals: number = 18, ) => {
  // Convert to BigInt for the integer division
  const valueBigInt = BigInt(value);
  const divisor = BigInt(10 ** decimals);
  
  // Get the integer part
  const integerPart = (valueBigInt / divisor).toString();
  
  // Calculate the fractional part
  const remainder = valueBigInt % divisor;
  if (remainder === BigInt(0)) {
    return integerPart;
  }
  
  // Convert remainder to string with leading zeros
  let fractionalPart = remainder.toString().padStart(decimals, '0');
  
  // Apply precision limit if needed
  if (fractionalPart.length > precision) {
    fractionalPart = fractionalPart.substring(0, precision);
  }
  
  // Remove trailing zeros
  fractionalPart = fractionalPart.replace(/0+$/, '');
  
  return `${integerPart}.${fractionalPart}`;
}

export const convertNumberToWei = (value: number, decimals: number = 18) => {
  return BigInt(value * (10 ** decimals)).toString();
}

export const normalizeNumber = (value: number) => {
  if (value === 0) return '0';
  
  // Determine appropriate decimal places based on value range
  let decimalPlaces = 2; // Default
  
  if (value < 0.0001) {
    decimalPlaces = 12;
  } else if (value < 0.01) {
    decimalPlaces = 10;
  } else if (value < 0.1) {
    decimalPlaces = 8;
  } else if (value < 1) {
    decimalPlaces = 6;
  } else if (value >= 1 && value < 10) {
    decimalPlaces = 4;
  } else if (value >= 10 && value < 1000) {
    decimalPlaces = 2;
  } else if (value >= 1000) {
    decimalPlaces = 1;
  }
  
  // Format the number with the determined decimal places
  return value.toFixed(decimalPlaces).replace(/\.?0+$/, '');
}