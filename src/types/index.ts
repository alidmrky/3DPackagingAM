// Part interface representing a 3D part to be placed
export interface Part {
    parca: number;          // Part ID
    kenar1: number;         // Width (x)
    kenar2: number;         // Depth (y)
    alan: number;           // Volume
    yukseklik: number;      // Height (z)
    unit?: 'mm' | 'cm' | 'm'; // Unit of measurement (default: mm)
    releaseDate?: number;   // Release date (r_i) in hours
    dueDate?: number;       // Due date (d_i) in hours
}

// Machine interface representing a 3D printer
export interface Machine {
    id: number;
    xKen: number;           // Machine width (MX)
    yKenar: number;         // Machine depth (MY)
    maxYukseklik: number;   // Machine max height (MH)
    alan: number;           // Machine base area
    vtm: number;            // Volume processing time (VT_m) - hour/cm³
    htm: number;            // Height processing time (HT_m) - hour/cm
    set: number;            // Setup time (SET_m) - hour
    unit?: 'mm' | 'cm' | 'm'; // Unit of measurement (default: mm)
}

// Chromosome representing a permutation of parts
export type Chromosome = number[];  // Array of part IDs

// Placed part with 3D coordinates
export interface PlacedPart {
    parca: number;
    x: number;
    y: number;
    z: number;
    width: number;
    depth: number;
    height: number;
}

// Machine allocation in a job
export interface MachineAllocation {
    machine: Machine;
    placedParts: PlacedPart[];
    totalVolume: number;
    maxHeight: number;
    processingTime: number;
}

// Job/Batch representing a parallel execution
export interface Job {
    jobId: number;
    machines: MachineAllocation[];
    completionTime: number;  // Max time among all machines in this job
}

// Result of bin packing with placement details
export interface PlacementResult {
    jobs: Job[];
    cmax: number;           // Total makespan (cumulative)
    chromosome: Chromosome;
    placementLog?: PlacementLog; // Optional detailed log for debugging
    maxLateness?: number; // Maximum lateness (objective function value)
}

// Genetic Algorithm configuration
export interface GAConfig {
    populationSize: number;
    generations: number;
    crossoverRate: number;
    mutationRate: number;
    tournamentSize: number;
}

// Individual in GA population
export interface Individual {
    chromosome: Chromosome;
    fitness: number;        // Maximum lateness (lower is better)
    placementResult?: PlacementResult;
}

// Progress update from GA
export interface GAProgress {
    generation: number;
    bestFitness: number;
    averageFitness: number;
    bestChromosome: Chromosome;
}

// Placement attempt log for debugging
export interface PlacementAttempt {
    partId: number;
    machineId: number;
    jobId: number;
    success: boolean;
    position?: { x: number; y: number; z: number };
    score?: number; // Position score (z×10⁶ + y×10³ + x)
    reason?: string; // Why failed
    testedZLevels?: number[]; // Z levels tested
    totalPositionsTested?: number; // How many positions were checked
}

// Step-by-step placement log
export interface PlacementStep {
    stepNumber: number;
    partId: number;
    partDimensions: { width: number; depth: number; height: number; volume: number };
    attempts: PlacementAttempt[];
    finalPlacement: {
        machineId: number;
        jobId: number;
        position: { x: number; y: number; z: number };
    } | null;
    currentCmax: number;
    currentJobCount: number;
}

// Complete placement log for best solution
export interface PlacementLog {
    totalSteps: number;
    finalCmax: number;
    finalJobCount: number;
    steps: PlacementStep[];
}
