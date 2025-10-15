export const formatAmount = (x:number)=> new Intl.NumberFormat(undefined,{style:'currency',currency:'XOF',maximumFractionDigits:0}).format(x);
