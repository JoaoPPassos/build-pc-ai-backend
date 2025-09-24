export const stringToCurrencyString = (raw: string): string => {
  const cleaned = raw.replace(/&nbsp;/g, "").replace(/\s/g, "");

  return cleaned
  
}

export const stringToCurrencyNumber = (raw: string): number => {
  const cleaned = raw.replace(/&nbsp;/g, "").replace(/\s/g, "");

  // Remove currency symbol (R$)
  const noCurrency = cleaned.replace("R$", "").trim();

  // Convert to number: remove thousand separator "." and replace decimal "," with "."
  const numeric = parseFloat(noCurrency.replace(/\./g, "").replace(",", "."));
  return numeric
}