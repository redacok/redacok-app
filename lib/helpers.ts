const Currencies = [
  { value: "EUR", label: "€ Euro", locale: "fr-FR" },
  { value: "XAF", label: "Franc CFA", locale: "fr-FR" },
  { value: "USD", label: "$ Dollar", locale: "en-EN" },
];

export function DateToUTCDate(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export function getFormatterForCurrency(currency: string) {
  const locale = Currencies.find((c) => c.value === currency)?.locale;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}
