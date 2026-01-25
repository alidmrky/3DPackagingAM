import * as XLSX from 'xlsx';
import type { Machine, Part } from '../types';

export function exportMachinesToExcel(machines: Machine[]) {
    const worksheet = XLSX.utils.json_to_sheet(machines);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Machines');
    XLSX.writeFile(workbook, `machines_${Date.now()}.xlsx`);
}

export function exportPartsToExcel(parts: Part[]) {
    const worksheet = XLSX.utils.json_to_sheet(parts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parts');
    XLSX.writeFile(workbook, `parts_${Date.now()}.xlsx`);
}

export function importMachinesFromExcel(file: File): Promise<Machine[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const machines = XLSX.utils.sheet_to_json<Machine>(worksheet);
                resolve(machines);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
}

export function importPartsFromExcel(file: File): Promise<Part[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const parts = XLSX.utils.sheet_to_json<Part>(worksheet);
                resolve(parts);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
}
