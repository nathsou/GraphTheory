/// <reference path="Graph.ts" />

namespace GraphTheory {

    export class DirectedGraph<T> extends Graph<T> {
        
        constructor(vertices: T[], edges: T[][] | Edge<T>[]) {
            super(vertices, edges);
        }

        //order matters
        public hasEdge(from: T, to: T) : boolean {
            
            return this.hasVertex(from)
                && this.hasVertex(to)
                && this.getAdjacentVertices(from).indexOf(to) !== -1;
        }

        //are [from, to] and [to, from] in edges ?
        public isEdgeUndirected(from: T, to: T) : boolean {
            return this.hasEdge(from, to) && this.hasEdge(to, from);
        }

        public addEdge(edge: Edge<T>) : void {
            if (this.hasEdge(edge.from, edge.to)) return;

            this.edges.push(edge);

            if (this.adjacency_list.get(edge.from).indexOf(edge.to) === -1) {
                this.adjacency_list.get(edge.from).push(edge.to);
            }
        }

        static fromUndirected<T>(graph: Graph<T>) : DirectedGraph<T> {
            let directed = new DirectedGraph<T>(graph.getVertices(), graph.getEdges());

            for (let edge of graph.getEdges()) {
                directed.addEdge({from: edge.to, to: edge.from, cost: edge.cost});
            }

            return directed;
        }

        //draw arrows to represent the direction
        protected drawEdge(
            ctx: CanvasRenderingContext2D,
            vertex_radius: number,
            from: {x: number, y: number},
            to: {x: number, y: number}
        ) : void {
            
            ctx.beginPath();
            let a = Math.atan2(to.y - from.y, to.x - from.x);
            let n = {x: Math.cos(a), y: Math.sin(a)};
            let p = {x: to.x - vertex_radius * n.x, y: to.y - vertex_radius * n.y};

            let b = Math.PI / 1.2;
            let u = {x: Math.cos(a + b), y: Math.sin(a + b)};
            let v = {x: Math.cos(a - b), y: Math.sin(a - b)};

            ctx.moveTo(from.x, from.y);
            ctx.lineTo(p.x, p.y);

            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.moveTo(p.x + vertex_radius * u.x, p.y + vertex_radius * u.y);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo(p.x + vertex_radius * v.x, p.y + vertex_radius * v.y);

            ctx.fill();
        }

    }
}