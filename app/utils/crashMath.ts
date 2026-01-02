/**
 * Converts a target multiplier (e.g., 2.5x) into the Gamba bet array format.
 * Source: Gamba Platform Template
 */
export const calculateBetArray = (multiplier: number) => {
  const fraction = Math.round((multiplier % 1) * 100) / 100;
  let repeatMultiplier = 1;

  // Handle specific fractional payouts supported by the contract
  switch (fraction) {
    case 0.25: repeatMultiplier = 4; break;
    case 0.5:  repeatMultiplier = 2; break;
    case 0.75: repeatMultiplier = 4; break;
    default:   repeatMultiplier = 1; break;
  }

  const totalSum = multiplier * repeatMultiplier;
  const totalElements = Math.ceil(totalSum);
  const zerosToAdd = totalElements - repeatMultiplier;

  // e.g. 2.0x -> [2, 0]
  const betArray = Array.from({ length: repeatMultiplier }).map(() => multiplier);
  return betArray.concat(Array.from({ length: zerosToAdd }).map(() => 0));
};

/**
 * Generates a realistic "Crash" number for losing bets to simulate suspense.
 */
export const calculateBiasedLowMultiplier = (targetMultiplier: number) => {
  const randomValue = Math.random();
  const maxPossibleMultiplier = Math.min(targetMultiplier, 12);
  // Biased exponent to make crashes feel "fairly" distributed
  const exponent = randomValue > 0.95 ? 2.8 : (targetMultiplier > 10 ? 5 : 6);
  const result = 1 + Math.pow(randomValue, exponent) * (maxPossibleMultiplier - 1);
  return parseFloat(result.toFixed(2));
};