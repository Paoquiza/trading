export const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
  'AUD/USD', 'NZD/USD', 'USD/CAD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  'AUD/JPY', 'CHF/JPY', 'EUR/AUD',
  'EUR/CAD', 'EUR/CHF', 'GBP/AUD',
  'GBP/CAD', 'GBP/CHF', 'AUD/CAD',
  'AUD/CHF', 'NZD/JPY', 'NZD/CAD',
  'XAU/USD', 'XAG/USD',
] as const

export const JPY_PAIRS = [
  'USD/JPY', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY',
  'CHF/JPY', 'NZD/JPY',
]

// Pip value per standard lot (100,000 units) for USD-quoted pairs
// For JPY pairs, 1 pip = 0.01; for others, 1 pip = 0.0001
export const PIP_VALUES: Record<string, number> = {
  'EUR/USD': 10,
  'GBP/USD': 10,
  'AUD/USD': 10,
  'NZD/USD': 10,
  'USD/JPY': 6.67,
  'USD/CHF': 10.6,
  'USD/CAD': 7.25,
  'EUR/GBP': 12.5,
  'EUR/JPY': 6.67,
  'GBP/JPY': 6.67,
  'AUD/JPY': 6.67,
  'CHF/JPY': 6.67,
  'EUR/AUD': 6.5,
  'EUR/CAD': 7.25,
  'EUR/CHF': 10.6,
  'GBP/AUD': 6.5,
  'GBP/CAD': 7.25,
  'GBP/CHF': 10.6,
  'AUD/CAD': 7.25,
  'AUD/CHF': 10.6,
  'NZD/JPY': 6.67,
  'NZD/CAD': 7.25,
  'XAU/USD': 10,
  'XAG/USD': 50,
}
