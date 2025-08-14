"use client";

import { getCurrencies } from '@/server-actions/user-actions/inventory.actions';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  currencies: Currency[];
};

const symbols: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'UGX': 'UGX'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>({ code: 'USD', symbol: '$', name: 'US Dollar' });
  const [currencies, setCurrencies] = useState<Currency[]>([]);

useEffect(() => {
  const fetchCurrencies = async () => {
    try {
      const currencyData = await getCurrencies(); // <-- call it
      const formatted = currencyData.map((c: any) => ({
        code: c.currency_code,
        symbol: symbols[c.currency_code] || c.currency_code,
        name: c.currency_name
      }));
      setCurrencies(formatted);
      if (formatted.length > 0) setCurrency(formatted[0]);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    }
  };
  
  fetchCurrencies();
}, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};