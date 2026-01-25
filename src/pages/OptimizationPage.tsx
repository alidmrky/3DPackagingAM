import { useState } from 'react';
import type { Part, Machine, GAConfig, PlacementResult, GAProgress, Individual } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Controls } from '../components/Controls';
import { Results } from '../components/Results';
import { Visualization } from '../components/Visualization';
import { Progress } from '../components/Progress';
import { Modal } from '../components/shared/Modal';
import { DATASET_CONFIG } from '../config/datasetConfig';
import { exportIterationReport, exportResultsReport, downloadTextFile, generateFilename } from '../utils/reportExport';
import { ConvergenceChart } from '../components/ConvergenceChart';

// Dataset imports
import defaultParts from '../data/parts.json';
import academicParts from '../data/parts2.json';
import academic2Parts from '../data/parts3.json';
import defaultMachines from '../data/machines.json';
import academicMachines from '../data/machines2.json';
import academic2Machines from '../data/machines3.json';

const activeDatasetKey = DATASET_CONFIG.ACTIVE_DATASET;
const selectedParts =
    activeDatasetKey === 'academic' ? academicParts :
        activeDatasetKey === 'academic2' ? academic2Parts :
            defaultParts;
const selectedMachines =
    activeDatasetKey === 'academic' ? academicMachines :
        activeDatasetKey === 'academic2' ? academic2Machines :
            defaultMachines;

export function OptimizationPage() {
    const [parts] = useLocalStorage<Part[]>('parts', selectedParts as Part[]);
    const [machines] = useLocalStorage<Machine[]>('machines', selectedMachines as Machine[]);
    const [result, setResult] = useState<PlacementResult | null>(null);
    const [progress, setProgress] = useState<GAProgress | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showMachinesModal, setShowMachinesModal] = useState(false);
    const [showPartsModal, setShowPartsModal] = useState(false);
    const [progressHistory, setProgressHistory] = useState<GAProgress[]>([]);

    const handleOptimize = (config: GAConfig) => {
        if (parts.length === 0 || machines.length === 0) {
            alert('Lütfen önce Makineler ve Parçalar sayfalarından veri ekleyin!');
            return;
        }

        setIsRunning(true);
        setResult(null);
        setProgress(null);
        setProgressHistory([]);

        const worker = new Worker(
            new URL('../workers/gaWorker.ts', import.meta.url),
            { type: 'module' }
        );

        worker.onmessage = (event) => {
            const { type, data } = event.data;

            if (type === 'progress') {
                const progressData = data as GAProgress;
                setProgress(progressData);
                setProgressHistory(prev => [...prev, progressData]);
            } else if (type === 'complete') {
                const individual = data as Individual;
                setResult(individual.placementResult || null);
                setIsRunning(false);
                worker.terminate();
            }
        };

        worker.onerror = (error) => {
            console.error('Worker error:', error);
            alert('Optimizasyon sırasında bir hata oluştu!');
            setIsRunning(false);
            worker.terminate();
        };

        worker.postMessage({ parts, machines, config });
    };

    const handleDownloadLog = () => {
        if (!result || !result.placementLog) {
            alert('Önce optimizasyon yapın!');
            return;
        }

        const dataStr = JSON.stringify(result.placementLog, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `placement_log_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportIterations = () => {
        if (progressHistory.length === 0) {
            alert('Önce optimizasyon yapın!');
            return;
        }

        const report = exportIterationReport(progressHistory, parts, machines);
        const filename = generateFilename('iterations');
        downloadTextFile(report, filename);
    };

    const handleExportResults = () => {
        if (!result) {
            alert('Önce optimizasyon yapın!');
            return;
        }

        const report = exportResultsReport(result, parts, machines);
        const filename = generateFilename('results');
        downloadTextFile(report, filename);
    };

    const activeDataset = DATASET_CONFIG.DATASETS[activeDatasetKey];

    return (
        <div className="optimization-page">
            {/* Data Summary Cards */}
            <div className="data-summary">
                <div className="summary-card" onClick={() => setShowMachinesModal(true)}>
                    <div className="summary-icon">🏭</div>
                    <div className="summary-content">
                        <h3>Mevcut Makineler</h3>
                        <p className="summary-count">{machines.length}</p>
                        <button className="btn-link">Detayları Gör</button>
                    </div>
                </div>

                <div className="summary-card" onClick={() => setShowPartsModal(true)}>
                    <div className="summary-icon">📦</div>
                    <div className="summary-content">
                        <h3>Mevcut Parçalar</h3>
                        <p className="summary-count">{parts.length}</p>
                        <button className="btn-link">Detayları Gör</button>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-content">
                        <h3>Aktif Dataset</h3>
                        <p className="summary-count" style={{ fontSize: '1.2rem' }}>{activeDataset.description}</p>
                    </div>
                </div>
            </div>

            {/* GA Controls */}
            <div className="controls-section">
                <Controls
                    onOptimize={handleOptimize}
                    isRunning={isRunning}
                    onExportIterations={handleExportIterations}
                    onExportResults={handleExportResults}
                    hasResults={result !== null}
                />
                {result && result.placementLog && (
                    <button onClick={handleDownloadLog} className="btn btn-secondary">
                        📥 Yerleşim Log'unu İndir
                    </button>
                )}
            </div>

            {/* Progress */}
            {isRunning && progress && (
                <div className="progress-section">
                    <Progress progress={progress} />
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="results-section">
                    <Results result={result} />

                    {/* Convergence Chart */}
                    {progressHistory.length > 0 && (
                        <div className="convergence-section">
                            <ConvergenceChart progressHistory={progressHistory} />
                        </div>
                    )}

                    <Visualization result={result} />
                </div>
            )}

            {/* Machines Modal */}
            <Modal
                isOpen={showMachinesModal}
                onClose={() => setShowMachinesModal(false)}
                title="Mevcut Makineler"
            >
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Genişlik</th>
                                <th>Derinlik</th>
                                <th>Yükseklik</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.map(m => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>{m.xKen}</td>
                                    <td>{m.yKenar}</td>
                                    <td>{m.maxYukseklik}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {/* Parts Modal */}
            <Modal
                isOpen={showPartsModal}
                onClose={() => setShowPartsModal(false)}
                title="Mevcut Parçalar"
            >
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kenar 1</th>
                                <th>Kenar 2</th>
                                <th>Yükseklik</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map(p => (
                                <tr key={p.parca}>
                                    <td>{p.parca}</td>
                                    <td>{p.kenar1}</td>
                                    <td>{p.kenar2}</td>
                                    <td>{p.yukseklik}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
}
