/// <reference path="Graph.ts" />
/// <reference path="DirectedGraph.ts" />
/// <reference path="Utils.ts" />

namespace GraphTheory {

    
    /**
     * @export
     * @abstract
     * @class Algorithms - Implementation of useful graph algorithms.
     */
    export abstract class Algorithms {

        //GRAPH TRAVERSAL ALGORITHMS 

        /**
         * Implementation of Breadth First Search (BFS) graph traversal
         * 
         * @static
         * @template T - The type used to represent labels in the graph
         * @param {Graph<T>} g - The graph which is to be traversed
         * @param {T} initial_vertex - Vertex label to start the traversal with
         * @param {(a: T, b: T) => number} [label_ordering] - Ordering on labels
         * @returns {T[]}  - Ordered list of found nodes
         * 
         * @memberOf Algorithms
         */
        public static breadthFirstSearch<T>(
            g: Graph<T>,
            initial_vertex: T,
            label_ordering?: (a: T, b: T) => number
        ): T[] {

            let visited_nodes = new Map<T, boolean>();

            let queue = new Utils.Queue<T>(initial_vertex);
            let order: T[] = [];

            while (!queue.isEmpty()) {
                let j = queue.dequeue();
                let adj_nodes = g.getAdjacentVertices(j).sort(label_ordering);
                for (let i = 0; i < adj_nodes.length; i++) {
                    let k = adj_nodes[i];
                    if (!visited_nodes.has(k)) {
                        visited_nodes.set(k, true);
                        queue.enqueue(k);
                    }
                }
                visited_nodes.set(j, true);
                order.push(j);
            }

            return order;
        }

        /**
         * Implementation of Depth First Search (dFS) Tree traversal
         * 
         * @static
         * @template T - The type used to represent labels in the graph
         * @param {Graph<T>} g - The graph which is to be traversed
         * @param {T} initial_vertex - Vertex label to start the traversal with
         * @param {(a: T, b: T) => number} [label_ordering] - Ordering on labels
         * @returns {T[]}  - Ordered list of found nodes
         * 
         * @memberOf Algorithms
         */
        public static depthFirstSearch<T>(
            g: Graph<T>,
            initial_vertex: T,
            label_ordering?: (a: T, b: T) => number
        ) {

        }
    }
}