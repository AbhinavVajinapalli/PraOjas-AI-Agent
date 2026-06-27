import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IndexData, StockData, Portfolio, Transaction, Holding } from './types';
import { INITIAL_INDICES, getInitialStocks } from './data/niftyData';
import IndexSummary from './components/IndexSummary';
import MainChart from './components/MainChart';
import Heatmap from './components/Heatmap';
import StockList from './components/StockList';
import PortfolioComponent from './components/Portfolio';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  RefreshCw,
  BellRing,
  Info,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [indices, setIndices] = useState<IndexData[]>(() => {
    const saved = localStorage.getItem('nifty_indices');
    return saved ? JSON.parse(saved) : INITIAL_INDICES;
  });

  const [stocks, setStocks] = useState<StockData[]>(() => {
    const saved = localStorage.getItem('nifty_stocks');
    return saved ? JSON.parse(saved) : getInitialStocks();
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('nifty_watchlist');
    return saved ? JSON.parse(saved) : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
  });

  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem('nifty_portfolio');
    if (saved) return JSON.parse(saved);
    return {
      cash: 1000000, // ₹10,00,000 Paper Trading cash
      holdings: {},
      transactions: [],
    };
  });

  // Selected Stock/Index identifier
  const [selectedId, setSelectedId] = useState<string>('NIFTY50');
  const [selectedType, setSelectedType] = useState<'INDEX' | 'STOCK'>('INDEX');

  // Interactive trading overlay
  const [activeTradeStock, setActiveTradeStock] = useState<StockData | null>(null);

  // Live Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tick flash updates tracker (for ticker visual highlight)
  const [lastTickDirection, setLastTickDirection] = useState<'up' | 'down' | null>(null);

  // Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  // Save states to local storage on changes
  useEffect(() => {
    localStorage.setItem('nifty_indices', JSON.stringify(indices));
  }, [indices]);

  useEffect(() => {
    localStorage.setItem('nifty_stocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('nifty_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('nifty_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // --- DERIVED SELECTOR DETAILS ---
  const activeEntityDetails = useMemo(() => {
    if (selectedType === 'INDEX') {
      const idx = indices.find((i) => i.id === selectedId);
      if (idx) {
        return {
          name: idx.name,
          symbol: idx.id,
          price: idx.price,
          change: idx.change,
          changePercent: idx.changePercent,
          prevClose: idx.prevClose,
          open: idx.open,
          high: idx.high,
          low: idx.low,
          volume: idx.volume,
        };
      }
    } else {
      const stk = stocks.find((s) => s.symbol === selectedId);
      if (stk) {
        return {
          name: stk.name,
          symbol: stk.symbol,
          price: stk.price,
          change: stk.change,
          changePercent: stk.changePercent,
          prevClose: stk.prevClose,
          open: stk.open,
          high: stk.high,
          low: stk.low,
          volume: stk.volume,
        };
      }
    }
    // Fallback to Nifty 50 Index
    const fallback = indices[0];
    return {
      name: fallback.name,
      symbol: fallback.id,
      price: fallback.price,
      change: fallback.change,
      changePercent: fallback.changePercent,
      prevClose: fallback.prevClose,
      open: fallback.open,
      high: fallback.high,
      low: fallback.low,
      volume: fallback.volume,
    };
  }, [selectedId, selectedType, indices, stocks]);

  // Find stock object for trade submissions
  const selectedStockObj = useMemo(() => {
    if (selectedType === 'STOCK') {
      return stocks.find((s) => s.symbol === selectedId) || stocks[0];
    }
    return stocks[0];
  }, [selectedId, selectedType, stocks]);

  // --- ACTIONS ---
  const handleSelectIndex = (id: string) => {
    setSelectedId(id);
    setSelectedType('INDEX');
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedId(symbol);
    setSelectedType('STOCK');
  };

  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
    showToast(`${symbol} ${watchlist.includes(symbol) ? 'removed from' : 'added to'} watchlist`);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleResetPortfolio = () => {
    if (confirm('Are you sure you want to reset your Paper Trading wallet & transaction logs? This is irreversible.')) {
      setPortfolio({
        cash: 1000000,
        holdings: {},
        transactions: [],
      });
      showToast('Wallet reset successfully! Initialized with ₹10,00,000');
    }
  };

  const handleExecuteTrade = (symbol: string, type: 'BUY' | 'SELL', quantity: number, price: number) => {
    const totalCost = quantity * price;

    if (type === 'BUY') {
      if (portfolio.cash < totalCost) {
        showToast('Transaction Declined: Insufficient cash balance');
        return;
      }

      setPortfolio((prev) => {
        const currentHolding = prev.holdings[symbol] || { symbol, quantity: 0, avgBuyPrice: 0 };
        const newQuantity = currentHolding.quantity + quantity;
        const newAvgPrice =
          (currentHolding.quantity * currentHolding.avgBuyPrice + totalCost) / newQuantity;

        const updatedHoldings = {
          ...prev.holdings,
          [symbol]: {
            symbol,
            quantity: newQuantity,
            avgBuyPrice: parseFloat(newAvgPrice.toFixed(2)),
          },
        };

        const newTxn: Transaction = {
          id: `TX-${Date.now()}`,
          symbol,
          type: 'BUY',
          quantity,
          price,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          totalAmount: totalCost,
        };

        return {
          cash: prev.cash - totalCost,
          holdings: updatedHoldings,
          transactions: [...prev.transactions, newTxn],
        };
      });

      showToast(`Successfully bought ${quantity} shares of ${symbol} at ₹${price.toFixed(2)}`);
    } else {
      const currentHolding = portfolio.holdings[symbol];
      if (!currentHolding || currentHolding.quantity < quantity) {
        showToast('Transaction Declined: Insufficient share holdings');
        return;
      }

      setPortfolio((prev) => {
        const newQuantity = currentHolding.quantity - quantity;
        const updatedHoldings = { ...prev.holdings };
        
        if (newQuantity === 0) {
          delete updatedHoldings[symbol];
        } else {
          updatedHoldings[symbol] = {
            ...currentHolding,
            quantity: newQuantity,
          };
        }

        const newTxn: Transaction = {
          id: `TX-${Date.now()}`,
          symbol,
          type: 'SELL',
          quantity,
          price,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          totalAmount: totalCost,
        };

        return {
          cash: prev.cash + totalCost,
          holdings: updatedHoldings,
          transactions: [...prev.transactions, newTxn],
        };
      });

      showToast(`Successfully sold ${quantity} shares of ${symbol} at ₹${price.toFixed(2)}`);
    }

    setActiveTradeStock(null);
  };

  // --- LIVE SIMULATOR CLOCK AND PRICE FLUCTUATION TICKER ---
  useEffect(() => {
    // Sync current clock time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Dynamic price updates
    const simulatorInterval = setInterval(() => {
      setStocks((prevStocks) => {
        const nextStocks = prevStocks.map((stock) => {
          // Standard Brownian Motion stock price fluctuation (-0.55% to +0.6%)
          const pctChange = (Math.random() * 1.15 - 0.55) / 100;
          const priceChange = stock.price * pctChange;
          const nextPrice = Math.max(1, parseFloat((stock.price + priceChange).toFixed(2)));
          const change = parseFloat((nextPrice - stock.prevClose).toFixed(2));
          const changePercent = parseFloat(((change / stock.prevClose) * 100).toFixed(2));

          const newHigh = Math.max(stock.high, nextPrice);
          const newLow = Math.min(stock.low, nextPrice);

          // Update sparkline points (remove first, append new)
          const nextSparkline = [...stock.sparkline.slice(1), nextPrice];

          return {
            ...stock,
            price: nextPrice,
            change,
            changePercent,
            high: parseFloat(newHigh.toFixed(2)),
            low: parseFloat(newLow.toFixed(2)),
            sparkline: nextSparkline,
            lastUpdate: Date.now(),
          };
        });

        // Recalculate Indices based on constituent stock updates!
        setIndices((prevIndices) => {
          return prevIndices.map((index) => {
            let weightedChangePctSum = 0;
            let totalWeightSum = 0;

            if (index.id === 'NIFTY50') {
              // Nifty 50 responds to all stock weightages
              nextStocks.forEach((stk) => {
                weightedChangePctSum += stk.changePercent * stk.weight;
                totalWeightSum += stk.weight;
              });
            } else if (index.id === 'NIFTYBANK') {
              // Financial Services constituents
              nextStocks
                .filter((stk) => stk.sector === 'Financial Services')
                .forEach((stk) => {
                  weightedChangePctSum += stk.changePercent * stk.weight;
                  totalWeightSum += stk.weight;
                });
            } else if (index.id === 'NIFTYIT') {
              // Information Technology
              nextStocks
                .filter((stk) => stk.sector === 'Information Technology')
                .forEach((stk) => {
                  weightedChangePctSum += stk.changePercent * stk.weight;
                  totalWeightSum += stk.weight;
                });
            } else if (index.id === 'NIFTYPHARMA') {
              // Healthcare Pharma
              nextStocks
                .filter((stk) => stk.sector === 'Healthcare')
                .forEach((stk) => {
                  weightedChangePctSum += stk.changePercent * stk.weight;
                  totalWeightSum += stk.weight;
                });
            }

            const scaleFactor = totalWeightSum > 0 ? weightedChangePctSum / totalWeightSum : 0.05;
            // Generate visual motion direction
            setLastTickDirection(scaleFactor >= 0 ? 'up' : 'down');

            const nextPrice = parseFloat((index.prevClose * (1 + scaleFactor / 100)).toFixed(2));
            const change = parseFloat((nextPrice - index.prevClose).toFixed(2));
            const changePercent = parseFloat(((change / index.prevClose) * 100).toFixed(2));

            const high = parseFloat(Math.max(index.high, nextPrice).toFixed(2));
            const low = parseFloat(Math.min(index.low, nextPrice).toFixed(2));
            const sparkline = [...index.sparkline.slice(1), nextPrice];

            return {
              ...index,
              price: nextPrice,
              change,
              changePercent,
              high,
              low,
              sparkline,
            };
          });
        });

        return nextStocks;
      });
    }, 3800); // Ticks every ~3.8 seconds

    return () => {
      clearInterval(clockInterval);
      clearInterval(simulatorInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root-container">
      {/* 1. Header/Navigation Panel */}
      <header className="bg-slate-900/60 border-b border-slate-900 px-6 py-4 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                  Nifty Analytics
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-full uppercase font-sans">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                NSE India Index Tracker & Paper Trading Terminal
              </p>
            </div>
          </div>

          {/* Clock & Status info */}
          <div className="flex items-center gap-4 self-end md:self-auto text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-slate-300">{currentTime} IST</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 font-sans font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ₹1M Capital Active
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Indices sparklines Summary */}
        <IndexSummary
          indices={indices}
          selectedIndexId={selectedType === 'INDEX' ? selectedId : ''}
          onSelectIndex={handleSelectIndex}
        />

        {/* Dashboard Grid split (2/3 left chart + heatmap, 1/3 right stock list + portfolio) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-grid-layout">
          
          {/* LEFT SECTION (Main Interactive view) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Interactive chart display */}
            <div className="flex-1">
              <MainChart
                selectedName={activeEntityDetails.name}
                selectedSymbol={activeEntityDetails.symbol}
                currentPrice={activeEntityDetails.price}
                change={activeEntityDetails.change}
                changePercent={activeEntityDetails.changePercent}
                prevClose={activeEntityDetails.prevClose}
                open={activeEntityDetails.open}
                high={activeEntityDetails.high}
                low={activeEntityDetails.low}
                volume={activeEntityDetails.volume}
              />
            </div>

            {/* Constituents Heatmap */}
            <div>
              <Heatmap
                stocks={stocks}
                selectedSymbol={selectedType === 'STOCK' ? selectedId : ''}
                onSelectStock={handleSelectStock}
              />
            </div>
          </div>

          {/* RIGHT SECTION (Trade & Constituents lists) */}
          <div className="space-y-6 flex flex-col">
            
            {/* Trade & paper wallet ledger component */}
            <div>
              <PortfolioComponent
                portfolio={portfolio}
                stocks={stocks}
                selectedStock={selectedStockObj}
                onExecuteTrade={handleExecuteTrade}
                onResetPortfolio={handleResetPortfolio}
              />
            </div>

            {/* Comprehensive stocks list with search & tabs */}
            <div className="flex-1">
              <StockList
                stocks={stocks}
                selectedSymbol={selectedType === 'STOCK' ? selectedId : ''}
                watchlist={watchlist}
                onSelectStock={handleSelectStock}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenTradeModal={(stock) => {
                  setSelectedId(stock.symbol);
                  setSelectedType('STOCK');
                  setActiveTradeStock(stock);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer branding */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-5 text-center text-[11px] text-slate-500 font-sans">
        <p className="max-w-7xl mx-auto">
          Nifty Analytics is a simulated paper-trading platform. Market prices are updated with a realistic brownian motion algorithm responding dynamically to heavyweight index components. All trades are imaginary and designed strictly for practice.
        </p>
      </footer>

      {/* --- FLOATING ORDER POPUP MODAL --- */}
      <AnimatePresence>
        {activeTradeStock && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-850 p-6 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-200">Order Execution Ticket</h4>
                <button
                  onClick={() => setActiveTradeStock(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Stock Symbol</span>
                  <span className="text-sm font-extrabold text-slate-100 font-mono">{activeTradeStock.symbol}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Price per Share</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">₹{activeTradeStock.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Inline mini trade execution to keep modal simple and focus-oriented */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/60 flex flex-col gap-4">
                <PortfolioComponent
                  portfolio={portfolio}
                  stocks={stocks}
                  selectedStock={activeTradeStock}
                  onExecuteTrade={handleExecuteTrade}
                  onResetPortfolio={handleResetPortfolio}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- LIVE INTERACTIVE TOAST NOTIFICATIONS --- */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50" id="toast-notification">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/30 shadow-xl shadow-emerald-500/5 px-4.5 py-3 rounded-2xl flex items-center gap-3 text-xs font-sans font-bold"
            >
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
              </div>
              <span className="text-slate-200">{toastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
