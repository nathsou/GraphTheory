/// <reference path="Graph.ts" />

namespace GraphTheory {

    export class DirectedGraph<T> extends Graph<T> {
        
        constructor(vertices: T[], edges: T[][] | Edge<T>[]) {
            super(vertices, edges);
            this.directed = true;
        }

        //order matters
        protected getEdge(from: T, to: T) : Edge<T> { //<=> getArc
            return {
                from: from,
                to: to
            };
        }

        //are [from, to] and [to, from] in edges ?
        public isEdgeUndirected(edge: Edge<T>) : boolean {
            return this.hasEdge(edge) && this.hasEdge({from: edge.to, to: edge.from});
        }

        public addEdge(edge: Edge<T>) : void {
            if (this.hasEdge(edge)) return;

            this.edges.push(edge);

            if (!this.hasEdge(edge)) {
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

        //draw arrows to represent an arc's direction
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