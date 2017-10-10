/// <reference path="Graph.ts" />

namespace GraphTheory {

    type Arc<T> = Edge<T>

    /**
     * Directed Graph Data Structure
     * 
     * @export
     * @class DirectedGraph
     * @extends {Graph<T>}
     * @template T - Vertex label type
     */
    export class DirectedGraph<T> extends Graph<T> {
        
        constructor(vertices: T[], edges: T[][] | Arc<T>[]) {
            super(vertices, edges);
            this.directed = true;
        }
        /**
         * @param {Edge<T>} edge 
         * @returns {boolean} - whether an arc is undirected
         * i.e: if arcs (from, to) and (to, from) are in the set of edges
         * 
         * @memberOf DirectedGraph
         */
        public isArcUndirected(arc: Arc<T>) : boolean {
            return this.hasEdge(arc) && this.hasEdge({from: arc.to, to: arc.from});
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
        static fromUndirected<T>(graph: Graph<T>) : DirectedGraph<T> {
            let directed = new DirectedGraph<T>(graph.getVertices(), graph.getEdges());

            for (let edge of graph.getEdges()) {
                directed.addEdge({from: edge.to, to: edge.from, cost: edge.cost});
            }

            return directed;
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
            from: {x: number, y: number},
            to: {x: number, y: number}
        ) : void {
            
            let a = Math.atan2(to.y - from.y, to.x - from.x);
            let n = {x: Math.cos(a), y: Math.sin(a)};
            let p = {x: to.x - vertex_radius * n.x, y: to.y - vertex_radius * n.y};

            let b = Math.PI / 1.2;
            let u = {x: Math.cos(a + b), y: Math.sin(a + b)};
            let v = {x: Math.cos(a - b), y: Math.sin(a - b)};

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.moveTo(p.x + vertex_radius * u.x, p.y + vertex_radius * u.y);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo(p.x + vertex_radius * v.x, p.y + vertex_radius * v.y);
            ctx.fill();
            ctx.closePath();
        }

    }
}