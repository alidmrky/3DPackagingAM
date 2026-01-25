import type { Machine } from '../../types';
import { Edit, Trash2 } from 'lucide-react';
import { formatWithUnit, formatAreaWithUnit } from '../../utils/unitUtils';

interface MachineTableProps {
    machines: Machine[];
    onEdit: (machine: Machine) => void;
    onDelete: (id: number) => void;
}

export function MachineTable({ machines, onEdit, onDelete }: MachineTableProps) {
    if (machines.length === 0) {
        return (
            <div className="empty-state">
                <p>Henüz makine eklenmedi.</p>
                <p>Yukarıdaki "Yeni Makine Ekle" butonunu kullanarak makine ekleyebilirsiniz.</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Birim</th>
                        <th>Genişlik (X)</th>
                        <th>Derinlik (Y)</th>
                        <th>Max Yükseklik</th>
                        <th>Alan</th>
                        <th>SET (hour)</th>
                        <th>VTM (hour/cm³)</th>
                        <th>HTM (hour/cm)</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {machines.map((machine) => (
                        <tr key={machine.id}>
                            <td>{machine.id}</td>
                            <td><span className="unit-badge">{machine.unit || 'mm'}</span></td>
                            <td>{formatWithUnit(machine.xKen, machine.unit)}</td>
                            <td>{formatWithUnit(machine.yKenar, machine.unit)}</td>
                            <td>{formatWithUnit(machine.maxYukseklik, machine.unit)}</td>
                            <td>{formatAreaWithUnit(machine.alan, machine.unit)}</td>
                            <td>{machine.set}</td>
                            <td>{machine.vtm.toFixed(6)}</td>
                            <td>{machine.htm}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        onClick={() => onEdit(machine)}
                                        className="btn-icon btn-edit"
                                        title="Düzenle"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Makine ${machine.id} silinecek. Emin misiniz?`)) {
                                                onDelete(machine.id);
                                            }
                                        }}
                                        className="btn-icon btn-delete"
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
