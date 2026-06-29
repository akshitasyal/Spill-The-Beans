import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

export const CURRENCIES = [
  { code: 'INR', label: 'Auto Location', flag: 'https://flagcdn.com/w40/in.png', rate: 1.0, symbol: 'Rs. ' },
  { code: 'USD', label: 'US Dollar (USD)', flag: 'https://flagcdn.com/w40/us.png', rate: 0.012, symbol: '$' },
  { code: 'EUR', label: 'Euro (EUR)', flag: 'https://flagcdn.com/w40/eu.png', rate: 0.011, symbol: '€' },
  { code: 'GBP', label: 'British Pound (GBP)', flag: 'https://flagcdn.com/w40/gb.png', rate: 0.0094, symbol: '£' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)', flag: 'https://flagcdn.com/w40/ca.png', rate: 0.016, symbol: 'C$' },
  { code: 'AFN', label: 'Afghan Afghani (AFN)', flag: 'https://flagcdn.com/w40/af.png', rate: 0.85, symbol: 'Af' }
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('spill_the_beans_currency');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Handle migration from old emoji-based flags in localStorage
        if (parsed && typeof parsed.flag === 'string' && parsed.flag.startsWith('http')) {
          return parsed;
        }
      }
      return CURRENCIES[0];
    } catch {
      return CURRENCIES[0];
    }
  });

  useEffect(() => {
    localStorage.setItem('spill_the_beans_currency', JSON.stringify(currency));
  }, [currency]);

  // Convert and format price
  const formatPrice = (priceInINR) => {
    if (priceInINR === null || priceInINR === undefined) return '';
    const converted = priceInINR * currency.rate;
    // Format to 2 decimal places
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
