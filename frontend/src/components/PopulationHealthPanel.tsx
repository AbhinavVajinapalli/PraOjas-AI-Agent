import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Patient } from '../types';
import { Users, Activity, GitCompare } from 'lucide-react';
import PatientComparisonView from './PatientComparisonView';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PopulationHealthPanelProps {
  patients: Patient[];
}

export default function PopulationHealthPanel({ patients }: PopulationHealthPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'compare'>('dashboard');

  const stats = useMemo(() => {
    if (patients.length === 0) return null;

    let totalHr = 0;
    let totalSpo2 = 0;
    let totalTemp = 0;
    let totalRr = 0;
    let totalSysBp = 0;

    patients.forEach(p => {
      totalHr += p.vitals.hr;
      totalSpo2 += p.vitals.spo2;
      totalTemp += p.vitals.temp;
      totalRr += p.vitals.rr;
      const sysBp = parseInt(p.vitals.bp.split('/')[0]) || 120;
      totalSysBp += sysBp;
    });

    return {
      hr: totalHr / patients.length,
      spo2: totalSpo2 / patients.length,
      temp: totalTemp / patients.length,
      rr: totalRr / patients.length,
      sysBp: totalSysBp / patients.length,
    };
  }, [patients]);

  const riskDistribution = useMemo(() => {
    const dist = { Low: 0, Medium: 0, High: 0 };
    patients.forEach(p => {
      if (p.status === 'Critical') dist.High++;
      else if (p.status === 'Warning') dist.Medium++;
      else dist.Low++;
    });
    return [
      { name: 'Low Risk', count: dist.Low, color: '#34d399' },
      { name: 'Medium Risk', count: dist.Medium, color: '#fbbf24' },
      { name: 'High Risk', count: dist.High, color: '#f43f5e' }
    ];
  }, [patients]);

  useEffect(() => {
    if (!stats || !svgRef.current) return;

    const data = [
      { name: 'Avg Heart Rate (bpm)', value: stats.hr, normalMin: 60, normalMax: 100, maxRange: 150, color: '#f43f5e' },
      { name: 'Avg Sys BP (mmHg)', value: stats.sysBp, normalMin: 90, normalMax: 120, maxRange: 200, color: '#3b82f6' },
      { name: 'Avg SpO2 (%)', value: stats.spo2, normalMin: 95, normalMax: 100, maxRange: 100, color: '#10b981' },
      { name: 'Avg Temp (°C)', value: stats.temp, normalMin: 36.5, normalMax: 37.5, maxRange: 42, color: '#f59e0b' },
      { name: 'Avg Resp Rate (bpm)', value: stats.rr, normalMin: 12, normalMax: 20, maxRange: 40, color: '#8b5cf6' },
    ];

    const margin = { top: 30, right: 30, bottom: 40, left: 160 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.4);

    // Draw normal ranges as background bands
    data.forEach(d => {
      const x = d3.scaleLinear().domain([0, d.maxRange]).range([0, width]);
      
      const yPos = y(d.name);
      if (yPos === undefined) return;

      // Full range background
      g.append("rect")
        .attr("x", 0)
        .attr("y", yPos)
        .attr("width", width)
        .attr("height", y.bandwidth())
        .attr("fill", "#0f172a")
        .attr("rx", 4);

      // Normal range band
      g.append("rect")
        .attr("x", x(d.normalMin))
        .attr("y", yPos)
        .attr("width", x(d.normalMax) - x(d.normalMin))
        .attr("height", y.bandwidth())
        .attr("fill", "#1e293b")
        .attr("rx", 4);

      // Actual average value bar
      g.append("rect")
        .attr("x", 0)
        .attr("y", yPos + y.bandwidth() * 0.25)
        .attr("width", 0) // Start at 0 for animation
        .attr("height", y.bandwidth() * 0.5)
        .attr("fill", d.color)
        .attr("rx", 2)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr("width", x(d.value));

      // Value text
      g.append("text")
        .attr("x", x(d.value) + 10)
        .attr("y", yPos + y.bandwidth() / 2)
        .attr("dy", "0.32em")
        .attr("fill", "#cbd5e1")
        .attr("font-size", "12px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .style("opacity", 0)
        .text(d.value.toFixed(1))
        .transition()
        .delay(800)
        .duration(400)
        .style("opacity", 1);
    });

    // Y Axis labels
    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain").remove();
      
    g.selectAll(".tick text")
      .attr("fill", "#94a3b8")
      .attr("font-size", "13px")
      .attr("font-weight", "bold")
      .attr("dx", "-10px");

    // Title
    svg.append("text")
      .attr("x", margin.left)
      .attr("y", 15)
      .attr("fill", "#64748b")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em")
      .text("Unit-Wide Average Vitals vs Normal Ranges");

  }, [stats]);

  if (!stats) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-slate-500 text-sm">
        <Users className="w-8 h-8 mb-3 text-slate-600" />
        <p>No active patients in ICU.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            {viewMode === 'dashboard' ? <Activity className="w-5 h-5" /> : <GitCompare className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
              {viewMode === 'dashboard' ? 'Population Health Dashboard' : 'Compare Patients'}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {viewMode === 'dashboard' ? 'Aggregated ICU roster statistics and vital trends' : 'Side-by-side patient comparison'}
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'dashboard' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Activity className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button 
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'compare' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <GitCompare className="w-3.5 h-3.5" /> Compare
          </button>
        </div>
      </div>

      {viewMode === 'compare' ? (
        <PatientComparisonView patients={patients} />
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Total Patients</span>
             <div className="text-xl font-bold font-mono text-slate-200 mt-1">{patients.length}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Critical / Warning</span>
             <div className="flex items-baseline gap-2 mt-1">
               <span className="text-xl font-bold font-mono text-rose-400">{patients.filter(p => p.status === 'Critical').length}</span>
               <span className="text-sm font-bold font-mono text-slate-600">/</span>
               <span className="text-xl font-bold font-mono text-amber-400">{patients.filter(p => p.status === 'Warning').length}</span>
             </div>
          </div>
          
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Age</span>
             <div className="text-xl font-bold font-mono text-slate-200 mt-1">
               {(patients.reduce((acc, p) => acc + p.age, 0) / patients.length).toFixed(1)} <span className="text-xs text-slate-500 font-sans font-normal">yrs</span>
             </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between col-span-2 md:col-span-3">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Demographics Breakdown</span>
             <div className="flex items-center justify-between mt-2 gap-4">
               <div className="flex-1">
                 <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                   <span>M: {patients.filter(p => p.gender === 'Male').length}</span>
                   <span>F: {patients.filter(p => p.gender === 'Female').length}</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                   <div style={{ width: `${(patients.filter(p => p.gender === 'Male').length / patients.length) * 100}%` }} className="h-full bg-blue-500" />
                   <div style={{ width: `${(patients.filter(p => p.gender === 'Female').length / patients.length) * 100}%` }} className="h-full bg-pink-500" />
                 </div>
               </div>
               
               <div className="flex-1 border-l border-slate-800 pl-4 flex gap-3 text-xs">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 uppercase">{"< 60"}</span>
                   <span className="font-mono text-slate-200">{patients.filter(p => p.age < 60).length}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 uppercase">{"60 - 75"}</span>
                   <span className="font-mono text-slate-200">{patients.filter(p => p.age >= 60 && p.age <= 75).length}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 uppercase">{"> 75"}</span>
                   <span className="font-mono text-slate-200">{patients.filter(p => p.age > 75).length}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-h-[300px] w-full bg-slate-950 rounded-2xl border border-slate-800/80 p-4">
            <svg ref={svgRef} className="w-full h-full" />
          </div>
          
          <div className="min-h-[300px] w-full bg-slate-950 rounded-2xl border border-slate-800/80 p-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Distribution</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }} 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
