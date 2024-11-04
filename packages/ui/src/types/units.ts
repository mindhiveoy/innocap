/** 
 * Available unit types for measurements
 * @constant
 */
export const UNITS = {
  PERCENTAGE: '%',
  EMISSIONS: 'kg CO2-ekv/k-m2]',
  ENERGY: 'MWh/k-m2'
} as const;

export type Unit = typeof UNITS[keyof typeof UNITS];

/** Represents a range of numeric data with minimum and maximum values */
interface DataRange {
  min: number;
  max: number;
}

/**
 * Calculates the minimum and maximum values from an array of numbers
 * @param values - Array of numeric values
 * @returns DataRange object containing min and max values
 */
const calculateDataRange = (values: number[]): DataRange => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
};

/**
 * Creates a normalized scale value based on the specified scale type
 * @param value - The value to normalize
 * @param range - The data range containing min and max values
 * @param type - The type of scale to apply
 * @returns Normalized value between 0 and 1
 */
const createScale = (value: number, range: DataRange, type: 'linear' | 'logarithmic' | 'quantile') => {
  switch (type) {
    case 'linear':
      return (value - range.min) / (range.max - range.min);

    case 'logarithmic': {
      const logMin = Math.log(range.min || 0.0001);
      const logMax = Math.log(range.max);
      return (Math.log(value) - logMin) / (logMax - logMin);
    }

    case 'quantile':
      return (value - range.min) / (range.max - range.min);
  }
};

/**
 * Determines the appropriate scale type based on the unit of measurement
 * @param unit - The unit of measurement
 * @returns The scale type to use for normalization
 */
export const getScaleType = (unit: Unit): 'linear' | 'logarithmic' | 'quantile' => {
  switch (unit) {
    case UNITS.PERCENTAGE:
      return 'linear';
    case UNITS.EMISSIONS:
      return 'quantile';
    case UNITS.ENERGY:
      return 'logarithmic';
    default:
      return 'linear';
  }
};

/**
 * Calculates an opacity value for visualization based on the value's position within its dataset
 * @param value - The value to calculate opacity for
 * @param values - The complete dataset of values
 * @param unit - The unit of measurement
 * @returns Opacity value between 0.2 and 0.8
 */
export const calculateOpacity = (value: number, values: number[], unit: Unit): number => {
  const range = calculateDataRange(values);
  const scaleType = getScaleType(unit);
  const normalizedValue = createScale(value, range, scaleType);
  return 0.2 + (normalizedValue * 0.6);
}; 