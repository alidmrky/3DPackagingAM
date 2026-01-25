import type { Part, Machine } from '../../types';
import { Edit, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { validatePart } from '../../utils/validation';
import { formatWithUnit, formatVolumeWithUnit } from '../../utils/unitUtils';

interface PartTableProps {
    parts: Part[];
    machines: Machine[];
    onEdit: (part: Part) => void;
    onDelete: (id: number) => void;
}

export function PartTable({ parts, machines, onEdit, onDelete }: PartTableProps) {
    if (parts.length === 0) {
        return (
            <div className="empty-state">
                <p>Henüz parça eklenmedi.</p>
                <p>Yukarıdaki "Yeni Parça Ekle" butonunu kullanarak parça ekleyebilirsiniz.</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Durum</th>
                        <th>Parça ID</th>
                        <th>Birim</th>
                        <th>Kenar 1</th>
                        <th>Kenar 2</th>
                        <th>Yükseklik</th>
                        <th>Hacim</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {parts.map((part) => {
                        const validation = validatePart(part, machines);
                        return (
                            <tr key={part.parca} className={`row-${validation.status}`}>
                                <td>
                                    <div className="status-icon" title={validation.message}>
                                        {validation.status === 'danger' && <AlertCircle size={20} color="#ef4444" />}
                                        {validation.status === 'warning' && <Info size={20} color="#f59e0b" />}
                                        {validation.status === 'success' && <CheckCircle size={20} color="#10b981" />}
                                    </div>
                                </td>
                                <td>{part.parca}</td>
                                <td><span className="unit-badge">{part.unit || 'mm'}</span></td>
                                <td>{formatWithUnit(part.kenar1, part.unit)}</td>
                                <td>{formatWithUnit(part.kenar2, part.unit)}</td>
                                <td>{formatWithUnit(part.yukseklik, part.unit)}</td>
                                <td>{formatVolumeWithUnit(part.alan, part.unit)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => onEdit(part)}
                                            className="btn-icon btn-edit"
                                            title="Düzenle"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Parça ${part.parca} silinecek. Emin misiniz?`)) {
                                                    onDelete(part.parca);
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
