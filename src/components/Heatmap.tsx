import React, { useState } from 'react';
import { StockData } from '../types';
import { Search, Grid, ListFilter } from 'lucide-react';

interface HeatmapProps {
  stocks: StockData[];
  selectedSymbol: string;
  onSelectStock: (symbol: string) => void;
}

export default function Heatmap({ stocks, selectedSymbol, onSelectStock }: HeatmapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Extract unique sectors
  const sectors = ['ALL', ...Array.from(new Set(stocks.map((s) => s.sector)))];

  // Filter stocks
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Helper to determine heat map cell styling
  const getCellStyles = (changePercent: number) => {
    if (changePercent >= 1.5) {
      return 'bg-emerald-500/30 border-emerald-500/60 hover:bg-emerald-500/40 text-emerald-100';
    } else if (changePercent > 0.2) {
      return 'bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300';
    } else if (changePercent >= -0.2) {
      return 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 text-slate-300';
    } else if (changePercent > -1.5) {
      return 'bg-rose-500/15 border-rose-500/30 hover:bg-rose-500/25 text-rose-300';
    } else {
      return 'bg-rose-500/30 border-rose-500/60 hover:bg-rose-500/40 text-rose-100';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col h-full" id="nifty-heatmap-section">
      {/* Title & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 font-sans flex items-center gap-2">
            <Grid className="w-5 h-5 text-emerald-500" />
            NIFTY 50 Index Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time visual map of the index components color-coded by daily change percentage.
          </p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-300 rounded-xl focus:outline-none focus:border-slate-700 font-sans"
            />
          </div>

          {/* Sector Selector */}
          <div className="relative w-full sm:w-56">
            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-300 rounded-xl focus:outline-none focus:border-slate-700 font-sans appearance-none cursor-pointer"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector === 'ALL' ? 'All Sectors' : sector}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 overflow-y-auto max-h-[360px] pr-1.5" id="heatmap-cells-container">
        {filteredStocks.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const isPositive = stock.change >= 0;
          const heatStyles = getCellStyles(stock.changePercent);

          return (
            <button
              key={stock.symbol}
              id={`heatmap-cell-${stock.symbol}`}
              onClick={() => onSelectStock(stock.symbol)}
              className={`group flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-300 ${heatStyles} ${
                isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-[0.98]' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold font-mono tracking-tight group-hover:underline">
                  {stock.symbol}
                </span>
                <span className="text-[10px] opacity-75 font-mono">
                  {stock.weight}%
                </span>
              </div>
              <div className="text-left mt-2">
                <div className="text-xs font-extrabold font-mono tracking-tight">
                  {isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </div>
                <div className="text-[10px] opacity-70 font-mono mt-0.5 truncate max-w-full">
                  ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </div>
              </div>

              {/* Tooltip on Hover */}
              <span className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-slate-100 text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 w-44 font-sans text-center">
                <span className="block font-bold">{stock.name}</span>
                <span className="block text-slate-400 text-[9px]">{stock.sector}</span>
              </span>
            </button>
          );
        })}

        {filteredStocks.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 font-sans">
            No matching shares found for "{searchTerm}" in sector "{selectedSector}".
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-800/60 text-[10px] font-sans font-bold tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-rose-500/40 border border-rose-500/70 rounded-md" /> &lt; -1.5%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-rose-500/15 border border-rose-500/30 rounded-md" /> -1.5% to -0.2%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-slate-800/40 border border-slate-700/50 rounded-md" /> Neutral (-0.2% to 0.2%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-emerald-500/15 border border-emerald-500/30 rounded-md" /> 0.2% to 1.5%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-emerald-500/40 border border-emerald-500/70 rounded-md" /> &gt; 1.5%
        </span>
      </div>
    </div>
  );
}
