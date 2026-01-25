/**
 * Dataset Configuration
 * 
 * Bu dosyada hangi dataset'i kullanmak istediğinizi belirleyebilirsiniz.
 * Farklı senaryolar için farklı dataset'ler oluşturup buradan seçebilirsiniz.
 */

// Dataset tipleri
export type DatasetKey = 'default' | 'academic' | 'academic2';

export const DATASET_CONFIG = {
    // Aktif dataset'i buradan seçin
    ACTIVE_DATASET: 'academic2' as DatasetKey,

    // Dataset yolları
    DATASETS: {
        default: {
            machines: '../data/machines.json',
            parts: '../data/parts.json',
            description: 'Varsayılan test verileri'
        },
        academic: {
            machines: '../data/machines2.json',
            parts: '../data/parts2.json',
            description: 'Akademik makale verileri (10 parça, 2 makine)'
        },
        academic2: {
            machines: '../data/machines3.json',
            parts: '../data/parts3.json',
            description: 'Akademik makale verileri 2 (18 parça, 3 makine)'
        },
        // Buraya yeni dataset'ler ekleyebilirsiniz:
        // custom1: {
        //     machines: '../data/machines_custom1.json',
        //     parts: '../data/parts_custom1.json',
        //     description: 'Özel senaryo 1'
        // },
    } as const
};

// Helper fonksiyon: Aktif dataset'i döndürür
export function getActiveDataset() {
    const dataset = DATASET_CONFIG.DATASETS[DATASET_CONFIG.ACTIVE_DATASET];
    if (!dataset) {
        console.warn(`Dataset '${DATASET_CONFIG.ACTIVE_DATASET}' bulunamadı. Default kullanılıyor.`);
        return DATASET_CONFIG.DATASETS.default;
    }
    return dataset;
}

// Helper fonksiyon: Tüm dataset'leri listeler
export function listDatasets() {
    return Object.entries(DATASET_CONFIG.DATASETS).map(([key, value]) => ({
        key,
        description: value.description,
        isActive: key === DATASET_CONFIG.ACTIVE_DATASET
    }));
}
