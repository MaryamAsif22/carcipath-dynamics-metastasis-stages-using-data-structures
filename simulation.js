/**
 * simulation.js
 * 
 * Logic for the BFS-based Metastasis Simulation.
 */
//How contagious diseases spread through connected populations
//FIFO ENSURES BFS ALGORITHM
class SimulationEngine {
    constructor(graph) {
        this.graph = graph;
        this.queue = [];      // BFS Queue
        this.visited = new Set();
        this.log = [];        // History Log
        this.isRunning = false;
        this.targetNode = null; // Specific target to reach
        this.stepCount = 0;
    }

    start(startNodeId, targetNodeId = null) {
        // Reset valid state
        this.queue = [startNodeId];
        this.visited.clear();
        this.visited.add(startNodeId);
        this.log = [`Metastasis initiated at ${startNodeId}`];
        this.isRunning = true;
        this.targetNode = targetNodeId;
        this.stepCount = 0;

        // Reset All Nodes in Graph
        this.graph.getNodes().forEach(n => {
            n.status = 'healthy';
        });

        // Set Start Status
        this.graph.setNodeStatus(startNodeId, 'infected');

        // Initial UI Update
        this.updateUI({ action: 'start', source: startNodeId });
    }

    step() {
        if (this.queue.length === 0) {
            this.isRunning = false;
            this.updateUI({ action: 'stop', reason: 'No more pathways' });
            return { action: 'stop' };
        }

        const currentNodeId = this.queue.shift();
        const neighbors = this.graph.getNeighbors(currentNodeId);
        const newlyInfected = [];

        neighbors.forEach(neighborId => {
            if (!this.visited.has(neighborId)) {
                this.visited.add(neighborId);
                this.queue.push(neighborId);
                this.graph.setNodeStatus(neighborId, 'infected');
                newlyInfected.push(neighborId);
                this.log.push(`Spreading: ${currentNodeId} -> ${neighborId}`);

                // Check if Target Reached
                if (this.targetNode && neighborId === this.targetNode) {
                    this.isRunning = false; // STOP!
                }
            }
        });

        this.stepCount++;

        const result = {
            action: 'spread',
            source: currentNodeId,
            targets: newlyInfected,
            targetReached: newlyInfected.includes(this.targetNode)
        };

        this.updateUI(result);
        return result;
    }

    updateUI(lastAction) {
        const spreadingEdges = lastAction.targets ? lastAction.targets.map(target => ({ from: lastAction.source, to: target })) : [];
        const event = new CustomEvent('simulationUpdate', {
            detail: {
                queue: this.queue,
                log: this.log,
                lastAction: lastAction,
                stepCount: this.stepCount,
                spreadingEdges: spreadingEdges
            }
        });
        document.dispatchEvent(event);
    }
}

window.SimulationEngine = SimulationEngine;
