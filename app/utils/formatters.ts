export const formatKMMD = (num: number, isFloat: boolean = false): string => {
  if ((num === null || num === undefined) && num!=0 && isFloat) return "Aucune note";
  if (num < 1000) {
    return isFloat ? num.toFixed(2) : Math.floor(num).toString();
  }

  const lookup = [
    { value: 1e9, symbol: "Md" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
  ];

  const item = lookup.find((item) => num >= item.value);
  if (item) {
    const res = num / item.value;
    // Si flottant, on garde 2 chiffres après virgule, sinon 1 seul avant le symbole
    const formatted = isFloat ? res.toFixed(2) : res.toFixed(1);
    return formatted.replace(/\.0$/, "") + item.symbol;
  }
  
  return num.toString();
};