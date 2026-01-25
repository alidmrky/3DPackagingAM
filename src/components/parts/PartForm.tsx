import { useState } from 'react';
import type { Part } from '../../types';

interface PartFormProps {
    part?: Part;
    onSave: (part: Part) => void;
    onCancel: () => void;
}

export function PartForm({ part, onSave, onCancel }: PartFormProps) {
    const [formData, setFormData] = useState<Part>(
        part || {
            parca: Date.now(),
            kenar1: 100,
            kenar2: 100,
            yukseklik: 50,
            alan: 500000,
            unit: 'mm',
        }
    );

    const handleChange = (field: keyof Part, value: number | string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.kenar1 <= 0 || formData.kenar2 <= 0 || formData.yukseklik <= 0) {
            alert('Boyutlar 0\'dan büyük olmalıdır!');
            return;
        }

        // Auto-calculate alan (volume)
        formData.alan = formData.kenar1 * formData.kenar2 * formData.yukseklik;
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="machine-form">
            <div className="form-group">
                <label>Parça ID</label>
                <input
                    type="number"
                    value={formData.parca}
                    onChange={(e) => handleChange('parca', Number(e.target.value))}
                    required
                    disabled={!!part}
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
                    <label>Kenar 1 (Genişlik) - {formData.unit || 'mm'}</label>
                    <input
                        type="number"
                        value={formData.kenar1}
                        onChange={(e) => handleChange('kenar1', Number(e.target.value))}
                        required
                        min="1"
                        step="0.1"
                    />
                </div>

                <div className="form-group">
                    <label>Kenar 2 (Derinlik) - {formData.unit || 'mm'}</label>
                    <input
                        type="number"
                        value={formData.kenar2}
                        onChange={(e) => handleChange('kenar2', Number(e.target.value))}
                        required
                        min="1"
                        step="0.1"
                    />
                </div>

                <div className="form-group">
                    <label>Yükseklik - {formData.unit || 'mm'}</label>
                    <input
                        type="number"
                        value={formData.yukseklik}
                        onChange={(e) => handleChange('yukseklik', Number(e.target.value))}
                        required
                        min="1"
                        step="0.1"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                    İptal
                </button>
                <button type="submit" className="btn btn-primary">
                    {part ? 'Güncelle' : 'Ekle'}
                </button>
            </div>
        </form>
    );
}
