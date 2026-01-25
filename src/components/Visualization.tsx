import type { PlacementResult, MachineAllocation, Machine } from '../types';

interface VisualizationProps {
    result: PlacementResult | null;
}

const COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#6366f1', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

// Calculate actual machine utilization based on footprint area
function calculateUtilization(machineAlloc: MachineAllocation, machine: Machine): number {
    if (machineAlloc.placedParts.length === 0) return 0;

    // Calculate total footprint area of placed parts
    const totalFootprint = machineAlloc.placedParts.reduce((sum, part) => {
        const partArea = part.width * part.depth;
        return sum + partArea;
    }, 0);

    // Machine base area
    const machineBaseArea = machine.xKen * machine.yKenar;

    const utilization = (totalFootprint / machineBaseArea) * 100;

    // Debug: log if over 100%
    if (utilization > 100) {
        console.warn(`⚠️ Utilization over 100%: ${utilization.toFixed(1)}%`);
        console.warn(`   Machine ${machine.id}: ${machine.xKen}x${machine.yKenar} = ${machineBaseArea}`);
        console.warn(`   Total footprint: ${totalFootprint}`);
        console.warn(`   Parts:`, machineAlloc.placedParts.map(p =>
            `P${p.parca}(${p.width}x${p.depth}=${p.width * p.depth})`
        ));
    }

    return utilization;
}

// Get unique Z layers for a machine
function getLayersForMachine(machineAlloc: MachineAllocation): number[] {
    const layers = new Set<number>();
    machineAlloc.placedParts.forEach(p => layers.add(p.z));
    return Array.from(layers).sort((a, b) => a - b);
}

export function Visualization({ result }: VisualizationProps) {
    if (!result) {
        return (
            <div className="visualization empty">
                <p>🎨 Yerleşim görselleştirmesi burada görünecek.</p>
            </div>
        );
    }

    return (
        <div className="visualization">
            <h2>🎨 3D Yerleşim Görselleştirmesi</h2>

            {result.jobs.map((job, jobIdx) => (
                <div key={job.jobId} className="job-visualization">
                    <h3 style={{ color: COLORS[jobIdx % COLORS.length] }}>
                        İş {job.jobId}
                    </h3>

                    <div className="machines-grid">
                        {job.machines.map((machineAlloc, machineIdx) => {
                            const machine = machineAlloc.machine;
                            const layers = getLayersForMachine(machineAlloc);

                            return (
                                <div key={machineIdx} className="machine-container">
                                    <h4>Makine {machine.id}</h4>
                                    <div className="machine-info">
                                        {machine.xKen} × {machine.yKenar} × {machine.maxYukseklik}
                                    </div>

                                    {/* Layer-based visualization */}
                                    <div className="layers-container">
                                        {layers.length === 0 ? (
                                            <div className="empty-machine">Boş</div>
                                        ) : (
                                            layers.map((z, layerIdx) => {
                                                const partsInLayer = machineAlloc.placedParts.filter(p => p.z === z);

                                                return (
                                                    <div key={layerIdx} className="layer-view">
                                                        <div className="layer-header">
                                                            Katman {layerIdx + 1} (Z: {z} - {z + Math.max(...partsInLayer.map(p => p.height))})
                                                        </div>
                                                        <svg
                                                            className="machine-canvas"
                                                            viewBox={`0 0 ${machine.xKen} ${machine.yKenar}`}
                                                            style={{
                                                                maxWidth: '100%',
                                                                aspectRatio: `${machine.xKen} / ${machine.yKenar}`,
                                                            }}
                                                        >
                                                            {/* Machine border */}
                                                            <rect
                                                                x="0"
                                                                y="0"
                                                                width={machine.xKen}
                                                                height={machine.yKenar}
                                                                fill="transparent"
                                                                stroke="#444"
                                                                strokeWidth="2"
                                                            />

                                                            {/* Placed parts in this layer */}
                                                            {partsInLayer.map((part, partIdx) => {
                                                                const color = COLORS[jobIdx % COLORS.length];
                                                                const opacity = 0.4 + (layerIdx / layers.length) * 0.5;

                                                                // Calculate font size based on part size
                                                                const minDim = Math.min(part.width, part.depth);
                                                                const fontSize = Math.max(minDim * 0.3, 0.8);

                                                                return (
                                                                    <g key={partIdx}>
                                                                        <rect
                                                                            x={part.x}
                                                                            y={part.y}
                                                                            width={part.width}
                                                                            height={part.depth}
                                                                            fill={color}
                                                                            fillOpacity={opacity}
                                                                            stroke="#fff"
                                                                            strokeWidth="0.3"
                                                                        >
                                                                            <title>
                                                                                Parça {part.parca}&#10;
                                                                                Boyut: {part.width} × {part.depth} × {part.height}&#10;
                                                                                Pozisyon: ({part.x}, {part.y}, {part.z})
                                                                            </title>
                                                                        </rect>
                                                                        {/* Background for text */}
                                                                        <rect
                                                                            x={part.x + part.width / 2 - fontSize * 0.8}
                                                                            y={part.y + part.depth / 2 - fontSize * 0.6}
                                                                            width={fontSize * 1.6}
                                                                            height={fontSize * 1.2}
                                                                            fill="rgba(0, 0, 0, 0.6)"
                                                                            rx={fontSize * 0.2}
                                                                        />
                                                                        <text
                                                                            x={part.x + part.width / 2}
                                                                            y={part.y + part.depth / 2}
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                            fill="#fff"
                                                                            fontSize={fontSize}
                                                                            fontWeight="bold"
                                                                            pointerEvents="none"
                                                                        >
                                                                            {part.parca}
                                                                        </text>
                                                                    </g>
                                                                );
                                                            })}
                                                        </svg>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div className="machine-legend">
                                        <span>Parça sayısı: {machineAlloc.placedParts.length}</span>
                                        <span>Katman sayısı: {layers.length}</span>
                                        <span>Doluluk: {calculateUtilization(machineAlloc, machine).toFixed(1)}%</span>
                                        <span>Max Yükseklik: {machineAlloc.maxHeight}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="legend">
                <div className="legend-title">Bilgi:</div>
                <div className="legend-items">
                    {result.jobs.map((job, idx) => (
                        <div key={job.jobId} className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <span>İş {job.jobId}</span>
                        </div>
                    ))}
                </div>
                <div className="legend-note">
                    * Her katman ayrı gösterilir - parçalar artık üst üste binmiyor
                </div>
                <div className="legend-note">
                    * Doluluk oranı gerçek taban alanına göre hesaplanır (kenar1 × kenar2)
                </div>
            </div>
        </div>
    );
}
