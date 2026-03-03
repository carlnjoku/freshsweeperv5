export const formatAmountWithSymbol = (value, currencySymbol = "") => {
    if (value == null || isNaN(value)) return `${currencySymbol}0`;
  
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
  
    const format = (num, suffix) => {
      const formatted = num.toFixed(1);
      const clean = formatted.endsWith(".0")
        ? formatted.slice(0, -2)
        : formatted;
      return `${sign}${currencySymbol}${clean}${suffix}`;
    };
  
    if (absValue >= 1_000_000) {
      return format(absValue / 1_000_000, "M");
    }
  
    if (absValue >= 1_000) {
      return format(absValue / 1_000, "k");
    }
  
    // Below 1000 → keep up to 2 decimals
    const smallValue = Number.isInteger(value)
      ? absValue.toString()
      : absValue.toFixed(2);
  
    return `${sign}${currencySymbol}${smallValue}`;
  };