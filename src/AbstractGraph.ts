/// <reference path="../src/Utils.ts" />

namespace GraphTheory {

    import Vec2 = GraphTheory.Utils.Vec2;

    /**
     * Represents an edge in undirected graphs and arcs in directed graphs
     * 
     * @export
     * @interface Edge
     * @template T - Vertex label type
     */
    export interface Edge<T> {
        from: T,
        to: T,
        cost?: number
    }

    /**
     * Checks if a given object implements the Edge<T> interface
     * i.e: if it has 'from' and 'to' properties
     * 
     * @export
     * @template T - Vertex label type
     * @param {*} obj - JavaScript object to check
     * @returns {obj is Edge<T>} 
     */
    export function isEdge<T>(obj: any) : obj is Edge<T> {
        return 'from' in obj && 'to' in obj;
    }

    /**
     * JSON representation of a Graph
     * 
     * @export
     * @interface JsonGraph
     * @template T - Vertex label type
     */
    export interface JsonGraph<T> {
        vertices: T[],
        edges: Edge<T>[],
        directed: boolean,
        adjacency_list?: [T, T[]][]
    }

    /**
     * Checks if a given object implements the JsonGraph<T> interface
     * 
     * @export
     * @template T 
     * @param {*} obj 
     * @returns {obj is JsonGraph<T>} 
     */
    export function isJsonGraph<T>(obj: any) : obj is JsonGraph<T> {
        return 'vertices' in obj && 'edges' in obj && 'directed' in obj;
    }


    export abstract class AbstractGraph<T> {
        /**
         * Set of all the vertices in the graph
         * 
         * @protected
         * @type {T[]}
         * @memberOf AbstractGraph
         */
        protected vertices: T[];
        /**
         * Set of all the edges in the graph
         * 
         * @protected
         * @type {Edge<T>[]}
         * @memberOf AbstractGraph
         */
        protected edges: Edge<T>[];
        /**
         * Adjacency List representation of the graph
         * 
         * @protected
         * @type {Map<T, T[]>}
         * @memberOf AbstractGraph
         */
        protected adjacency_list: Map<T, T[]>;
        /**
         * Whether the graph is undirected or directed
         * 
         * @protected
         * @type {boolean}
         * @memberOf AbstractGraph
         */
        protected directed: boolean;

        constructor(vertices: T[], edges: T[][] | Edge<T>[], directed : boolean = false) {
            this.directed = directed;
            this.vertices = [];
            this.edges = [];
            this.adjacency_list = new Map<T, T[]>();

            for (let v = 0; v < vertices.length; v++) {
                this.addVertex(vertices[v]);
            }

            for (let e = 0; e < edges.length; e++) {
                
                let edge: Edge<T>;

                if (isEdge<T>(edges[e])) {
                    edge = edges[e] as Edge<T>;
                    edge['cost'] = edge['cost'] !== undefined ? edge['cost'] : 1;
                } else {
                    edge = {
                        from: edges[e][0],
                        to: edges[e][1],
                        cost: edges[e][2] !== undefined ? edges[e][2] : 1
                    };
                }

                this.addEdge(edge);
            }
        } 

        /**
         * @param {T} v 
         * @returns {boolean} - whether the graph has a given vertex
         * 
         * @memberOf AbstractGraph
         */
        public hasVertex(v: T) : boolean {
            return this.adjacency_list.has(v);
        }

        /**
         * 
         * @protected
         * @param {T} from 
         * @param {T} to 
         * @returns {Edge<T>} - representation of an edge as stored in adjacency_list
         * (differentiates directed and undirected cases)
         * 
         * @memberOf AbstractGraph
         */
        protected toEdge(from: T, to: T, cost?: number) : Edge<T> {
            //if the graph is undirected, sort the vertices
            //so that [from, to] represents the same edge as [to, from]
            let e = this.directed ? [from, to] : [from, to].sort();

            return {
                from: e[0],
                to: e[1],
                cost: cost !== undefined ? cost : 1
            };
        }

         /**
         * @param {Edge<T>} edge 
         * @returns {boolean} - whether the graph has a given edge
         * 
         * @memberOf AbstractGraph
         */
        public hasEdge(edge: Edge<T>) : boolean {

            if (!this.hasVertex(edge.from) || !this.hasVertex(edge.to)) {
                return false;
            }

            let e = this.toEdge(edge.from, edge.to);
            
            return this.getAdjacentVertices(e.from).indexOf(e.to) !== -1;  
        }

        /**
         * 
         * @param {Edge<T>} edge 
         * @returns {boolean} - whether the graph has the opposite edge {from: edge.to, to: edge.from}
         * 
         * @memberOf AbstractGraph
         */
        public hasOppositeEdge(edge: Edge<T>) : boolean {
            return this.hasEdge({from: edge.to, to: edge.from}); 
        }

        /**
         * 
         * @returns {boolean} - whether the graph has at least one edge with a negative cost
         * 
         * @memberOf AbstractGraph
         */
        public hasNegativeCosts() : boolean {
            return this.edges.some((edge: Edge<T>) => edge.cost < 0);
        }

         /**
         * Adds a vertex to the graph
         * 
         * @param {T} v 
         * 
         * @memberOf AbstractGraph
         */
        public addVertex(v: T) : void {
            if (!this.hasVertex(v)) {
                this.vertices.push(v);
                this.adjacency_list.set(v, []);
            }
        }

         /**
         * Removes a given vertex from the graph
         * 
         * @param {T} v 
         * 
         * @memberOf AbstractGraph
         */
        public removeVertex(v: T) : void {
            this.adjacency_list.delete(v);
            this.vertices.splice(this.vertices.indexOf(v), 1);
        }

         /**
         * Adds an edge to the graph
         * 
         * @param {Edge<T>} edge 
         * @returns {void} 
         * 
         * @memberOf AbstractGraph
         */
        public addEdge(edge: Edge<T>) : void {
            if (this.hasEdge(edge)) return;

            let e = this.toEdge(edge.from, edge.to, edge['cost']);

            this.edges.push(e);
            this.adjacency_list.get(e.from).push(e.to);

            //if the graph is directed, it's an arc -> add [from, to] and to [to, from]
            if (!this.directed && e.from !== e.to) {
                this.adjacency_list.get(e.to).push(e.from);
            }
        }

        /**
         * 
         * @param {Edge<T>} edge 
         * @returns {number} - the index of the given edge in the edges array, -1 if it doesn't exist
         * 
         * @memberOf AbstractGraph
         */
        public getEdgeIndex(edge: Edge<T>) : number {
            
            //first check that this edge exists
            if (this.hasEdge(edge)) {
                let e = this.toEdge(edge.from, edge.to);
                
                for (let i = 0; i < this.edges.length; i++) {
                    if (this.edges[i].from === e.from && this.edges[i].to === e.to) {
                        return i;
                    }
                }  
            }

            return -1;
        }

        /**
         * Removes an edge from the graph
         * 
         * @param {Edge<T>} edge 
         * @returns {void} 
         * 
         * @memberOf AbstractGraph
         */
        public removeEdge(edge: Edge<T>) : void {
            let idx = this.getEdgeIndex(edge);
            
            if (idx === -1) return;

            let e = this.toEdge(edge.from, edge.to);

            this.adjacency_list.get(e.from).splice(this.adjacency_list.get(e.from).indexOf(e.to), 1);
            this.edges.splice(idx, 1);
        }

        /**
         * Removes all the edges while keeping the vertices
         * 
         * @memberOf AbstractGraph
         */
        public clearEdges() : void {
            this.edges = [];
            
            for (let v of this.vertices) {
                this.adjacency_list.set(v, []);
            }
        }

        /**
         * Clears the graph
         * i.e: removes all vertices and edges (empty graph)
         * 
         * @memberOf AbstractGraph
         */
        public clear() : void {
            this.edges = [];
            this.vertices = [];
            this.adjacency_list.clear();
        }

        //getters & setters

        /**
         * @returns {T[]} - the set of vertices in the graph
         * 
         * @memberOf AbstractGraph
         */
        public getVertices() : T[] {
            return this.vertices;
        }

        /**
         * 
         * @param {number} idx 
         * @returns {T} - the ith vertex in the graph (by order of addVertex() call)
         * 
         * @memberOf AbstractGraph
         */
        public getVertex(i: number) : T {
            return this.vertices[i];
        }

        /**
         * @returns {Edge<T>[]} - the set of edges/arcs in the graph
         * 
         * @memberOf AbstractGraph
         */
        public getEdges() : Edge<T>[] {
            return this.edges;
        }

        /**
         * 
         * @param {number} i 
         * @returns {Edge<T>} - the ith edge in the graph (by order of addEdge() call)
         * 
         * @memberOf AbstractGraph
         */
        public getEdge(i: number) : Edge<T> {
            if (i === -1) throw new RangeError(`Invalid edge index: ${i}`);

            return this.edges[i];
        }

        /**
         * 
         * @param {T} u 
         * @param {T} v 
         * @returns {number} - the cost from edge u to v
         * 
         * @memberOf AbstractGraph
         */
        public getCost(u: T, v: T) : number {

            return this.getEdge(this.getEdgeIndex({
                from: u,
                to: v
            })).cost;
        }

        /**
         * @returns {Map<T, T[]>} - the Adjacency List representation of the graph
         * 
         * @memberOf AbstractGraph
         */
        public getAdjacencyList() : Map<T, T[]> {
            return this.adjacency_list;
        }

        /**
         * @param {T} v 
         * @returns {T[]} - the adjacent vertices of v
         * 
         * @memberOf AbstractGraph
         */
        public getAdjacentVertices(v: T) : T[] {
            return this.adjacency_list.get(v);
        }

        /**
         * 
         * @param {T} v 
         * @returns {number} - the degree of vertex v
         * i.e: the number of vertices adjacent to v
         * 
         * @memberOf AbstractGraph
         */
        public getVertexDegree(v: T) : number {
            return this.getAdjacentVertices(v).length;
        }

        //properties

        /**
         * @returns {boolean} - whether the graph is undirected or directed
         * 
         * @memberOf AbstractGraph
         */
        public isDirected() : boolean {
            return this.directed;
        }

        /**
         * @returns {boolean} - whether the graph is empty
         * i.e: if the set of vertices has no element
         * 
         * @memberOf AbstractGraph
         */
        public isEmpty() : boolean {
            return this.vertices.length === 0;
        }

        /**
         * @param {boolean} [include_adjacency_list=false]
         * @returns {JsonGraph<T>} - JSON representation of the graph
         * 
         * @memberOf AbstractGraph
         */
        public toJsonGraph(include_adjacency_list: boolean = false) : JsonGraph<T> {
            let graph = {
                vertices: this.vertices,
                edges: this.edges,
                directed: this.directed
            };

            if (include_adjacency_list) {
                graph['adjacency_list'] = [...this.adjacency_list];
            }

            return graph;
        }

        /**
         * @param {boolean} [include_adjacency_list=false]
         * @returns {JsonGraph<T>} - string JSON representation of the graph
         * 
         * @memberOf AbstractGraph
         */
        public toJSON(include_adjacency_list: boolean = false) : string {
            return JSON.stringify(this.toJsonGraph(include_adjacency_list));
        }

        protected static checkJsonGraph<T>(json: JsonGraph<T> | string) : JsonGraph<T> {
            let graph: JsonGraph<T> = typeof json === 'string' ? JSON.parse(json) : json;
            
            if (!isJsonGraph(graph)) {
                throw new Error(`${JSON.stringify(graph)}\ndoesn't implement JsonGraph interface.`);
            }

            return graph;
        }

        /**
         * Converts a JSON reprensation of a graph into a Graph
         * 
         * @static
         * @template T 
         * @param {JsonGraph<T>} json 
         * @returns {Graph<T>} 
         * 
         * @memberOf AbstractGraph
         */
        public static fromJSON<T>(json: JsonGraph<T> | string) : AbstractGraph<T> {
            return null;  
        };

        public abstract clone() : AbstractGraph<T>;

    }

}