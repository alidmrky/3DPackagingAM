import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import type { GAProgress } from '../types';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ConvergenceChartProps {
    progressHistory: GAProgress[];
}

export function ConvergenceChart({ progressHistory }: ConvergenceChartProps) {
    if (progressHistory.length === 0) {
        return null;
    }

    // Prepare data
    const generations = progressHistory.map(p => p.generation);
    const bestFitness = progressHistory.map(p => p.bestFitness);
    const avgFitness = progressHistory.map(p => p.averageFitness);

    const chartData = {
        labels: generations,
        datasets: [
            {
                label: 'Best Fitness',
                data: bestFitness,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 1,
                pointHoverRadius: 5,
                tension: 0.1,
            },
            {
                label: 'Average Fitness',
                data: avgFitness,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 1,
                pointHoverRadius: 5,
                tension: 0.1,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e5e7eb',
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif',
                    },
                },
            },
            title: {
                display: true,
                text: 'Convergence of Best and Average Fitness Values',
                color: '#e5e7eb',
                font: {
                    size: 16,
                    weight: 'bold',
                    family: 'Inter, sans-serif',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#3b82f6',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Generation',
                    color: '#9ca3af',
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif',
                    },
                },
                ticks: {
                    color: '#9ca3af',
                    maxTicksLimit: 20,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Fitness Value (Max Lateness)',
                    color: '#9ca3af',
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif',
                    },
                },
                ticks: {
                    color: '#9ca3af',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    return (
        <div className="convergence-chart">
            <Line data={chartData} options={options} />
        </div>
    );
}
