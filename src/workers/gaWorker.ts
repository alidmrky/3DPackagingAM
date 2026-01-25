import type { Part, Machine, GAConfig, GAProgress } from '../types';
import { GeneticAlgorithm } from '../algorithms/GeneticAlgorithm';

// Listen for messages from main thread
self.onmessage = (event: MessageEvent) => {
    const { parts, machines, config } = event.data as {
        parts: Part[];
        machines: Machine[];
        config: GAConfig;
    };

    const ga = new GeneticAlgorithm(parts, machines, config);

    // Run GA with progress updates
    const result = ga.run((progress: GAProgress) => {
        self.postMessage({
            type: 'progress',
            data: progress,
        });
    });

    // Send final result
    self.postMessage({
        type: 'complete',
        data: result,
    });
};
