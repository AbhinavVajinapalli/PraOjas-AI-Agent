import { StockData, IndexData, HistoricalBar, Timeframe } from '../types';

export const NIFTY_STOCKS_METADATA = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy', weight: 9.8, basePrice: 2850 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financial Services', weight: 8.5, basePrice: 1620 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Information Technology', weight: 7.2, basePrice: 3850 },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Information Technology', weight: 5.8, basePrice: 1480 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financial Services', weight: 5.5, basePrice: 1120 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecommunication', weight: 4.2, basePrice: 1350 },
  { symbol: 'LARTON', name: 'Larsen & Toubro Ltd.', sector: 'Construction', weight: 3.8, basePrice: 3450 },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'Fast Moving Consumer Goods', weight: 3.5, basePrice: 430 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services', weight: 3.2, basePrice: 830 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'Fast Moving Consumer Goods', weight: 3.0, basePrice: 2450 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Financial Services', weight: 2.8, basePrice: 1150 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Financial Services', weight: 2.6, basePrice: 1720 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobile', weight: 2.4, basePrice: 960 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services', weight: 2.2, basePrice: 6850 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobile', weight: 2.0, basePrice: 2150 },
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Energy', weight: 1.8, basePrice: 360 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', sector: 'Healthcare', weight: 1.7, basePrice: 1460 },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Durables', weight: 1.6, basePrice: 3250 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Metals & Mining', weight: 1.5, basePrice: 3120 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Construction Materials', weight: 1.4, basePrice: 9800 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', sector: 'Energy', weight: 1.3, basePrice: 280 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals & Mining', weight: 1.2, basePrice: 145 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Energy', weight: 1.1, basePrice: 440 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobile', weight: 1.0, basePrice: 12100 },
];

export const SECTORS = [
  { name: 'Financial Services', weight: 31.8, color: '#3b82f6' },
  { name: 'Information Technology', weight: 13.0, color: '#10b981' },
  { name: 'Energy', weight: 15.1, color: '#f59e0b' },
  { name: 'Fast Moving Consumer Goods', weight: 9.5, color: '#ec4899' },
  { name: 'Automobile', weight: 5.4, color: '#8b5cf6' },
  { name: 'Construction', weight: 3.8, color: '#06b6d4' },
  { name: 'Healthcare', weight: 4.2, color: '#14b8a6' },
  { name: 'Metals & Mining', weight: 3.8, color: '#64748b' },
  { name: 'Other Sectors', weight: 13.4, color: '#a855f7' },
];

export const INITIAL_INDICES: IndexData[] = [
  {
    id: 'NIFTY50',
    name: 'NIFTY 50',
    price: 23450.75,
    change: 145.20,
    changePercent: 0.62,
    prevClose: 23305.55,
    open: 23320.10,
    high: 23485.30,
    low: 23310.45,
    volume: 245000000,
    sparkline: [23305, 23325, 23315, 23350, 23380, 23370, 23410, 23430, 23420, 23450],
  },
  {
    id: 'NIFTYBANK',
    name: 'NIFTY BANK',
    price: 51200.40,
    change: 450.80,
    changePercent: 0.89,
    prevClose: 50749.60,
    open: 50800.00,
    high: 51320.60,
    low: 50780.20,
    volume: 125000000,
    sparkline: [50749, 50810, 50790, 50950, 51020, 51000, 51150, 51180, 51110, 51200],
  },
  {
    id: 'NIFTYIT',
    name: 'NIFTY IT',
    price: 38450.50,
    change: -120.30,
    changePercent: -0.31,
    prevClose: 38570.80,
    open: 38600.20,
    high: 38650.00,
    low: 38380.50,
    volume: 45000000,
    sparkline: [38570, 38590, 38610, 38540, 38490, 38510, 38460, 38480, 38420, 38450],
  },
  {
    id: 'NIFTYPHARMA',
    name: 'NIFTY PHARMA',
    price: 19800.15,
    change: 85.45,
    changePercent: 0.43,
    prevClose: 19714.70,
    open: 19725.00,
    high: 19830.50,
    low: 19710.10,
    volume: 18000000,
    sparkline: [19714, 19730, 19720, 19745, 19770, 19760, 19785, 19795, 19780, 19800],
  },
];

export function getInitialStocks(): StockData[] {
  return NIFTY_STOCKS_METADATA.map((stock) => {
    // Generate static-looking base values
    const changePercent = (Math.random() * 2 - 0.8); // slight positive bias
    const change = (stock.basePrice * changePercent) / 100;
    const price = stock.basePrice + change;
    const prevClose = stock.basePrice;
    
    // Sparkline of 10 points
    const sparkline: number[] = [];
    let current = prevClose;
    for (let i = 0; i < 10; i++) {
      current += (Math.random() * 2 - 0.95) * (current * 0.005);
      sparkline.push(current);
    }
    sparkline.push(price);

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      prevClose,
      open: parseFloat((prevClose * (1 + (Math.random() * 0.4 - 0.2) / 100)).toFixed(2)),
      high: parseFloat((price * (1 + Math.random() * 0.5 / 100)).toFixed(2)),
      low: parseFloat((price * (1 - Math.random() * 0.5 / 100)).toFixed(2)),
      volume: Math.floor(1000000 + Math.random() * 15000000),
      weight: stock.weight,
      sparkline,
      lastUpdate: Date.now(),
    };
  });
}

// Generate high quality historical data based on timeframe, symbol, and price
export function generateHistoricalData(
  symbol: string,
  basePrice: number,
  timeframe: Timeframe
): HistoricalBar[] {
  const data: HistoricalBar[] = [];
  let pointsCount = 50;
  let intervalDays = 1;

  switch (timeframe) {
    case '1D':
      pointsCount = 40; // 9:15 to 3:30 in roughly 10-minute blocks
      break;
    case '1W':
      pointsCount = 7;
      intervalDays = 1;
      break;
    case '1M':
      pointsCount = 30;
      intervalDays = 1;
      break;
    case '1Y':
      pointsCount = 52; // weekly data
      intervalDays = 7;
      break;
    case '5Y':
      pointsCount = 60; // monthly data
      intervalDays = 30;
      break;
  }

  const now = new Date();
  let currentPrice = basePrice * (0.85 + Math.random() * 0.1); // Start slightly lower so it rises
  
  if (timeframe === '1D') {
    // Generate minute or hour points for today
    const startHour = 9;
    const startMin = 15;
    
    for (let i = 0; i < pointsCount; i++) {
      const minutesElapsed = i * 9.375; // Spread 375 minutes (9:15 to 15:30)
      const currentMinTotal = startMin + minutesElapsed;
      const hour = startHour + Math.floor(currentMinTotal / 60);
      const min = Math.floor(currentMinTotal % 60);
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      const priceChangePercent = (Math.random() * 0.6 - 0.28); // general upward drift
      const change = (currentPrice * priceChangePercent) / 100;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + (Math.random() * 0.15 * currentPrice) / 100;
      const low = Math.min(open, close) - (Math.random() * 0.15 * currentPrice) / 100;
      const volume = Math.floor(100000 + Math.random() * 900000);

      data.push({
        time: timeStr,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
      });

      currentPrice = close;
    }
  } else {
    // Multi-day charts
    for (let i = pointsCount - 1; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * intervalDays * 24 * 60 * 60 * 1000);
      let timeStr = '';
      
      if (timeframe === '1W' || timeframe === '1M') {
        timeStr = targetDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      } else if (timeframe === '1Y') {
        timeStr = targetDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      } else {
        timeStr = targetDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      }

      // Add standard random walk with some trend
      const drift = timeframe === '5Y' ? 0.08 : 0.03; // long-term growth
      const volatility = timeframe === '1W' ? 0.01 : timeframe === '1M' ? 0.015 : 0.025;
      const priceChangePercent = (Math.random() * 2 - 1 + drift) * volatility * 100;
      const change = (currentPrice * priceChangePercent) / 100;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const volume = Math.floor(2000000 + Math.random() * 15000000);

      data.push({
        time: timeStr,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
      });

      currentPrice = close;
    }
  }

  // Ensure last point aligns with current actual stock/index price
  if (data.length > 0) {
    data[data.length - 1].close = basePrice;
  }

  return data;
}
