import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Machine } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from '../components/shared/Modal';
import { MachineTable } from '../components/machines/MachineTable';
import { MachineForm } from '../components/machines/MachineForm';
import { ExcelButtons } from '../components/shared/ExcelButtons';
import { exportMachinesToExcel, importMachinesFromExcel } from '../utils/excelUtils';
import { DATASET_CONFIG } from '../config/datasetConfig';

// Dataset imports
import defaultMachines from '../data/machines.json';
import academicMachines from '../data/machines2.json';
import academic2Machines from '../data/machines3.json';

// Dataset seçimi
const activeDatasetKey = DATASET_CONFIG.ACTIVE_DATASET;
const selectedMachines =
    activeDatasetKey === 'academic' ? academicMachines :
        activeDatasetKey === 'academic2' ? academic2Machines :
            defaultMachines;

export function MachinesPage() {
    const [machines, setMachines] = useLocalStorage<Machine[]>('machines', selectedMachines as Machine[]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<Machine | undefined>();

    const handleAdd = () => {
        setEditingMachine(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (machine: Machine) => {
        setEditingMachine(machine);
        setIsModalOpen(true);
    };

    const handleSave = (machine: Machine) => {
        if (editingMachine) {
            setMachines(prev => prev.map(m => m.id === machine.id ? machine : m));
        } else {
            setMachines(prev => [...prev, machine]);
        }
        setIsModalOpen(false);
        setEditingMachine(undefined);
    };

    const handleDelete = (id: number) => {
        setMachines(prev => prev.filter(m => m.id !== id));
    };

    const handleExport = () => {
        exportMachinesToExcel(machines);
    };

    const handleImport = async (file: File) => {
        try {
            if (machines.length > 0) {
                if (!confirm('Mevcut veriler silinecek. Devam etmek istiyor musunuz?')) {
                    return;
                }
            }
            const imported = await importMachinesFromExcel(file);
            setMachines(imported);
            alert(`✅ ${imported.length} makine başarıyla yüklendi!`);
        } catch (error) {
            alert('❌ Excel dosyası okunamadı!');
            console.error(error);
        }
    };

    const activeDataset = DATASET_CONFIG.DATASETS[activeDatasetKey];

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>🏭 Makine Yönetimi</h2>
                <div className="header-actions">
                    <ExcelButtons
                        onExport={handleExport}
                        onImport={handleImport}
                        type="machines"
                    />
                    <button onClick={handleAdd} className="btn btn-primary">
                        <Plus size={20} />
                        Yeni Makine Ekle
                    </button>
                </div>
            </div>

            <div className="page-stats">
                <div className="stat-card">
                    <span className="stat-label">Toplam Makine</span>
                    <span className="stat-value">{machines.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Aktif Dataset</span>
                    <span className="stat-value">{activeDataset.description}</span>
                </div>
            </div>

            <MachineTable
                machines={machines}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMachine ? 'Makine Düzenle' : 'Yeni Makine Ekle'}
            >
                <MachineForm
                    machine={editingMachine}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
