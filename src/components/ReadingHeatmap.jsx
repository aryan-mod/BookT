import React, { useMemo } from 'react';

const getColorForMinutes = (minutes) => {
  if (!minutes || minutes <= 0) return 'bg-gray-100 dark:bg-gray-800';
  if (minutes < 10) return 'bg-emerald-100 dark:bg-emerald-900';
  if (minutes < 30) return 'bg-emerald-300 dark:bg-emerald-700';
  if (minutes < 60) return 'bg-emerald-500 dark:bg-emerald-600';
  return 'bg-emerald-700 dark:bg-emerald-500';
};

const ReadingHeatmap = ({ dailyActivity }) => {
  const cells = useMemo(() => {
    const map = new Map();
    (dailyActivity || []).forEach((d) => {
      map.set(d.date, d.minutesRead || 0);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeks = [];
    // Show last 16 weeks (~4 months)
    for (let w = 15; w >= 0; w -= 1) {
      const week = [];
      for (let d = 6; d >= 0; d -= 1) {
        const offsetDays = w * 7 + d;
        const date = new Date(today);
        date.setDate(today.getDate() - offsetDays);
        const key = date.toISOString().slice(0, 10);
        const minutes = map.get(key) || 0;
        week.unshift({
          key,
          minutes,
          date,
        });
      }
      weeks.push(week);
    }
    return weeks;
  }, [dailyActivity]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reading Heatmap
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Each square represents a day of reading over the last few months.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex items-start space-x-1">
          <div className="flex flex-col mr-1 mt-5 space-y-1 text-[10px] text-gray-400 dark:text-gray-500">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex space-x-1">
            {cells.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col space-y-1">
                {week.map((day, dIndex) => {
                  const weekday = day.date.getDay();
                  if (weekday === 0 || weekday === 6) {
                    return (
                      <div
                        key={day.key}
                        className="w-3 h-3 rounded-sm bg-transparent"
                      />
                    );
                  }
                  const color = getColorForMinutes(day.minutes);
                  return (
                    <div
                      key={day.key}
                      className={`w-3 h-3 rounded-sm ${color}`}
                      title={`${day.key}: ${day.minutes || 0} min`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end space-x-2 text-[10px] text-gray-400 dark:text-gray-500">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ReadingHeatmap;

