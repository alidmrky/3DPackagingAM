import type { GAProgress, PlacementResult, Part, Machine } from '../types';

/**
 * Export iteration history to a text file
 */
export function exportIterationReport(
    progressHistory: GAProgress[],
    parts: Part[],
    machines: Machine[]
): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
    const filename = `${dateStr}_${timeStr}_iterations.txt`;

    let report = '';
    report += '='.repeat(80) + '\n';
    report += 'GENETIC ALGORITHM ITERATION HISTORY\n';
    report += '='.repeat(80) + '\n';
    report += `Date: ${now.toLocaleString('tr-TR')}\n`;
    report += `Parts: ${parts.length}, Machines: ${machines.length}\n`;
    report += `Total Iterations: ${progressHistory.length}\n`;
    report += '='.repeat(80) + '\n\n';

    // Initial population (first iteration)
    if (progressHistory.length > 0) {
        const first = progressHistory[0];
        report += '(a) Initial population\n';
        report += '-'.repeat(80) + '\n';
        report += `Chromosome: [${first.bestChromosome.join(', ')}]\n`;
        report += `Best Fitness: ${first.bestFitness.toFixed(2)}\n`;
        report += `Average Fitness: ${first.averageFitness.toFixed(2)}\n`;
        report += '\n';
    }

    // Show every 10th iteration + last
    const milestones = [1, 10, 20, 50, 100, 200, 500, progressHistory.length - 1];

    milestones.forEach((idx, i) => {
        if (idx >= progressHistory.length) return;

        const progress = progressHistory[idx];
        report += `Iteration #${progress.generation}\n`;
        report += '-'.repeat(80) + '\n';
        report += `Chromosome: [${progress.bestChromosome.join(', ')}]\n`;
        report += `Best Fitness: ${progress.bestFitness.toFixed(2)}\n`;
        report += `Average Fitness: ${progress.averageFitness.toFixed(2)}\n`;

        if (i > 0) {
            const prev = progressHistory[milestones[i - 1]];
            const improvement = prev.bestFitness - progress.bestFitness;
            if (improvement > 0) {
                report += `Improvement: ${improvement.toFixed(2)} (${((improvement / prev.bestFitness) * 100).toFixed(1)}%)\n`;
            }
        }
        report += '\n';
    });

    // Final summary
    const last = progressHistory[progressHistory.length - 1];
    const first = progressHistory[0];
    const totalImprovement = first.bestFitness - last.bestFitness;

    report += '='.repeat(80) + '\n';
    report += 'FINAL SUMMARY\n';
    report += '='.repeat(80) + '\n';
    report += `Initial Best Fitness: ${first.bestFitness.toFixed(2)}\n`;
    report += `Final Best Fitness: ${last.bestFitness.toFixed(2)}\n`;
    report += `Total Improvement: ${totalImprovement.toFixed(2)} (${((totalImprovement / first.bestFitness) * 100).toFixed(1)}%)\n`;
    report += `Best Chromosome: [${last.bestChromosome.join(', ')}]\n`;
    report += '='.repeat(80) + '\n';

    return report;
}

/**
 * Export final results to a text file
 */
export function exportResultsReport(
    result: PlacementResult,
    parts: Part[],
    machines: Machine[]
): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
    const filename = `${dateStr}_${timeStr}_results.txt`;

    let report = '';
    report += '='.repeat(80) + '\n';
    report += 'OPTIMIZATION RESULTS - PART PLACEMENT DETAILS\n';
    report += '='.repeat(80) + '\n';
    report += `Date: ${now.toLocaleString('tr-TR')}\n`;
    report += `Total Parts: ${parts.length}\n`;
    report += `Total Machines: ${machines.length}\n`;
    report += `Total Jobs: ${result.jobs.length}\n`;
    report += `Maximum Lateness: ${result.maxLateness?.toFixed(2) || 'N/A'} hr\n`;
    report += `Total Makespan (Cmax): ${result.cmax.toFixed(2)} hr\n`;
    report += `Best Chromosome: [${result.chromosome.join(', ')}]\n`;
    report += '='.repeat(80) + '\n\n';

    // Job-by-job breakdown
    result.jobs.forEach((job, jobIdx) => {
        report += `JOB ${job.jobId}\n`;
        report += '='.repeat(80) + '\n';
        report += `Completion Time: ${job.completionTime.toFixed(2)} hr\n`;
        report += `Machines Used: ${job.machines.length}\n`;
        report += '\n';

        job.machines.forEach((machineAlloc, machineIdx) => {
            const machine = machineAlloc.machine;
            report += `  MACHINE ${machine.id}\n`;
            report += '  ' + '-'.repeat(76) + '\n';
            report += `  Dimensions: ${machine.xKen} × ${machine.yKenar} × ${machine.maxYukseklik} ${machine.unit}\n`;
            report += `  Processing Time: ${machineAlloc.processingTime.toFixed(2)} hr\n`;
            report += `  Parts Placed: ${machineAlloc.placedParts.length}\n`;
            report += `  Total Volume: ${machineAlloc.totalVolume.toFixed(2)} ${machine.unit}³\n`;
            report += `  Max Height: ${machineAlloc.maxHeight.toFixed(2)} ${machine.unit}\n`;
            report += '\n';

            if (machineAlloc.placedParts.length > 0) {
                report += '  Part Details:\n';
                report += '  ' + '-'.repeat(76) + '\n';
                report += '  Part ID | Position (X, Y, Z) | Dimensions (W × D × H) | Volume\n';
                report += '  ' + '-'.repeat(76) + '\n';

                machineAlloc.placedParts.forEach(placedPart => {
                    const part = parts.find(p => p.parca === placedPart.parca);
                    const volume = part ? part.alan : placedPart.width * placedPart.depth * placedPart.height;

                    report += `  ${String(placedPart.parca).padStart(7)} | `;
                    report += `(${placedPart.x.toFixed(1)}, ${placedPart.y.toFixed(1)}, ${placedPart.z.toFixed(1)})`.padEnd(18) + ' | ';
                    report += `${placedPart.width.toFixed(1)} × ${placedPart.depth.toFixed(1)} × ${placedPart.height.toFixed(1)}`.padEnd(22) + ' | ';
                    report += `${volume.toFixed(2)}\n`;
                });
                report += '\n';
            }
        });
        report += '\n';
    });

    // Part summary table
    report += '='.repeat(80) + '\n';
    report += 'PART SUMMARY\n';
    report += '='.repeat(80) + '\n';
    report += 'Part | Job | Machine | Position (X, Y, Z) | Release | Due Date | Lateness\n';
    report += '-'.repeat(80) + '\n';

    result.chromosome.forEach(partId => {
        let found = false;
        result.jobs.forEach(job => {
            job.machines.forEach(machineAlloc => {
                const placedPart = machineAlloc.placedParts.find(p => p.parca === partId);
                if (placedPart) {
                    const part = parts.find(p => p.parca === partId);
                    const lateness = part && part.dueDate
                        ? (job.completionTime - part.dueDate).toFixed(2)
                        : 'N/A';

                    report += `${String(partId).padStart(4)} | `;
                    report += `${String(job.jobId).padStart(3)} | `;
                    report += `${String(machineAlloc.machine.id).padStart(7)} | `;
                    report += `(${placedPart.x.toFixed(1)}, ${placedPart.y.toFixed(1)}, ${placedPart.z.toFixed(1)})`.padEnd(18) + ' | ';
                    report += `${(part?.releaseDate || 0).toFixed(1).padStart(7)} | `;
                    report += `${(part?.dueDate || 0).toFixed(1).padStart(8)} | `;
                    report += `${String(lateness).padStart(8)}\n`;
                    found = true;
                }
            });
        });
    });

    report += '='.repeat(80) + '\n';
    return report;
}

/**
 * Download text file
 */
export function downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate filename with current date and time
 */
export function generateFilename(prefix: string): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR').replace(/\./g, '-');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
    return `${dateStr}_${timeStr}_${prefix}.txt`;
}
