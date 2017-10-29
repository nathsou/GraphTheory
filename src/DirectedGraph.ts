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

        /**
         * Draws an arc onto a canvas
         * 
         * @protected
         * @param {CanvasRenderingContext2D} ctx 
         * @param {number} vertex_radius 
         * @param {{x: number, y: number}} from 
         * @param {{x: number, y: number}} to 
         * 
         * @memberOf DirectedGraph
         */
        protected drawEdge(
            ctx: CanvasRenderingContext2D,
            vertex_radius: number,
            edge_color: string,
            from: {x: number, y: number},
            to: {x: number, y: number}
        ) : void {
            
            //angle between the two vertices
            let a = Math.atan2(to.y - from.y, to.x - from.x);
            //direction vector
            let d = {x: Math.cos(a), y: Math.sin(a)};
            //intersection between the line following the direction vector
            //and the circle representing the 'to' vertex
            let p = {x: to.x - vertex_radius * d.x, y: to.y - vertex_radius * d.y};

            //controls the shape of the arrow
            let b = Math.PI / 1.2;
            //bottom right
            let u = {x: Math.cos(a + b), y: Math.sin(a + b)};
            //bottom left
            let v = {x: Math.cos(a - b), y: Math.sin(a - b)};

            //draw line
            super.drawEdge(ctx, vertex_radius, edge_color, from, to);

            //draw triangle
            ctx.fillStyle = edge_color;
            ctx.beginPath();
            ctx.moveTo(p.x + vertex_radius * u.x, p.y + vertex_radius * u.y);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo(p.x + vertex_radius * v.x, p.y + vertex_radius * v.y);
            ctx.fill();
            ctx.closePath();
        }

    }
}