export function formatMoney(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueInCents / 100);
}

export function installments(valueInCents: number) {
  return `ou 3x de ${formatMoney(Math.ceil(valueInCents / 3))} sem juros`;
}
