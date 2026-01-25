import { useState } from 'react';
import type { Part, Machine } from '../types';
import machinesData from '../data/machines2.json';
import partsData from '../data/parts2.json';

interface DataInputProps {
    onDataLoad: (parts: Part[], machines: Machine[]) => void;
}

export function DataInput({ onDataLoad }: DataInputProps) {
    const [parts, setParts] = useState<Part[]>(partsData as Part[]);
    const [machines] = useState<Machine[]>(machinesData as Machine[]);

    const handleLoadData = () => {
        onDataLoad(parts, machines);
    };

    const handleGenerateRandom = () => {
        // Simple random data generator
        const randomParts: Part[] = Array.from({ length: 10 }, (_, i) => ({
            parca: i + 1,
            kenar1: Math.floor(Math.random() * 200) + 50,
            kenar2: Math.floor(Math.random() * 200) + 50,
            yukseklik: Math.floor(Math.random() * 200) + 20,
            alan: 0,
        }));

        randomParts.forEach(p => {
            p.alan = p.kenar1 * p.kenar2;
        });

        setParts(randomParts);
        onDataLoad(randomParts, machines);
    };

    return (
        <div className="data-input">
            <h2>📊 Veri Girişi</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{machines.length}</div>
                    <div className="stat-label">Makine</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{parts.length}</div>
                    <div className="stat-label">Parça</div>
                </div>
            </div>

            <div className="button-group">
                <button onClick={handleLoadData} className="btn btn-primary">
                    📥 Verileri Yükle
                </button>
                <button onClick={handleGenerateRandom} className="btn btn-secondary">
                    🎲 Rastgele Veri Üret
                </button>
            </div>

            <details className="data-preview">
                <summary>Makine Detayları</summary>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Genişlik</th>
                                <th>Derinlik</th>
                                <th>Max Yükseklik</th>
                                <th>VTM</th>
                                <th>HTM</th>
                                <th>SET</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machines.map(m => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>{m.xKen}</td>
                                    <td>{m.yKenar}</td>
                                    <td>{m.maxYukseklik}</td>
                                    <td>{m.vtm}</td>
                                    <td>{m.htm}</td>
                                    <td>{m.set}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>

            <details className="data-preview">
                <summary>Parça Detayları ({parts.length} adet)</summary>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Parça</th>
                                <th>Kenar 1</th>
                                <th>Kenar 2</th>
                                <th>Yükseklik</th>
                                <th>Alan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map(p => (
                                <tr key={p.parca}>
                                    <td>{p.parca}</td>
                                    <td>{p.kenar1}</td>
                                    <td>{p.kenar2}</td>
                                    <td>{p.yukseklik}</td>
                                    <td>{p.alan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}
