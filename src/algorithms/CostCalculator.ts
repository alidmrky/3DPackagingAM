import type { Machine, Job, MachineAllocation, Part } from '../types';

/**
 * Calculate processing time for a machine using Equation (2):
 * δ_mj = SET_m + VT_m × Σ(v_i) + HT_m × max{h_i}
 * 
 * IMPORTANT: 
 * - VT_m is in hour/cm³
 * - HT_m is in hour/cm
 * - SET_m is in hour
 * 
 * All dimensions must be converted to cm for calculation
 */
export function calculateMachineTime(
    machine: Machine,
    totalVolume: number,
    maxHeight: number,
    volumeUnit: 'mm' | 'cm' | 'm' = 'mm',
    heightUnit: 'mm' | 'cm' | 'm' = 'mm'
): number {
    // Convert volume to cm³
    let volumeInCm3 = totalVolume;
    if (volumeUnit === 'mm') {
        volumeInCm3 = totalVolume / 1000; // mm³ to cm³
    } else if (volumeUnit === 'm') {
        volumeInCm3 = totalVolume * 1000000; // m³ to cm³
    }

    // Convert height to cm
    let heightInCm = maxHeight;
    if (heightUnit === 'mm') {
        heightInCm = maxHeight / 10; // mm to cm
    } else if (heightUnit === 'm') {
        heightInCm = maxHeight * 100; // m to cm
    }

    // Calculate time using the formula
    const setupTime = machine.set;
    const volumeTime = machine.vtm * volumeInCm3;
    const heightTime = machine.htm * heightInCm;

    return setupTime + volumeTime + heightTime;
}

/**
 * Calculate Cmax using Equation (1):
 * CT_mj = σ_mj + δ_mj
 * 
 * Where:
 * - σ_mj: earliest start time of job j on machine m
 * - δ_mj: production time of job j on machine m
 * 
 * For parallel machines (our case), Cmax is the sum of all job completion times
 */
export function calculateCmax(jobs: Job[]): number {
    return jobs.reduce((sum, job) => sum + job.completionTime, 0);
}

/**
 * Calculate completion time for a job using Equation (3):
 * CT_mj = max{r_i} + δ_mj
 * 
 * Where:
 * - max{r_i}: maximum release date among all parts in the job
 * - δ_mj: processing time (max time among all machines in parallel)
 */
export function calculateJobCompletionTime(machines: MachineAllocation[], parts: Part[]): number {
    if (machines.length === 0) return 0;

    // Get all parts in this job
    const jobPartIds = new Set<number>();
    machines.forEach(m => {
        m.placedParts.forEach(p => jobPartIds.add(p.parca));
    });

    // Find maximum release date among all parts in this job
    let maxReleaseDate = 0;
    jobPartIds.forEach(partId => {
        const part = parts.find(p => p.parca === partId);
        if (part && part.releaseDate !== undefined) {
            maxReleaseDate = Math.max(maxReleaseDate, part.releaseDate);
        }
    });

    // Processing time is the max among all machines (parallel execution)
    const processingTime = Math.max(...machines.map(m => m.processingTime));

    // Completion time = max release date + processing time
    return maxReleaseDate + processingTime;
}
