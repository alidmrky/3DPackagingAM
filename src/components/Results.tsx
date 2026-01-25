import type { PlacementResult } from '../types';

interface ResultsProps {
    result: PlacementResult | null;
}

export function Results({ result }: ResultsProps) {
    if (!result) {
        return (
            <div className="results empty">
                <p>🎯 Sonuçlar optimizasyon tamamlandığında burada görünecek.</p>
            </div>
        );
    }

    return (
        <div className="results">
            <h2>📈 Sonuçlar</h2>

            {result && (
                <>
                    <div className="result-summary">
                        <div className="result-card highlight">
                            <div className="result-label">Maksimum Lateness (Objective)</div>
                            <div className="result-value">{result.maxLateness?.toFixed(2) || 'N/A'}</div>
                            <div className="result-hint">🎯 Akademik makale hedefi: 110.83 hr</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Toplam Makespan (C<sub>max</sub>)</div>
                            <div className="result-value">{result.cmax.toFixed(2)}</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Toplam İş Sayısı</div>
                            <div className="result-value">{result.jobs.length}</div>
                        </div>
                    </div>

                    <div className="chromosome-display">
                        <h3>En İyi Sıralama</h3>
                        <div className="chromosome">
                            {result.chromosome.map((partId, idx) => (
                                <span key={idx} className="gene">
                                    {partId}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="jobs-breakdown">
                        <h3>İş Detayları</h3>
                        {result.jobs.map(job => (
                            <details key={job.jobId} className="job-detail" open={job.jobId === 1}>
                                <summary>
                                    İş {job.jobId} - Tamamlanma Süresi: {job.completionTime.toFixed(2)}
                                </summary>
                                {job.machines.map((machineAlloc, idx) => (
                                    <div key={idx} className="machine-detail">
                                        <h4>Makine {machineAlloc.machine.id}</h4>
                                        <div className="machine-stats">
                                            <span>Parça Sayısı: {machineAlloc.placedParts.length}</span>
                                            <span>Toplam Hacim: {machineAlloc.totalVolume.toFixed(2)}</span>
                                            <span>Max Yükseklik: {machineAlloc.maxHeight.toFixed(2)}</span>
                                            <span>İşlem Süresi: {machineAlloc.processingTime.toFixed(2)}</span>
                                        </div>
                                        <div className="parts-list">
                                            {machineAlloc.placedParts.map(part => (
                                                <span key={part.parca} className="part-badge">
                                                    P{part.parca}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </details>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
