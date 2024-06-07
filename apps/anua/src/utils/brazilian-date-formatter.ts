const brazilianDate = new Intl.DateTimeFormat("pt-BR");

export function brazilianDateFormatter(value: Date) {
  return brazilianDate.format(value);
}
