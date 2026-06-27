import React, { useState, useMemo } from 'react';
import { Portfolio, StockData, Holding, Transaction } from '../types';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingCart, Clock } from 'lucide-react';

interface PortfolioProps {
  portfolio: Portfolio;
  stocks: StockData[];
  selectedStock: StockData;
  onExecuteTrade: (symbol: string, type: 'BUY' | 'SELL', quantity: number, price: number) => void;
  onResetPortfolio: () => void;
}

export default function PortfolioComponent({
  portfolio,
  stocks,
  selectedStock,
  onExecuteTrade,
  onResetPortfolio,
}: PortfolioProps) {
  const [tradeQuantity, setTradeQuantity] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'HOLDINGS' | 'TRADE' | 'HISTORY'>('HOLDINGS');

  // Create quick lookup for current prices of holdings
  const currentPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    stocks.forEach((s) => {
      prices[s.symbol] = s.price;
    });
    return prices;
  }, [stocks]);

  // Calculate portfolio statistics
  const stats = useMemo(() => {
    let investedValue = 0;
    let currentValuation = 0;

    Object.values(portfolio.holdings).forEach((holding) => {
      if (holding.quantity > 0) {
        investedValue += holding.quantity * holding.avgBuyPrice;
        const currentPrice = currentPrices[holding.symbol] || holding.avgBuyPrice;
        currentValuation += holding.quantity * currentPrice;
      }
    });

    const totalPortfolioValue = portfolio.cash + currentValuation;
    const overallPnL = currentValuation - investedValue;
    const overallPnLPercent = investedValue > 0 ? (overallPnL / investedValue) * 100 : 0;

    return {
      investedValue,
      currentValuation,
      totalPortfolioValue,
      overallPnL,
      overallPnLPercent,
    };
  }, [portfolio, currentPrices]);

  // Handle buy/sell from the trade tab
  const handleTradeSubmit = (type: 'BUY' | 'SELL') => {
    if (tradeQuantity <= 0) return;
    onExecuteTrade(selectedStock.symbol, type, tradeQuantity, selectedStock.price);
  };

  const isOverallPnLPositive = stats.overallPnL >= 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-full" id="portfolio-container-box">
      {/* Portfolio Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="portfolio-metric-cards">
        {/* Net Worth */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Valuation
          </span>
          <span className="text-xl font-bold font-mono text-slate-100 block">
            ₹{stats.totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Cash + Active Stock Holdings
          </span>
        </div>

        {/* Cash Balance */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Cash Remaining
          </span>
          <span className="text-xl font-bold font-mono text-slate-100 block flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-500" />
            ₹{portfolio.cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Paper Trading Credit
          </span>
        </div>

        {/* Invested Value */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Invested
          </span>
          <span className="text-xl font-bold font-mono text-slate-100 block">
            ₹{stats.investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            At average purchase price
          </span>
        </div>

        {/* Total Returns */}
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Overall Returns
          </span>
          <span
            className={`text-xl font-bold font-mono block ${
              isOverallPnLPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOverallPnLPositive ? '+' : ''}
            ₹{stats.overallPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isOverallPnLPositive ? 'text-emerald-400/80' : 'text-rose-400/80'
            }`}
          >
            {isOverallPnLPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {stats.overallPnLPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs font-bold mb-5" id="portfolio-tab-header">
        <button
          onClick={() => setActiveTab('HOLDINGS')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all duration-200 ${
            activeTab === 'HOLDINGS'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Holdings
        </button>
        <button
          onClick={() => setActiveTab('TRADE')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all duration-200 ${
            activeTab === 'TRADE'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Order Book
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2.5 rounded-lg text-center transition-all duration-200 ${
            activeTab === 'HISTORY'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Transaction History ({portfolio.transactions.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-1" id="portfolio-tabs-container">
        {/* HOLDINGS */}
        {activeTab === 'HOLDINGS' && (
          <div className="space-y-3">
            {Object.values(portfolio.holdings).filter((h) => h.quantity > 0).length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                You do not hold any stocks currently. Go to the "Order Book" or stock list to purchase shares.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
                      <th className="pb-2">Symbol</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Avg Price</th>
                      <th className="pb-2 text-right">LTP (Current)</th>
                      <th className="pb-2 text-right">Current Value</th>
                      <th className="pb-2 text-right">P&L (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {Object.values(portfolio.holdings)
                      .filter((h) => h.quantity > 0)
                      .map((holding) => {
                        const currentPrice = currentPrices[holding.symbol] || holding.avgBuyPrice;
                        const investedValue = holding.quantity * holding.avgBuyPrice;
                        const currentValuation = holding.quantity * currentPrice;
                        const pnl = currentValuation - investedValue;
                        const pnlPercent = (pnl / investedValue) * 100;
                        const isPos = pnl >= 0;

                        return (
                          <tr key={holding.symbol} className="hover:bg-slate-800/10 transition-colors">
                            <td className="py-3 font-sans font-bold text-slate-200">
                              {holding.symbol}
                            </td>
                            <td className="py-3 text-right text-slate-300">{holding.quantity}</td>
                            <td className="py-3 text-right text-slate-400">
                              ₹{holding.avgBuyPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 text-right text-slate-100">
                              ₹{currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 text-right text-slate-200">
                              ₹{currentValuation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </td>
                            <td className={`py-3 text-right font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                              <div>{isPos ? '+' : ''}₹{pnl.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</div>
                              <div className="text-[10px] font-medium opacity-85">
                                {isPos ? '+' : ''}
                                {pnlPercent.toFixed(2)}%
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDER BOOK (TRADE FORM) */}
        {activeTab === 'TRADE' && (
          <div className="space-y-4 max-w-md mx-auto py-2">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Target Stock
                  </span>
                  <span className="text-base font-bold text-slate-200 font-sans">
                    {selectedStock.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Current Market Price
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    ₹{selectedStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quantity input controls */}
              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs text-slate-400 font-medium font-sans">
                  Order Quantity (Shares)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTradeQuantity(Math.max(1, tradeQuantity - 1))}
                    className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-center font-mono py-1.5 text-sm text-slate-100 focus:outline-none"
                  />
                  <button
                    onClick={() => setTradeQuantity(tradeQuantity + 1)}
                    className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick helper shortcuts */}
              <div className="flex gap-2">
                {[5, 10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTradeQuantity(num)}
                    className={`flex-1 py-1 border text-[10px] font-bold rounded-md font-mono ${
                      tradeQuantity === num
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>

              {/* Estimated calculations */}
              <div className="border-t border-slate-900 pt-3 mt-1 space-y-2 font-mono text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Order Value:</span>
                  <span className="text-slate-200">
                    ₹{(tradeQuantity * selectedStock.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Brokerage & Levies:</span>
                  <span>FREE (Paper Trading)</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-2 text-sm font-bold text-slate-200">
                  <span>Estimated Total:</span>
                  <span className="text-slate-100">
                    ₹{(tradeQuantity * selectedStock.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Buy & Sell CTAs */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => handleTradeSubmit('BUY')}
                  disabled={portfolio.cash < tradeQuantity * selectedStock.price}
                  className="w-full py-3 bg-emerald-500 disabled:bg-emerald-500/20 disabled:text-slate-600 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-1.5 font-sans cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  BUY Shares
                </button>
                <button
                  onClick={() => handleTradeSubmit('SELL')}
                  disabled={(portfolio.holdings[selectedStock.symbol]?.quantity || 0) < tradeQuantity}
                  className="w-full py-3 bg-rose-500 disabled:bg-rose-500/20 disabled:text-slate-600 hover:bg-rose-400 text-slate-950 font-bold text-sm rounded-xl transition-all duration-300 shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 flex items-center justify-center gap-1.5 font-sans cursor-pointer"
                >
                  SELL Shares
                </button>
              </div>

              {/* Quick Holdings info */}
              <div className="text-[10px] text-slate-500 text-center font-sans">
                You currently own{' '}
                <span className="font-bold text-slate-400 font-mono">
                  {portfolio.holdings[selectedStock.symbol]?.quantity || 0} shares
                </span>{' '}
                of {selectedStock.symbol}.
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-2">
            {portfolio.transactions.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                No orders executed yet. Buy or sell shares to log history.
              </div>
            ) : (
              <div className="space-y-2" id="transactions-log-rows">
                {[...portfolio.transactions].reverse().map((txn) => {
                  const isBuy = txn.type === 'BUY';
                  return (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-extrabold ${
                            isBuy
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {txn.type}
                        </span>
                        <div>
                          <span className="font-sans font-bold text-slate-200 block">
                            {txn.symbol}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {txn.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block font-bold text-slate-200">
                          {txn.quantity} Shares @ ₹{txn.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Total: ₹{txn.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Reset controls */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-sans">
          Practice paper trading risk-free. Real-time updates active.
        </span>
        <button
          onClick={onResetPortfolio}
          className="text-[10px] font-bold text-rose-400/80 hover:text-rose-400 flex items-center gap-1 hover:underline font-sans cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Ledger
        </button>
      </div>
    </div>
  );
}
