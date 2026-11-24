import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { ChartDatasetSpec } from '../types/archive';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface ScientificChartsProps {
  spec: ChartDatasetSpec;
}

export function ScientificCharts({ spec }: ScientificChartsProps) {
  const data = {
    labels: spec.labels,
    datasets: [
      {
        label: `${spec.datasetLabel} (${spec.unit})`,
        data: spec.data,
        borderColor: '#6C9EFF',
        backgroundColor:
          spec.type === 'bar' ? 'rgba(108, 158, 255, 0.55)' : 'rgba(108, 158, 255, 0.16)',
        borderWidth: 2,
        pointBackgroundColor: '#E5B66A',
        pointBorderColor: '#0B1020',
        pointRadius: 4,
        tension: 0.3,
        fill: spec.type === 'line',
        borderRadius: spec.type === 'bar' ? 6 : 0,
      },
    ],
  };

  const commonOptions: ChartOptions<'line'> & ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#CBD6F0',
          font: { family: 'Inter, sans-serif', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0B1020',
        titleColor: '#E5B66A',
        bodyColor: '#F4F6FB',
        borderColor: 'rgba(108, 158, 255, 0.4)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#A8B3CF', font: { size: 11 } },
        grid: { color: 'rgba(148, 173, 224, 0.08)' },
      },
      y: {
        ticks: { color: '#A8B3CF', font: { size: 11 } },
        grid: { color: 'rgba(148, 173, 224, 0.08)' },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1527] p-5 sm:p-6">
      <div className="mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E5B66A]">
          Empirical Measurement Chart
        </span>
        <h4 className="font-editorial text-xl font-semibold text-white">{spec.title}</h4>
        <p className="mt-1 text-xs text-[#A8B3CF]">{spec.subtitle}</p>
      </div>
      <div className="h-64 w-full">
        {spec.type === 'bar' ? (
          <Bar data={data} options={commonOptions as ChartOptions<'bar'>} />
        ) : (
          <Line data={data} options={commonOptions as ChartOptions<'line'>} />
        )}
      </div>
      <p className="mt-3 text-[11px] text-[#7D89A8]">Data Note: {spec.sourceNote}</p>
    </div>
  );
}
