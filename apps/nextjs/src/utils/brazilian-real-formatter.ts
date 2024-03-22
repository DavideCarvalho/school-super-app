const brazilianReal = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function brazilianRealFormatter(value: number) {
  return brazilianReal.format(value);
}
