import type { Part, Machine } from '../types';

export interface PartValidation {
    status: 'success' | 'warning' | 'danger';
    message: string;
    compatibleMachines: number;
}

export function validatePart(part: Part, machines: Machine[]): PartValidation {
    let compatibleCount = 0;

    for (const machine of machines) {
        const fitsWidth = part.kenar1 <= machine.xKen;
        const fitsDepth = part.kenar2 <= machine.yKenar;
        const fitsHeight = part.yukseklik <= machine.maxYukseklik;

        if (fitsWidth && fitsDepth && fitsHeight) {
            compatibleCount++;
        }
    }

    if (compatibleCount === 0) {
        return {
            status: 'danger',
            message: 'Bu parça hiçbir makineye yerleşemez!',
            compatibleMachines: 0
        };
    }

    if (compatibleCount === 1) {
        return {
            status: 'warning',
            message: 'Sadece 1 makineye yerleşebilir',
            compatibleMachines: 1
        };
    }

    return {
        status: 'success',
        message: 'Tüm makinelere yerleşebilir',
        compatibleMachines: compatibleCount
    };
}
