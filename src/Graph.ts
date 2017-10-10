
namespace GraphTheory {

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
     * Undirected Graph Data Structure
     * 
     * @export
     * @class Graph
     * @template T - Vertex label type
     */
    export class Graph<T> {

        /**
         * Set of all the vertices in the graph
         * 
         * @protected
         * @type {T[]}
         * @memberOf Graph
         */
        protected vertices: T[];
        /**
         * Set of all edges in the graph
         * 
         * @protected
         * @type {Edge<T>[]}
         * @memberOf Graph
         */
        protected edges: Edge<T>[];
        /**
         * Adjacency List representation of the graph
         * 
         * @protected
         * @type {Map<T, T[]>}
         * @memberOf Graph
         */
        protected adjacency_list: Map<T, T[]>;
        /**
         * Whether the graph is undirected or directed
         * 
         * @protected
         * @type {boolean}
         * @memberOf Graph
         */
        protected directed: boolean = false;

        /**
         * Creates an instance of Graph.
         * @param {T[]} vertices 
         * @param {(T[][] | Edge<T>[])} edges 
         * 
         * @memberOf Graph
         */
        constructor(vertices: T[], edges: T[][] | Edge<T>[]) {
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
                    edge['cost'] = edge['cost'];
                } else {
                    edge = {
                        from: edges[e][0],
                        to: edges[e][1],
                        cost: edges[e][2]
                    };
                }

                this.addEdge(edge);
            }
        }

        protected getEdge(from: T, to: T) : Edge<T> {
            let e = this.directed ? [from, to] : [from, to].sort();

            return {
                from: e[0],
                to: e[1]
            };
        }

        protected getEdgeIndex(edge: Edge<T>) : number {

            if (!this.hasEdge(edge)) {
                return -1;
            }

            let e = this.getEdge(edge.from, edge.to);
            
            for (let i = 0; i < this.edges.length; i++) {
                if (this.edges[i].from === e.from && this.edges[i].to === e.to) {
                    return i;
                }
            }  

            return -1;
        }

        /**
         * @param {T} v 
         * @returns {boolean} - whether the graph has a given vertex
         * 
         * @memberOf Graph
         */
        public hasVertex(v: T) : boolean {
            return this.adjacency_list.has(v);
        }


        /**
         * @param {Edge<T>} edge 
         * @returns {boolean} - whether the graph has a given edge
         * 
         * @memberOf Graph
         */
        public hasEdge(edge: Edge<T>) : boolean {

            if (!this.hasVertex(edge.from) || !this.hasVertex(edge.to)) {
                return false;
            }

            let e = this.getEdge(edge.from, edge.to);
            
            return this.getAdjacentVertices(e.from).indexOf(e.to) !== -1;  
        }

        /**
         * Adds a vertex to the graph
         * 
         * @param {T} v 
         * 
         * @memberOf Graph
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
         * @memberOf Graph
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
         * @memberOf Graph
         */
        public addEdge(edge: Edge<T>) : void {
            if (this.hasEdge(edge)) return;

            this.edges.push(edge);
            this.adjacency_list.get(edge.from).push(edge.to);

            if (!this.directed && edge.from !== edge.to) {
                this.adjacency_list.get(edge.to).push(edge.from);
            }
        }

        /**
         * Removes an edge from the graph
         * 
         * @param {Edge<T>} edge 
         * @returns {void} 
         * 
         * @memberOf Graph
         */
        public removeEdge(edge: Edge<T>) : void {
            let idx = this.getEdgeIndex(edge);
            
            if (idx === -1) return;

            let e = this.getEdge(edge.from, edge.to);

            this.adjacency_list.get(e.from).splice(this.adjacency_list.get(e.from).indexOf(e.to), 1);
            this.edges.splice(idx, 1);
        }

        //getters & setters

        /**
         * @returns {T[]} - the set of vertices in the graph
         * 
         * @memberOf Graph
         */
        public getVertices() : T[] {
            return this.vertices;
        }


        /**
         * @returns {Edge<T>[]} - the set of edges/arcs in the graph
         * 
         * @memberOf Graph
         */
        public getEdges() : Edge<T>[] {
            return this.edges;
        }

        /**
         * @returns {Map<T, T[]>} - the Adjacency List representation of the graph
         * 
         * @memberOf Graph
         */
        public getAdjacencyList() : Map<T, T[]> {
            return this.adjacency_list;
        }

        /**
         * @param {T} v 
         * @returns {T[]} - the adjacent vertices of v
         * 
         * @memberOf Graph
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
         * @memberOf Graph
         */
        public getVertexDegree(v: T) : number {
            return this.getAdjacentVertices(v).length;
        }


        /**
         * @returns {Graph<T>} - the complementary (or inverse) graph 
         * 
         * @memberOf Graph
         */
        public getComplementaryGraph() : Graph<T> {
            
            let edges = [];

            let n = this.vertices.length;

            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i !== j && !this.hasEdge({from: this.vertices[i], to: this.vertices[j]})) {
                        edges.push([this.vertices[i], this.vertices[j]]);
                    }
                }
            }

            return new Graph<T>(this.vertices.slice(), edges);
        }

        //properties


        /**
         * @returns {boolean} - whether the graph is complete
         * i.e: All vertices are connected to one another
         * 
         * @memberOf Graph
         */
        public isComplete() : boolean {
            let n = this.vertices.length - 1;

            for (let v = 0; v < n + 1; v++) {
                if (this.getVertexDegree(this.vertices[v]) < n) {
                    return false;
                }
            }

            return true;
        }

        /**
         * @returns {boolean} - whether the graph is undirected or directed
         * 
         * @memberOf Graph
         */
        public isDirected() : boolean {
            return this.directed;
        }

        /**
         * @returns {boolean} - whether the graph is empty
         * i.e: if the set of vertices has no element
         * 
         * @memberOf Graph
         */
        public isEmpty() : boolean {
            return this.vertices.length === 0;
        }

        /**
         * Creates a clone of this graph
         * 
         * @returns {Graph<T>} 
         * 
         * @memberOf Graph
         */
        public clone() : Graph<T> {
            return new Graph<T>(this.vertices.slice(), this.edges.slice());
        }

        /**
         * Draws an edge onto a canvas
         * 
         * @protected
         * @param {CanvasRenderingContext2D} ctx 
         * @param {number} vertex_radius 
         * @param {{x: number, y: number}} from 
         * @param {{x: number, y: number}} to 
         * 
         * @memberOf Graph
         */
        protected drawEdge(ctx: CanvasRenderingContext2D,
            vertex_radius: number,
            from: {x: number, y: number},
            to: {x: number, y: number}
        ) : void {

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }

        /**
         * Draws a graph onto a canvas
         * 
         * @param {HTMLCanvasElement} cnv 
         * @param {Map<T, {x: number, y: number}>} vertices_coords 
         * @param {{
         *                 vertex_radius: number,
         *                 vertex_color: string,
         *                 edge_width: number,
         *                 edge_color: string
         *             }} [options={
         *                 vertex_radius: 10,
         *                 vertex_color: 'lightblue',
         *                 edge_width: 1,
         *                 edge_color: 'black'
         *             }] 
         * 
         * @memberOf Graph
         */
        public draw(
            cnv: HTMLCanvasElement,
            vertices_coords: Map<T, {x: number, y: number}>,
            options: {
                vertex_radius: number,
                vertex_color: string,
                edge_width: number,
                edge_color: string
            } = {
                vertex_radius: 10,
                vertex_color: 'lightblue',
                edge_width: 1,
                edge_color: 'black'
            }) : void {

            let ctx = cnv.getContext('2d');
                
            ctx.clearRect(0, 0, cnv.width, cnv.height);
            ctx.strokeStyle = options.edge_color;
            ctx.lineWidth = options.edge_width;

            for (let edge of this.getEdges()) {
                let origin = vertices_coords.get(edge.from),
                    dst = vertices_coords.get(edge.to);
                this.drawEdge(ctx, options.vertex_radius, origin, dst);
                ctx.closePath();
            }

            ctx.fillStyle = options.vertex_color;

            for (let [v, p] of vertices_coords) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, options.vertex_radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeText(v.toString(), p.x - 2, p.y + 3, options.vertex_radius);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}