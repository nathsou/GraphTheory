/// <reference path="Graph.ts" />

namespace GraphTheory {

    //Arcs in a DirectedGraph are represented by edges
    type Arc<T> = Edge<T>

    /**
     * Directed Graph Data Structure
     * 
     * @export
     * @class DirectedGraph
     * @extends {Graph<T>}
     * @template T - Vertex label type
     */
    export class DirectedGraph<T> extends AbstractGraph<T> {

        /**
         * Creates an instance of DirectedGraph.
         * @param {T[]} vertices 
         * @param {(T[][] | Arc<T>[])} arcs 
         * 
         * @memberOf Graph
         */
        constructor(vertices: T[], arcs: T[][] | Arc<T>[]) {
            super(vertices, arcs, true);
        }

        /**
         * @param {Edge<T>} edge 
         * @returns {boolean} - whether an arc is undirected
         * i.e: if arcs (from, to) and (to, from) are in the set of edges
         * 
         * @memberOf DirectedGraph
         */
        public isArcUndirected(arc: Arc<T>) : boolean {
            return this.hasEdge(arc) && this.hasOppositeEdge(arc);
        }

        /**
         * Creates a DirectedGraph from a Graph
         * (each edge [i, j] forms two arcs (i, j) and (j, i))
         * 
         * @static
         * @template T 
         * @param {Graph<T>} graph 
         * @returns {DirectedGraph<T>} 
         * 
         * @memberOf DirectedGraph
         */
        public static fromUndirected<T>(graph: Graph<T>) : DirectedGraph<T> {
            let directed = new DirectedGraph<T>(graph.getVertices(), graph.getEdges());

            for (let edge of graph.getEdges()) {
                directed.addEdge({from: edge.to, to: edge.from, cost: edge.cost});
            }

            return directed;
        }

        /**
         * Converts a JSON reprensation of a graph into a DirectedGraph
         * 
         * @static
         * @template T 
         * @param {JsonGraph<T>} json 
         * @returns {Graph<T>} 
         * 
         * @memberOf DirectedGraph
         */
        public static fromJSON<T>(json: JsonGraph<T>) : DirectedGraph<T> {
            let graph = Graph.checkJsonGraph(json);
            
            return new DirectedGraph<T>(json.vertices, json.edges);
        }

        /**
         * Creates a clone of this directed graph
         * 
         * @returns {DirectedGraph<T>} 
         * 
         * @memberOf DirectedGraph
         */
        public clone() : DirectedGraph<T> {
            return new DirectedGraph<T>(this.vertices.slice(), this.edges.slice());
        }

    }
}