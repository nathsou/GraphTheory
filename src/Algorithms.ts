/// <reference path="Utils.ts" />

namespace GraphTheory {

    
    /**
     * @export
     * @abstract
     * @class Algorithms - Implementation of useful graph algorithms.
     */
    export namespace Algorithms {

        //GRAPH TRAVERSAL ALGORITHMS 

        /**
         * Enumeration of available tree traversal algorithms
         * 
         * @export
         * @enum {number}
         */
        export enum CONNECTED_COMPONENT_METHOD {
            BREADH_FIRST_SEARCH,
            DEPTH_FIRST_SEARCH_ITERATIVE,
            DEPTH_FIRST_SEARCH_RECURSIVE
        }

        /**
         * Uses a tree traversal alogrithm to find all vertices connected to initial_vertex
         * 
         * @export
         * @template T - The type used to represent labels in the graph
         * @param {AbstractGraph<T>} g - The graph which is to be traversed
         * @param {T} initial_vertex - Vertex label to start the traversal with
         * @param {CONNECTED_COMPONENT_METHOD} [method=CONNECTED_COMPONENT_METHOD.BREADH_FIRST_SEARCH] - specifies the tree traversal algorithm used
         * @param {(a: T, b: T) => number} [label_ordering] - Ordering on labels
         * @returns {T[]}  - list of found nodes in the order of discovery

         */
        export function getConnectedComponent<T>(
            g: AbstractGraph<T>,
            initial_vertex: T,
            label_ordering?: (a: T, b: T) => number,
            method: CONNECTED_COMPONENT_METHOD = CONNECTED_COMPONENT_METHOD.BREADH_FIRST_SEARCH
        ) : T[] {

            switch (method) {
                case CONNECTED_COMPONENT_METHOD.BREADH_FIRST_SEARCH:
                    return breadthFirstSearch(g, initial_vertex, label_ordering);
                
                case CONNECTED_COMPONENT_METHOD.DEPTH_FIRST_SEARCH_ITERATIVE:
                    return iterativeDepthFirstSearch(g, initial_vertex, label_ordering);

                default:
                    return recursiveDepthFirstSearch(g, initial_vertex, label_ordering);
            }
        }
        /**
         * Implementation of Breadth First Search (BFS) graph traversal
         * 
         * @export
         * @template T - The type used to represent labels in the graph
         * @param {AbstractGraph<T>} g - The graph which is to be traversed
         * @param {T} initial_vertex - Vertex label to start the traversal with
         * @param {(a: T, b: T) => number} [label_ordering] - Ordering on labels
         * @returns {T[]}  - list of found nodes in the order of discovery
         * 
         */
        export function breadthFirstSearch<T>(
            g: AbstractGraph<T>,
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
         * @enum {number}
         */
        export enum DFS_METHOD {
            ITERATIVE,
            RECURSIVE
        }

        /**
         * Implementation of Depth First Search (DFS) Tree traversal
         * 
         * @export
         * @template T - The type used to represent labels in the graph
         * @param {AbstractGraph<T>} g - The graph which is to be traversed
         * @param {T} initial_vertex - Vertex label to start the traversal with
         * @param {(a: T, b: T) => number} [label_ordering] - Ordering on labels
         * @param {DFS_METHOD} [method=DFS_METHOD.ITERATIVE] - select the algorithm to be run
         * @returns {T[]}  - list of found nodes in the order of discovery
         */
        export function depthFirstSearch<T>(
            g: AbstractGraph<T>,
            initial_vertex: T,
            label_ordering?: (a: T, b: T) => number,
            method: DFS_METHOD = DFS_METHOD.ITERATIVE
        ) {
            if (method === DFS_METHOD.ITERATIVE) {
                return iterativeDepthFirstSearch(g, initial_vertex, label_ordering);
            }

            return recursiveDepthFirstSearch(g, initial_vertex, label_ordering);
        }

        function iterativeDepthFirstSearch<T>(
            g: AbstractGraph<T>,
            initial_vertex: T,
            label_ordering?: (a: T, b: T) => number 
        ) : T[] {
            let visited_nodes = new Map<T, boolean>();
            let stack = new Utils.Stack<T>(initial_vertex);
            let order: T[] = [];

            while (!stack.isEmpty()) {
                let v = stack.pop();
                let adj_nodes = g.getAdjacentVertices(v).sort(label_ordering);

                if (!visited_nodes.has(v)) {
                    visited_nodes.set(v, true);
                    order.push(v);

                    for (let w of adj_nodes) {
                        stack.push(w);
                    }
                }
            }

            return order;
        }

        function recursiveDepthFirstSearch<T>(
            g: AbstractGraph<T>,
            initial_vertex: T,
            label_ordering?: (a: T, b: T) => number
        ) : T[] {
            let visited_nodes = new Map<T, boolean>();
            let order: T[] = [];

            let DFS = (g: AbstractGraph<T>, v: T) => {
                visited_nodes.set(v, true);
                order.push(v);
                let adj_nodes = g.getAdjacentVertices(v).sort(label_ordering);

                for (let w of adj_nodes) {
                    if (!visited_nodes.has(w)) {
                        DFS(g, w);
                    }
                }
            };

            DFS(g, initial_vertex);

            return order;
        }

        export enum MINIMUM_SPANNING_TREE_METHOD {
            PRIM
        }

        export function getMinimumSpanningTree<T>(
            g: AbstractGraph<T>,
            initial_vertex: T,
            method: MINIMUM_SPANNING_TREE_METHOD = MINIMUM_SPANNING_TREE_METHOD.PRIM
        ) {
            let vertices = [];
        }

        /**
         * 
         * @export
         * @template T 
         * @param {AbstractGraph<T>} g 
         * @returns {(Graph<T> | DirectedGraph<T>)} - the complementary (or inverse) graph 
         */
        export function getComplementaryGraph<T>(
            g: AbstractGraph<T>
        ) : Graph<T> | DirectedGraph<T> {
            
            let edges = [];

            let n = g.getVertices().length;

            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i !== j && !g.hasEdge({from: g.getVertex(i), to: g.getVertex(j)})) {
                        edges.push([g.getVertex(i), g.getVertex(j)]);
                    }
                }
            }

            if (g.isDirected()) {
                return new DirectedGraph<T>(g.getVertices().slice(), edges);
            } else {
                return new Graph<T>(g.getVertices().slice(), edges);
            }
        }

         /**
         * @param {AbstractGraph<T>} g 
         * @returns {boolean} - whether the graph is complete
         * i.e: All vertices are connected to one another
         * 
         * @memberOf AbstractGraph
         */
        export function isComplete<T>(g: AbstractGraph<T>) : boolean {
            let n = g.getVertices().length - 1;

            for (let v = 0; v < n + 1; v++) {
                if (g.getVertexDegree(g.getVertex(v)) < n) {
                    return false;
                }
            }

            return true;
        }

        export enum SHORTEST_PATH_METHOD {
            DIJKSTRA, BELLMAN_FORD, AUTO
        }

        export function getShortestPath<T>(
            g: AbstractGraph<T>,
            initial_vertex: T,
            method: SHORTEST_PATH_METHOD = SHORTEST_PATH_METHOD.AUTO
        ) {

        } 

        function dijkstra<T>(g: AbstractGraph<T>, initial_vertex: T) {
            let dist_map = new Map<T, number>();

            //initialize dist_map
            for (let v of g.getVertices()) {
                dist_map.set(v, Infinity);
            }

            dist_map.set(initial_vertex, 0);

            let Q = g.getVertices().slice;
            
            while (Q.length !== 0) {
                let min = Infinity,
                    vertex = -1;

                for (let i = 0; i < Q.length; i++) {
                    if (dist_map.get(g.getVertex(i)) < min) {
                        min = dist_map.get(g.getVertex(i));
                        vertex
                    }
                }
            }

            

        }

    }
}