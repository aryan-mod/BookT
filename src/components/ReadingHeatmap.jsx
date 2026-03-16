import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getColor(count) {
  if (!count) return 'rgba(255,255,255,0.04)';
  if (count < 10)  return 'rgba(124,58,237,0.25)';
  if (count < 30)  return 'rgba(124,58,237,0.5)';
  if (count < 60)  return 'rgba(124,58,237,0.75)';
  return '#7c3aed';
}

function getBorder(count) {
  if (!count) return 'rgba(255,255,255,0.03)';
  if (count < 10)  return 'rgba(124,58,237,0.3)';
  return 'rgba(124,58,237,0.6)';
}

export default function ReadingHeatmap({ dailyActivity = [] }) {
  const { weeks, monthLabels } = useMemo(() => {
    const actMap = {};
    (Array.isArray(dailyActivity) ? dailyActivity : []).forEach(d => {
      const key = typeof d.date === 'string' ? d.date.slice(0,10) : d._id;
      if (key) actMap[key] = d.pagesRead || d.pages || d.count || 0;
    });

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 6 * 7 + 1); // 6 weeks back

    const allDays = [];
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      allDays.push({
        date: d.toISOString().slice(0,10),
        count: actMap[d.toISOString().slice(0,10)] || 0,
        month: d.getMonth(),
        day: d.getDay(),
      });
    }

    // Group into weeks (Sun=0 → pad if needed)
    const ws = [];
    for (let i = 0; i < allDays.length; i += 7) {
      ws.push(allDays.slice(i, i + 7));
    }

    // Month labels
    const mLabels = [];
    ws.forEach((week, wi) => {
      const firstDayMonth = week[0]?.month;
      if (wi === 0 || ws[wi-1]?.[0]?.month !== firstDayMonth) {
        mLabels.push({ weekIdx: wi, label: MONTHS[firstDayMonth] });
      }
    });

    return { weeks: ws, monthLabels: mLabels };
  }, [dailyActivity]);

  const DAY_LABELS = ['S','M','T','W','T','F','S'];
  const maxPages = Math.max(...(Array.isArray(dailyActivity) ? dailyActivity : []).map(d => d.pagesRead || d.pages || 0), 1);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <Activity className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="font-bold text-white text-sm">Reading Heatmap</h3>
        <span className="ml-auto text-xs text-slate-500">Last 6 weeks</span>
      </div>

      {/* Month labels */}
      <div className="flex mb-1 ml-6 text-xs text-slate-600" style={{ gap: `${weeks.length > 0 ? 100/weeks.length : 14}%` }}>
        {monthLabels.map(ml => (
          <span key={`${ml.weekIdx}-${ml.label}`}>{ml.label}</span>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-3.5 flex items-center justify-center text-xs text-slate-600 w-3">{i % 2 === 1 ? d : ''}</div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 flex-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1 flex-1">
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week[di];
                if (!day) return <div key={di} className="h-3.5 rounded-sm" />;
                return (
                  <div
                    key={di}
                    title={day.count ? `${day.date}: ${day.count} pages` : day.date}
                    className="h-3.5 rounded-sm cursor-default transition-all duration-200 hover:scale-125 hover:z-10"
                    style={{
                      background: getColor(day.count),
                      border: `1px solid ${getBorder(day.count)}`,
                      boxShadow: day.count > 30 ? `0 0 6px rgba(124,58,237,0.5)` : 'none',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 ml-5">
        <span className="text-xs text-slate-600">Less</span>
        {[0, 10, 30, 60, 100].map(v => (
          <div key={v} className="w-3 h-3 rounded-sm border" style={{ background: getColor(v), borderColor: getBorder(v) }} />
        ))}
        <span className="text-xs text-slate-600">More</span>
      </div>
    </div>
  );
}
