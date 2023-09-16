export function makeCurrency(value, currencyCode) {
    const code = currencyCode || 'USD';
    let usd = new Intl.NumberFormat('en-us', {
        style: 'currency',
        currency: code
    })
    return usd.format(value);
}
export function destructCurrency(value) {
    const hasCurrencySymbol = /[^\d.,]/.test(value);
    if (hasCurrencySymbol) {
        const numericPart = value.replace(/[^\d.,]/g, '');
        const numericValue = numericPart.replace(/,/g, '');
        return parseFloat(numericValue);
    } else {
        return parseFloat(value) || 0;
    }
}