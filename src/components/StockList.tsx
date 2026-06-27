import React, { useState } from 'react';
import { StockData } from '../types';
import { Search, Star, Eye, ArrowUpRight, ArrowDownRight, Award, Plus, DollarSign } from 'lucide-react';

interface StockListProps {
  stocks: StockData[];
  selectedSymbol: string;
  watchlist: string[];
  onSelectStock: (symbol: string) => void;
  onToggleWatchlist: (symbol: string) => void;
  onOpenTradeModal: (stock: StockData) => void;
}

export default function StockList({
  stocks,
  selectedSymbol,
  watchlist,
  onSelectStock,
  onToggleWatchlist,
  onOpenTradeModal,
}: StockListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'WATCHLIST' | 'GAINERS' | 'LOSERS'>('ALL');

  // Filter stocks based on search and active tab
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeTab) {
      case 'WATCHLIST':
        return watchlist.includes(stock.symbol);
      case 'GAINERS':
        return stock.changePercent > 0;
      case 'LOSERS':
        return stock.changePercent < 0;
      default:
        return true;
    }
  });

  // Sort gainers/losers by magnitude if those tabs are selected
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (activeTab === 'GAINERS') {
      return b.changePercent - a.changePercent;
    }
    if (activeTab === 'LOSERS') {
      return a.changePercent - b.changePercent;
    }
    // Default sorting by weight (descending)
    return b.weight - a.weight;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-full" id="stock-list-panel">
      {/* Search and Tabs */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Nifty constituents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-slate-300 rounded-xl focus:outline-none focus:border-slate-700 font-sans"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs font-bold" id="list-tab-filters">
          {(['ALL', 'WATCHLIST', 'GAINERS', 'LOSERS'] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-btn-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-center transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ALL'
                ? 'All'
                : tab === 'WATCHLIST'
                ? `Watchlist (${watchlist.length})`
                : tab === 'GAINERS'
                ? 'Top Gainers'
                : 'Top Losers'}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Ticker Directory */}
      <div className="flex-1 overflow-y-auto max-h-[500px] pr-1.5 space-y-2" id="stock-list-rows-container">
        {sortedStocks.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const isPositive = stock.change >= 0;
          const isFavorited = watchlist.includes(stock.symbol);

          return (
            <div
              key={stock.symbol}
              id={`stock-row-${stock.symbol}`}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-slate-950 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-950/70 hover:border-slate-700/60'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => onSelectStock(stock.symbol)}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(stock.symbol);
                  }}
                  className={`p-1.5 rounded-lg border transition-all duration-200 ${
                    isFavorited
                      ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10'
                      : 'text-slate-500 border-slate-800 bg-transparent hover:text-slate-400'
                  }`}
                  title={isFavorited ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-slate-100 tracking-tight">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-900 rounded font-sans font-medium uppercase tracking-wider">
                      {stock.weight}%
                    </span>
                  </div>
                  <span className="block text-[11px] text-slate-400 truncate max-w-[160px] font-sans mt-0.5">
                    {stock.name}
                  </span>
                </div>
              </div>

              {/* Right Prices */}
              <div className="flex items-center gap-4 text-right">
                <div className="cursor-pointer" onClick={() => onSelectStock(stock.symbol)}>
                  <span className="block font-mono font-bold text-sm text-slate-100">
                    ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center justify-end gap-0.5 text-xs font-mono font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {isPositive ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Buy / Trade Button */}
                <button
                  onClick={() => onOpenTradeModal(stock)}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-1 font-sans cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Trade
                </button>
              </div>
            </div>
          );
        })}

        {sortedStocks.length === 0 && (
          <div className="py-16 text-center text-xs text-slate-500 font-sans" id="empty-stock-list">
            No constituents matched the "{searchTerm}" criteria.
          </div>
        )}
      </div>

      {/* Quick Summary sector metadata */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-sans">
        <span className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          Nifty 50 Constituents Listed
        </span>
        <span className="font-bold text-slate-200">
          Showing {sortedStocks.length} of {stocks.length}
        </span>
      </div>
    </div>
  );
}
