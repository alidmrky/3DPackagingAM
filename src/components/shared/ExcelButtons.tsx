import { Download, Upload } from 'lucide-react';

interface ExcelButtonsProps {
    onExport: () => void;
    onImport: (file: File) => void;
    type: 'machines' | 'parts';
}

export function ExcelButtons({ onExport, onImport, type }: ExcelButtonsProps) {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
        e.target.value = ''; // Reset input
    };

    return (
        <div className="excel-buttons">
            <button onClick={onExport} className="btn btn-secondary">
                <Download size={18} />
                Excel'e Export
            </button>
            <label className="btn btn-secondary">
                <Upload size={18} />
                Excel'den Import
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </label>
        </div>
    );
}
