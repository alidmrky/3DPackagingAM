import { useState } from 'react';
import type { GAConfig } from '../types';

interface ControlsProps {
    onOptimize: (config: GAConfig) => void;
    isRunning: boolean;
    onExportIterations?: () => void;
    onExportResults?: () => void;
    hasResults?: boolean;
}

export function Controls({ onOptimize, isRunning, onExportIterations, onExportResults, hasResults }: ControlsProps) {
    const [config, setConfig] = useState<GAConfig>({
        populationSize: 50,
        generations: 100,
        crossoverRate: 0.8,
        mutationRate: 0.2,
        tournamentSize: 3,
    });

    const handleOptimize = () => {
        onOptimize(config);
    };

    return (
        <div className="controls">
            <h2>⚙️ Genetik Algoritma Ayarları</h2>

            <div className="config-grid">
                <div className="config-item">
                    <label>
                        Popülasyon Boyutu
                        <input
                            type="number"
                            value={config.populationSize}
                            onChange={e => setConfig({ ...config, populationSize: Number(e.target.value) })}
                            min="10"
                            max="200"
                            disabled={isRunning}
                        />
                    </label>
                </div>

                <div className="config-item">
                    <label>
                        Nesil Sayısı
                        <input
                            type="number"
                            value={config.generations}
                            onChange={e => setConfig({ ...config, generations: Number(e.target.value) })}
                            min="10"
                            max="500"
                            disabled={isRunning}
                        />
                    </label>
                </div>

                <div className="config-item">
                    <label>
                        Çaprazlama Oranı
                        <input
                            type="number"
                            step="0.1"
                            value={config.crossoverRate}
                            onChange={e => setConfig({ ...config, crossoverRate: Number(e.target.value) })}
                            min="0"
                            max="1"
                            disabled={isRunning}
                        />
                    </label>
                </div>

                <div className="config-item">
                    <label>
                        Mutasyon Oranı
                        <input
                            type="number"
                            step="0.1"
                            value={config.mutationRate}
                            onChange={e => setConfig({ ...config, mutationRate: Number(e.target.value) })}
                            min="0"
                            max="1"
                            disabled={isRunning}
                        />
                    </label>
                </div>

                <div className="config-item">
                    <label>
                        Turnuva Boyutu
                        <input
                            type="number"
                            value={config.tournamentSize}
                            onChange={e => setConfig({ ...config, tournamentSize: Number(e.target.value) })}
                            min="2"
                            max="10"
                            disabled={isRunning}
                        />
                    </label>
                </div>
            </div>

            <button
                onClick={handleOptimize}
                className="btn btn-primary btn-large"
                disabled={isRunning}
            >
                {isRunning ? '🔄 Optimizasyon Devam Ediyor...' : '🚀 Optimize Et'}
            </button>

            {hasResults && (
                <div className="button-group" style={{ marginTop: '1rem' }}>
                    <button
                        onClick={onExportIterations}
                        className="btn btn-secondary"
                        disabled={!hasResults}
                    >
                        📊 İterasyonları İndir
                    </button>
                    <button
                        onClick={onExportResults}
                        className="btn btn-secondary"
                        disabled={!hasResults}
                    >
                        📄 Sonuçları İndir
                    </button>
                </div>
            )}
        </div>
    );
}
