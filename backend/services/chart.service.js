// services/chart.service.js
// Generates chart config for Chart.js (rendered on frontend)

function buildChartConfig(chartData, style = 'modern-tech') {
  if (!chartData || chartData.type === 'none') return null;

  const themes = {
    'modern-tech': { primary: '#6366f1', secondary: '#8b5cf6', bg: 'rgba(99,102,241,0.15)' },
    'corporate':   { primary: '#0ea5e9', secondary: '#0284c7', bg: 'rgba(14,165,233,0.15)' },
    'creative':    { primary: '#f43f5e', secondary: '#e11d48', bg: 'rgba(244,63,94,0.15)' },
  };

  const theme = themes[style] || themes['modern-tech'];
  const { type, title, labels = [], data = [] } = chartData;

  const base = {
    type,
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: type === 'pie'
          ? [theme.primary, theme.secondary, '#10b981', '#f59e0b', '#ef4444']
          : theme.bg,
        borderColor: type === 'pie' ? '#ffffff' : theme.primary,
        borderWidth: 2,
        borderRadius: type === 'bar' ? 6 : 0,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 11 } } },
        title: { display: true, text: title, color: '#f8fafc', font: { size: 14, weight: 'bold' } },
      },
      scales: type !== 'pie' ? {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
      } : undefined,
    },
  };

  return base;
}

module.exports = { buildChartConfig };
