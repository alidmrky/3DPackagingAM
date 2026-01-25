import type { GAProgress } from '../types';

interface ProgressProps {
    progress: GAProgress;
}

export function Progress({ progress }: ProgressProps) {
    return (
        <div className="progress-container">
            <h3>⏳ Optimizasyon Devam Ediyor...</h3>
            <div className="progress-stats">
                <div className="stat-item">
                    <span className="stat-label">Jenerasyon</span>
                    <span className="stat-value">{progress.generation}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">En İyi Fitness</span>
                    <span className="stat-value">{progress.bestFitness.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Ortalama Fitness</span>
                    <span className="stat-value">{progress.averageFitness.toFixed(2)}</span>
                </div>
            </div>
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${(progress.generation / 100) * 100}%` }} />
            </div>
        </div>
    );
}
