// components/ChartComponent.jsx

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const THEMES = {
  'modern-tech': { primary: '#6366f1', secondary: '#8b5cf6', bg: 'rgba(99,102,241,0.15)' },
  'corporate':   { primary: '#0ea5e9', secondary: '#0284c7', bg: 'rgba(14,165,233,0.15)' },
  'creative':    { primary: '#f43f5e', secondary: '#e11d48', bg: 'rgba(244,63,94,0.15)' },
};

export default function ChartComponent({ chartData, style = 'modern-tech' }) {
  if (!chartData || chartData.type === 'none') return null;

  const theme = THEMES[style] || THEMES['modern-tech'];
  const { type, title, labels = [], data = [] } = chartData;

  const chartConfig = {
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: type === 'pie' || type === 'doughnut'
          ? [theme.primary, theme.secondary, '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
          : theme.bg,
        borderColor: type === 'pie' || type === 'doughnut' ? '#0f172a' : theme.primary,
        borderWidth: 2,
        borderRadius: type === 'bar' ? 6 : 0,
        fill: type === 'line',
        tension: type === 'line' ? 0.4 : 0,
        pointBackgroundColor: theme.primary,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12, padding: 8 },
        },
        title: {
          display: !!title,
          text: title,
          color: '#e2e8f0',
          font: { size: 13, weight: 'bold' },
          padding: { bottom: 10 },
        },
      },
      scales: (type !== 'pie' && type !== 'doughnut') ? {
        x: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { color: 'rgba(148,163,184,0.08)' },
        },
        y: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { color: 'rgba(148,163,184,0.08)' },
        },
      } : undefined,
    },
  };

  const chartProps = {
    data: chartConfig.data,
    options: chartConfig.options,
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 200 }}>
      {type === 'bar' && <Bar {...chartProps} />}
      {type === 'line' && <Line {...chartProps} />}
      {type === 'pie' && <Pie {...chartProps} />}
      {type === 'doughnut' && <Doughnut {...chartProps} />}
    </div>
  );
}
