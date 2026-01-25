import type {
    Part,
    Machine,
    Chromosome,
    PlacementResult,
    Job,
    MachineAllocation,
    PlacedPart,
    PlacementStep,
    PlacementLog,
} from '../types';
import { calculateMachineTime, calculateJobCompletionTime, calculateCmax } from './CostCalculator';

// Global log for tracking placement decisions
let placementLog: PlacementStep[] = [];
let stepCounter = 0;

/**
 * The Decoder: Converts a chromosome (part sequence) into actual 3D placement
 * WITH DETAILED LOGGING
 */
export function decodePlacement(
    chromosome: Chromosome,
    parts: Part[],
    machines: Machine[],
    enableLogging: boolean = false
): PlacementResult {
    // Reset logging
    placementLog = [];
    stepCounter = 0;

    const jobs: Job[] = [];
    let currentJobId = 1;

    // Create first job with empty machines
    let currentJob = createEmptyJob(currentJobId, machines);
    jobs.push(currentJob);

    // Place each part according to chromosome order
    for (const partId of chromosome) {
        const part = parts.find(p => p.parca === partId);
        if (!part) continue;

        stepCounter++;
        const currentStep: PlacementStep = {
            stepNumber: stepCounter,
            partId: part.parca,
            partDimensions: {
                width: part.kenar1,
                depth: part.kenar2,
                height: part.yukseklik,
                volume: part.alan,
            },
            attempts: [],
            finalPlacement: null,
            currentCmax: 0,
            currentJobCount: jobs.length,
        };

        let placed = false;

        // Try to place in current job's machines
        for (let machineIdx = 0; machineIdx < currentJob.machines.length; machineIdx++) {
            const machineAlloc = currentJob.machines[machineIdx];
            const searchResult = findBestPositionWithDetails(part, machineAlloc.placedParts, machineAlloc.machine, enableLogging);

            if (searchResult.position) {
                // Successfully placed
                placePart(part, searchResult.position, machineAlloc);

                if (enableLogging) {
                    currentStep.attempts.push({
                        partId: part.parca,
                        machineId: machineAlloc.machine.id,
                        jobId: currentJob.jobId,
                        success: true,
                        position: searchResult.position,
                        score: searchResult.score,
                        testedZLevels: searchResult.testedZLevels,
                        totalPositionsTested: searchResult.totalPositionsTested,
                    });
                    currentStep.finalPlacement = {
                        machineId: machineAlloc.machine.id,
                        jobId: currentJob.jobId,
                        position: searchResult.position,
                    };
                }

                placed = true;
                break;
            } else {
                // Failed to place
                if (enableLogging) {
                    currentStep.attempts.push({
                        partId: part.parca,
                        machineId: machineAlloc.machine.id,
                        jobId: currentJob.jobId,
                        success: false,
                        reason: searchResult.reason || 'No valid position found',
                        testedZLevels: searchResult.testedZLevels,
                        totalPositionsTested: searchResult.totalPositionsTested,
                    });
                }
            }
        }
        // If not placed, create a new job
        if (!placed) {
            // Finalize current job
            finalizeJob(currentJob, parts);

            // Create new job
            currentJobId++;
            currentJob = createEmptyJob(currentJobId, machines);
            jobs.push(currentJob);

            // Place in first machine of new job
            const searchResult = findBestPositionWithDetails(part, currentJob.machines[0].placedParts, currentJob.machines[0].machine, enableLogging);
            if (searchResult.position) {
                placePart(part, searchResult.position, currentJob.machines[0]);

                if (enableLogging) {
                    currentStep.attempts.push({
                        partId: part.parca,
                        machineId: currentJob.machines[0].machine.id,
                        jobId: currentJob.jobId,
                        success: true,
                        position: searchResult.position,
                        score: searchResult.score,
                        testedZLevels: searchResult.testedZLevels,
                        totalPositionsTested: searchResult.totalPositionsTested,
                    });
                    currentStep.finalPlacement = {
                        machineId: currentJob.machines[0].machine.id,
                        jobId: currentJob.jobId,
                        position: searchResult.position,
                    };
                }
            }
        }

        // Calculate current Cmax
        if (enableLogging) {
            // Finalize current state temporarily to get Cmax
            const tempJobs = jobs.map(j => ({ ...j }));
            tempJobs.forEach(j => finalizeJob(j, parts));
            currentStep.currentCmax = calculateCmax(tempJobs);
            currentStep.currentJobCount = jobs.length;

            placementLog.push(currentStep);
        }
    }

    // Finalize last job
    finalizeJob(currentJob, parts);

    const cmax = calculateCmax(jobs);

    const log: PlacementLog | undefined = enableLogging ? {
        totalSteps: placementLog.length,
        finalCmax: cmax,
        finalJobCount: jobs.length,
        steps: placementLog,
    } : undefined;

    return {
        jobs,
        cmax,
        chromosome,
        placementLog: log,
    };
}

/**
 * Create an empty job with all available machines
 */
function createEmptyJob(jobId: number, machines: Machine[]): Job {
    return {
        jobId,
        machines: machines.map(machine => ({
            machine,
            placedParts: [],
            totalVolume: 0,
            maxHeight: 0,
            processingTime: 0,
        })),
        completionTime: 0,
    };
}

/**
 * Place a part at a position in a machine
 */
function placePart(part: Part, position: { x: number; y: number; z: number }, machineAlloc: MachineAllocation): void {
    const placedPart: PlacedPart = {
        parca: part.parca,
        x: position.x,
        y: position.y,
        z: position.z,
        width: part.kenar1,
        depth: part.kenar2,
        height: part.yukseklik,
    };

    machineAlloc.placedParts.push(placedPart);
    machineAlloc.totalVolume += part.alan;
    machineAlloc.maxHeight = Math.max(machineAlloc.maxHeight, position.z + part.yukseklik);
}

/**
 * Find the best position for a part using simple bottom-left heuristic
 */
function findBestPosition(
    part: Part,
    placedParts: PlacedPart[],
    machine: Machine
): { x: number; y: number; z: number } | null {
    const result = findBestPositionWithDetails(part, placedParts, machine, false);
    return result.position;
}

/**
 * Find the best position WITH detailed search information for logging
 */
function findBestPositionWithDetails(
    part: Part,
    placedParts: PlacedPart[],
    machine: Machine,
    includeDetails: boolean
): {
    position: { x: number; y: number; z: number } | null;
    score?: number;
    testedZLevels?: number[];
    totalPositionsTested?: number;
    reason?: string;
} {
    // If no parts placed yet, place at origin
    if (placedParts.length === 0) {
        if (part.kenar1 <= machine.xKen &&
            part.kenar2 <= machine.yKenar &&
            part.yukseklik <= machine.maxYukseklik) {
            return {
                position: { x: 0, y: 0, z: 0 },
                score: 0,
                testedZLevels: [0],
                totalPositionsTested: 1,
            };
        }
        return {
            position: null,
            reason: 'Part too large for empty machine',
            testedZLevels: [],
            totalPositionsTested: 0,
        };
    }

    // Collect all possible corners where we can place
    const cornersResult = findPotentialCornersWithDetails(placedParts, machine, part, includeDetails);

    // Try each corner
    for (const corner of cornersResult.candidates) {
        if (canPlaceAt(part, corner.x, corner.y, corner.z, placedParts, machine)) {
            return {
                position: corner,
                score: corner.score,
                testedZLevels: cornersResult.testedZLevels,
                totalPositionsTested: cornersResult.totalTested,
            };
        }
    }

    return {
        position: null,
        reason: 'All positions have overlap or out of bounds',
        testedZLevels: cornersResult.testedZLevels,
        totalPositionsTested: cornersResult.totalTested,
    };
}

/**
 * Find potential corner positions (bottom-left heuristic)
 * Enhanced with grid search to find ALL possible positions
 */
function findPotentialCorners(
    placedParts: PlacedPart[],
    machine: Machine,
    part: Part
): Array<{ x: number; y: number; z: number; score: number }> {
    const result = findPotentialCornersWithDetails(placedParts, machine, part, false);
    return result.candidates;
}

/**
 * Find potential corners WITH detailed statistics
 */
function findPotentialCornersWithDetails(
    placedParts: PlacedPart[],
    machine: Machine,
    part: Part,
    includeDetails: boolean
): {
    candidates: Array<{ x: number; y: number; z: number; score: number }>;
    testedZLevels?: number[];
    totalTested?: number;
} {
    const candidates: Array<{ x: number; y: number; z: number; score: number }> = [];

    // Get all unique Z levels
    const zLevels = new Set<number>([0]); // Always include ground
    placedParts.forEach(p => {
        zLevels.add(p.z);
        zLevels.add(p.z + p.height); // Top of part
    });

    const zArray = Array.from(zLevels).sort((a, b) => a - b);
    let totalTested = 0;

    // For each Z level, do comprehensive search
    for (const z of zArray) {
        // Skip if part would exceed machine height
        if (z + part.yukseklik > machine.maxYukseklik) continue;

        // Get parts at this Z level or below
        const partsAtOrBelowZ = placedParts.filter(p =>
            p.z < z + part.yukseklik && p.z + p.height > z
        );

        // Grid search with reasonable step size
        const stepX = Math.max(1, Math.floor(part.kenar1 / 4));
        const stepY = Math.max(1, Math.floor(part.kenar2 / 4));

        for (let y = 0; y <= machine.yKenar - part.kenar2; y += stepY) {
            for (let x = 0; x <= machine.xKen - part.kenar1; x += stepX) {
                totalTested++;
                // Quick check if position is valid
                if (canPlaceAt(part, x, y, z, placedParts, machine)) {
                    // Score: prefer lower Z, then lower Y, then lower X
                    const score = z * 1000000 + y * 1000 + x;
                    candidates.push({ x, y, z, score });
                }
            }
        }

        // Also try exact corner positions for better precision
        const corners = getExactCorners(partsAtOrBelowZ, machine, z);
        for (const corner of corners) {
            if (corner.x + part.kenar1 <= machine.xKen &&
                corner.y + part.kenar2 <= machine.yKenar &&
                canPlaceAt(part, corner.x, corner.y, z, placedParts, machine)) {
                totalTested++;
                const score = z * 1000000 + corner.y * 1000 + corner.x;
                candidates.push({ x: corner.x, y: corner.y, z, score });
            }
        }
    }

    // Remove duplicates and sort by score
    const uniqueCandidates = Array.from(
        new Map(candidates.map(c => [`${c.x},${c.y},${c.z}`, c])).values()
    );

    uniqueCandidates.sort((a, b) => a.score - b.score);

    return {
        candidates: uniqueCandidates,
        testedZLevels: includeDetails ? zArray : undefined,
        totalTested: includeDetails ? totalTested : undefined,
    };
}

/**
 * Get exact corner positions from existing parts
 */
function getExactCorners(
    parts: PlacedPart[],
    machine: Machine,
    z: number
): Array<{ x: number; y: number }> {
    const corners: Array<{ x: number; y: number }> = [];

    // Always try origin
    corners.push({ x: 0, y: 0 });

    // Try corners from existing parts
    for (const p of parts) {
        corners.push({ x: p.x + p.width, y: p.y });
        corners.push({ x: p.x, y: p.y + p.depth });
        corners.push({ x: p.x + p.width, y: p.y + p.depth });
    }

    return corners;
}

/**
 * Check if a part can be placed at the given position
 */
function canPlaceAt(
    part: Part,
    x: number,
    y: number,
    z: number,
    placedParts: PlacedPart[],
    machine: Machine
): boolean {
    // Check machine bounds
    if (x + part.kenar1 > machine.xKen ||
        y + part.kenar2 > machine.yKenar ||
        z + part.yukseklik > machine.maxYukseklik) {
        return false;
    }

    // Check overlap with existing parts
    for (const placed of placedParts) {
        const xOverlap = x < placed.x + placed.width && x + part.kenar1 > placed.x;
        const yOverlap = y < placed.y + placed.depth && y + part.kenar2 > placed.y;
        const zOverlap = z < placed.z + placed.height && z + part.yukseklik > placed.z;

        if (xOverlap && yOverlap && zOverlap) {
            return false;
        }
    }

    return true;
}

/**
 * Finalize a job by calculating completion time
 */
function finalizeJob(job: Job, parts: Part[]): void {
    job.machines.forEach(machineAlloc => {
        const unit = machineAlloc.machine.unit || 'mm';
        machineAlloc.processingTime = calculateMachineTime(
            machineAlloc.machine,
            machineAlloc.totalVolume,
            machineAlloc.maxHeight,
            unit,
            unit
        );
    });

    job.completionTime = calculateJobCompletionTime(job.machines, parts);
}
