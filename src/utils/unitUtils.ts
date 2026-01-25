export type Unit = 'mm' | 'cm' | 'm';

export function formatWithUnit(value: number, unit: Unit = 'mm'): string {
    return `${value.toLocaleString()} ${unit}`;
}

export function formatAreaWithUnit(value: number, unit: Unit = 'mm'): string {
    const areaUnit = unit === 'mm' ? 'mm²' : unit === 'cm' ? 'cm²' : 'm²';
    return `${value.toLocaleString()} ${areaUnit}`;
}

export function formatVolumeWithUnit(value: number, unit: Unit = 'mm'): string {
    const volumeUnit = unit === 'mm' ? 'mm³' : unit === 'cm' ? 'cm³' : 'm³';

    // For large volumes, show in appropriate scale
    if (unit === 'mm' && value >= 1000000) {
        return `${(value / 1000000).toFixed(2)} cm³`;
    }
    if (unit === 'cm' && value >= 1000000) {
        return `${(value / 1000000).toFixed(2)} m³`;
    }

    return `${value.toLocaleString()} ${volumeUnit}`;
}

export function convertToMM(value: number, fromUnit: Unit): number {
    switch (fromUnit) {
        case 'mm': return value;
        case 'cm': return value * 10;
        case 'm': return value * 1000;
    }
}

export function convertFromMM(value: number, toUnit: Unit): number {
    switch (toUnit) {
        case 'mm': return value;
        case 'cm': return value / 10;
        case 'm': return value / 1000;
    }
}
