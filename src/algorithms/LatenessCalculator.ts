import type { Part, PlacementResult } from '../types';

/**
 * Calculate lateness for a part
 * L_i = γ_mji - d_i
 * where:
 * - γ_mji: completion time of part i assigned to job j on machine m
 * - d_i: due date of part i
 */
export function calculatePartLateness(
    completionTime: number,
    dueDate: number
): number {
    return completionTime - dueDate;
}

/**
 * Calculate maximum lateness (objective function)
 * Min OBJ = max{L_i} for all parts
 */
export function calculateMaxLateness(result: PlacementResult, parts: Part[]): number {
    let maxLateness = -Infinity;

    // Iterate through all jobs and machines
    for (const job of result.jobs) {
        for (const machineAlloc of job.machines) {
            for (const placedPart of machineAlloc.placedParts) {
                const part = parts.find(p => p.parca === placedPart.parca);
                if (!part || part.dueDate === undefined) continue;

                // Completion time of this part = job completion time
                // (since all parts in a job complete at the same time)
                const completionTime = job.completionTime;
                const lateness = calculatePartLateness(completionTime, part.dueDate);

                maxLateness = Math.max(maxLateness, lateness);
            }
        }
    }

    return maxLateness === -Infinity ? 0 : maxLateness;
}

/**
 * Calculate all part lateness values for display
 */
export function calculateAllLateness(result: PlacementResult, parts: Part[]): Map<number, number> {
    const latenessMap = new Map<number, number>();

    for (const job of result.jobs) {
        for (const machineAlloc of job.machines) {
            for (const placedPart of machineAlloc.placedParts) {
                const part = parts.find(p => p.parca === placedPart.parca);
                if (!part || part.dueDate === undefined) continue;

                const completionTime = job.completionTime;
                const lateness = calculatePartLateness(completionTime, part.dueDate);
                latenessMap.set(part.parca, lateness);
            }
        }
    }

    return latenessMap;
}
