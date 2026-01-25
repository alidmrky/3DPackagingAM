import type {
    Part,
    Machine,
    Chromosome,
    Individual,
    GAConfig,
    GAProgress,
} from '../types';
import { decodePlacement } from './BinPackingLogic';

/**
 * Genetic Algorithm for optimizing part placement
 * Objective: Minimize maximum lateness (Min OBJ = max{L_i})
 */
export class GeneticAlgorithm {
    private parts: Part[];
    private machines: Machine[];
    private config: GAConfig;
    private population: Individual[] = [];
    private bestIndividual: Individual | null = null;

    constructor(parts: Part[], machines: Machine[], config: GAConfig) {
        this.parts = parts;
        this.machines = machines;
        this.config = config;
    }

    /**
     * Run the genetic algorithm
     */
    run(onProgress?: (progress: GAProgress) => void): Individual {
        // Initialize population
        this.initializePopulation();

        for (let generation = 1; generation <= this.config.generations; generation++) {
            // Evaluate fitness
            this.evaluatePopulation();

            // Track best individual
            this.updateBestIndividual();

            // Report progress
            if (onProgress) {
                const avgFitness =
                    this.population.reduce((sum, ind) => sum + ind.fitness, 0) /
                    this.population.length;

                onProgress({
                    generation,
                    bestFitness: this.bestIndividual!.fitness,
                    averageFitness: avgFitness,
                    bestChromosome: this.bestIndividual!.chromosome,
                });
            }

            // Create new generation
            if (generation < this.config.generations) {
                this.evolvePopulation();
            }
        }

        return this.bestIndividual!;
    }

    /**
     * Initialize population with random permutations
     */
    private initializePopulation(): void {
        this.population = [];
        const partIds = this.parts.map(p => p.parca);

        for (let i = 0; i < this.config.populationSize; i++) {
            const chromosome = this.shuffleArray([...partIds]);
            this.population.push({
                chromosome,
                fitness: Infinity,
            });
        }
    }

    /**
     * Evaluate fitness for all individuals
     * Fitness = Maximum Lateness (Min OBJ = max{L_i})
     */
    private evaluatePopulation(): void {
        this.population.forEach(individual => {
            // Decode without logging first
            const placementResult = decodePlacement(
                individual.chromosome,
                this.parts,
                this.machines,
                false // No logging during evaluation
            );

            // Calculate maximum lateness as fitness
            const maxLateness = this.calculateMaxLateness(placementResult);
            individual.fitness = maxLateness;
            placementResult.maxLateness = maxLateness;
            individual.placementResult = placementResult;
        });

        // After finding best, re-decode with logging
        const currentBest = this.population.reduce((best, ind) =>
            ind.fitness < best.fitness ? ind : best
        );

        // Re-decode best individual WITH logging
        const detailedResult = decodePlacement(
            currentBest.chromosome,
            this.parts,
            this.machines,
            true // Enable logging for best
        );
        const maxLateness = this.calculateMaxLateness(detailedResult);
        currentBest.placementResult = detailedResult;
        currentBest.placementResult.maxLateness = maxLateness;
        currentBest.fitness = maxLateness;
    }

    /**
     * Calculate maximum lateness (objective function)
     * L_i = γ_mji - d_i
     * Min OBJ = max{L_i}
     */
    private calculateMaxLateness(result: any): number {
        let maxLateness = -Infinity;

        // Iterate through all jobs and machines
        for (const job of result.jobs) {
            for (const machineAlloc of job.machines) {
                for (const placedPart of machineAlloc.placedParts) {
                    const part = this.parts.find(p => p.parca === placedPart.parca);
                    if (!part || part.dueDate === undefined) continue;

                    // Completion time of this part = job completion time
                    const completionTime = job.completionTime;
                    const lateness = completionTime - part.dueDate;

                    maxLateness = Math.max(maxLateness, lateness);
                }
            }
        }

        return maxLateness === -Infinity ? 0 : maxLateness;
    }

    /**
     * Update best individual if better found
     */
    private updateBestIndividual(): void {
        const currentBest = this.population.reduce((best, ind) =>
            ind.fitness < best.fitness ? ind : best
        );

        if (!this.bestIndividual || currentBest.fitness < this.bestIndividual.fitness) {
            this.bestIndividual = { ...currentBest };
        }
    }

    /**
     * Create new generation through selection, crossover, and mutation
     */
    private evolvePopulation(): void {
        const newPopulation: Individual[] = [];

        // Elitism: keep best individual
        newPopulation.push({ ...this.bestIndividual! });

        // Create offspring
        while (newPopulation.length < this.config.populationSize) {
            // Selection
            const parent1 = this.tournamentSelection();
            const parent2 = this.tournamentSelection();

            // Crossover
            let offspring: Chromosome;
            if (Math.random() < this.config.crossoverRate) {
                offspring = this.orderCrossover(parent1.chromosome, parent2.chromosome);
            } else {
                offspring = [...parent1.chromosome];
            }

            // Mutation
            if (Math.random() < this.config.mutationRate) {
                offspring = this.swapMutation(offspring);
            }

            newPopulation.push({
                chromosome: offspring,
                fitness: Infinity,
            });
        }

        this.population = newPopulation;
    }

    /**
     * Tournament selection
     */
    private tournamentSelection(): Individual {
        const tournament: Individual[] = [];

        for (let i = 0; i < this.config.tournamentSize; i++) {
            const randomIdx = Math.floor(Math.random() * this.population.length);
            tournament.push(this.population[randomIdx]);
        }

        return tournament.reduce((best, ind) =>
            ind.fitness < best.fitness ? ind : best
        );
    }

    /**
     * Order Crossover (OX1)
     */
    private orderCrossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
        const size = parent1.length;
        const offspring: (number | null)[] = new Array(size).fill(null);

        // Select random segment from parent1
        const start = Math.floor(Math.random() * size);
        const end = start + Math.floor(Math.random() * (size - start)) + 1;

        // Copy segment to offspring
        for (let i = start; i < end; i++) {
            offspring[i] = parent1[i];
        }

        // Fill remaining positions from parent2
        let currentPos = end % size;
        let parent2Pos = end % size;

        while (offspring.includes(null)) {
            const gene = parent2[parent2Pos];

            if (!offspring.includes(gene)) {
                offspring[currentPos] = gene;
                currentPos = (currentPos + 1) % size;
            }

            parent2Pos = (parent2Pos + 1) % size;
        }

        return offspring as Chromosome;
    }

    /**
     * Swap mutation
     */
    private swapMutation(chromosome: Chromosome): Chromosome {
        const mutated = [...chromosome];
        const idx1 = Math.floor(Math.random() * mutated.length);
        const idx2 = Math.floor(Math.random() * mutated.length);

        [mutated[idx1], mutated[idx2]] = [mutated[idx2], mutated[idx1]];

        return mutated;
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
