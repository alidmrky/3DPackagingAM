import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Part, Machine } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from '../components/shared/Modal';
import { PartTable } from '../components/parts/PartTable';
import { PartForm } from '../components/parts/PartForm';
import { ExcelButtons } from '../components/shared/ExcelButtons';
import { exportPartsToExcel, importPartsFromExcel } from '../utils/excelUtils';
import { DATASET_CONFIG } from '../config/datasetConfig';

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

export function PartsPage() {
    const [parts, setParts] = useLocalStorage<Part[]>('parts', selectedParts as Part[]);
    const [machines] = useLocalStorage<Machine[]>('machines', selectedMachines as Machine[]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<Part | undefined>();

    const handleAdd = () => {
        setEditingPart(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (part: Part) => {
        setEditingPart(part);
        setIsModalOpen(true);
    };

    const handleSave = (part: Part) => {
        if (editingPart) {
            setParts(prev => prev.map(p => p.parca === part.parca ? part : p));
        } else {
            setParts(prev => [...prev, part]);
        }
        setIsModalOpen(false);
        setEditingPart(undefined);
    };

    const handleDelete = (id: number) => {
        setParts(prev => prev.filter(p => p.parca !== id));
    };

    const handleExport = () => {
        exportPartsToExcel(parts);
    };

    const handleImport = async (file: File) => {
        try {
            if (parts.length > 0) {
                if (!confirm('Mevcut veriler silinecek. Devam etmek istiyor musunuz?')) {
                    return;
                }
            }
            const imported = await importPartsFromExcel(file);
            setParts(imported);
            alert(`✅ ${imported.length} parça başarıyla yüklendi!`);
        } catch (error) {
            alert('❌ Excel dosyası okunamadı!');
            console.error(error);
        }
    };

    const activeDataset = DATASET_CONFIG.DATASETS[activeDatasetKey];

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>📦 Parça Yönetimi</h2>
                <div className="header-actions">
                    <ExcelButtons
                        onExport={handleExport}
                        onImport={handleImport}
                        type="parts"
                    />
                    <button onClick={handleAdd} className="btn btn-primary">
                        <Plus size={20} />
                        Yeni Parça Ekle
                    </button>
                </div>
            </div>

            <div className="page-stats">
                <div className="stat-card">
                    <span className="stat-label">Toplam Parça</span>
                    <span className="stat-value">{parts.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Aktif Dataset</span>
                    <span className="stat-value">{activeDataset.description}</span>
                </div>
            </div>

            <PartTable
                parts={parts}
                machines={machines}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPart ? 'Parça Düzenle' : 'Yeni Parça Ekle'}
            >
                <PartForm
                    part={editingPart}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
