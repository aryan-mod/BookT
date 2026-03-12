import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const monthLabel = (item) => {
  if (!item) return '';
  const date = new Date(item.year, item.month - 1, 1);
  return date.toLocaleString(undefined, { month: 'short' });
};

const ReadingCharts = ({ monthlyActivity }) => {
  const data = Array.isArray(monthlyActivity) ? monthlyActivity : [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Monthly Reading Activity
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Books completed and pages read over the last 12 months.
        </p>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
            <XAxis
              dataKey={monthLabel}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderRadius: '0.75rem',
                border: '1px solid #374151',
                color: '#e5e7eb',
                fontSize: '0.75rem',
              }}
            />
            <Legend verticalAlign="top" height={24} iconSize={8} />
            <Bar
              dataKey="booksCompleted"
              name="Books"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="pagesRead"
              name="Pages"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-44">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Reading Time Trend
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
            <XAxis
              dataKey={monthLabel}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderRadius: '0.75rem',
                border: '1px solid #374151',
                color: '#e5e7eb',
                fontSize: '0.75rem',
              }}
            />
            <Line
              type="monotone"
              dataKey="minutesRead"
              name="Minutes read"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReadingCharts;

