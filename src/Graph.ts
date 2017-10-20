/// <reference path="AbstractGraph.ts" />

namespace GraphTheory {

    /**
     * Undirected Graph Data Structure
     * 
     * @export
     * @class Graph
     * @template T - Vertex label type
     */
    export class Graph<T> extends AbstractGraph<T> {
        /**
         * Creates an instance of Graph.
         * @param {T[]} vertices 
         * @param {(T[][] | Edge<T>[])} edges 
         * 
         * @memberOf Graph
         */
        constructor(vertices: T[], edges: T[][] | Edge<T>[]) {
            super(vertices, edges);
        }

         /**
         * Creates a clone of this graph
         * 
         * @returns {DirectedGraph<T>} 
         * 
         * @memberOf Graph
         */
        public clone() : Graph<T> {
            return new Graph<T>(this.vertices.slice(), this.edges.slice());
        }

         /**
         * Converts a JSON reprensation of a graph into a Graph
         * 
         * @static
         * @template T 
         * @param {JsonGraph<T>} json 
         * @returns {Graph<T>} 
         * 
         * @memberOf Graph
         */
        public static fromJSON<T>(json: JsonGraph<T> | string) : Graph<T> | DirectedGraph<T> {
            let graph = Graph.checkJsonGraph(json);

            return new Graph<T>(graph.vertices, graph.edges);
        }

    }
}