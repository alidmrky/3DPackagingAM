import { useState } from 'react';
import type { Machine } from '../../types';

interface MachineFormProps {
    machine?: Machine;
    onSave: (machine: Machine) => void;
    onCancel: () => void;
}

export function MachineForm({ machine, onSave, onCancel }: MachineFormProps) {
    const [formData, setFormData] = useState<Machine>(
        machine || {
            id: Date.now(),
            xKen: 400,
            yKenar: 400,
            maxYukseklik: 400,
            alan: 160000,
            vtm: 0.030864,
            htm: 1,
            set: 2,
            unit: 'mm',
        }
    );

    const handleChange = (field: keyof Machine, value: number | string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.xKen <= 0 || formData.yKenar <= 0 || formData.maxYukseklik <= 0) {
            alert('Boyutlar 0\'dan büyük olmalıdır!');
            return;
        }

        // Auto-calculate alan
        formData.alan = formData.xKen * formData.yKenar;
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="machine-form">
            <div className="form-group">
                <label>Makine ID</label>
                <input
                    type="number"
                    value={formData.id}
                    onChange={(e) => handleChange('id', Number(e.target.value))}
                    required
                    disabled={!!machine}
                />
            </div>

            <div className="form-group">
                <label>Birim</label>
                <select
                    value={formData.unit || 'mm'}
                    onChange={(e) => handleChange('unit', e.target.value)}
                >
                    <option value="mm">Milimetre (mm)</option>
                    <option value="cm">Santimetre (cm)</option>
                    <option value="m">Metre (m)</option>
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Genişlik (X) - {formData.unit || 'mm'}</label>
                    <input
                        type="number"
                        value={formData.xKen}
                        onChange={(e) => handleChange('xKen', Number(e.target.value))}
                        required
                        min="1"
                        step="0.1"
                    />
                </div>

                <div className="form-group">
                    <label>Derinlik (Y) - {formData.unit || 'mm'}</label>
                    <input
                        type="number"
                        value={formData.yKenar}
                        onChange={(e) => handleChange('yKenar', Number(e.target.value))}
                        required
                        min="1"
                        step="0.1"
                    />
                </div>

                <div className="form-group">
                    <label>Max Yükseklik - {formData.unit || 'mm'}</label>
                    <input
                        type="number"
                        value={formData.maxYukseklik}
                        onChange={(e) => handleChange('maxYukseklik', Number(e.target.value))}
                        required
                        min="1"
                        step="0.1"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Setup Time (SET) - hour</label>
                    <input
                        type="number"
                        step="0.1"
                        value={formData.set}
                        onChange={(e) => handleChange('set', Number(e.target.value))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Volume Time (VTM) - hour/cm³</label>
                    <input
                        type="number"
                        step="0.000001"
                        value={formData.vtm}
                        onChange={(e) => handleChange('vtm', Number(e.target.value))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Height Time (HTM) - hour/cm</label>
                    <input
                        type="number"
                        step="0.1"
                        value={formData.htm}
                        onChange={(e) => handleChange('htm', Number(e.target.value))}
                        required
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                    İptal
                </button>
                <button type="submit" className="btn btn-primary">
                    {machine ? 'Güncelle' : 'Ekle'}
                </button>
            </div>
        </form>
    );
}
