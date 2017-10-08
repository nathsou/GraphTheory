
namespace GraphTheory {

    export interface Edge<T> {
        from: T,
        to: T,
        cost?: number
    }

    export function isEdge<T>(obj: any) : obj is Edge<T> {
        return 'from' in obj && 'to' in obj;
    }

    export class Graph<T> {

        protected vertices: T[];
        protected edges: Edge<T>[];
        protected adjacency_list: Map<T, T[]>;

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
                    edge['cost'] = edge['cost'] ? edge.cost : undefined;
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

        public hasVertex(v: T) : boolean {
            return this.vertices.indexOf(v) !== -1;
        }

        public hasEdge(from: T, to: T) : boolean {
            let e = [from, to].sort();
            
            for (let i = 0; i < this.edges.length; i++) {
                if (this.edges[i].from === e[0] && this.edges[i].to === e[1]) {
                    return true;
                }
            }
            
            return false;
        }

        public addVertex(v: T) : void {
            if (this.vertices.indexOf(v) === -1) {
                this.vertices.push(v);
                this.adjacency_list.set(v, []);
            }
        }

        public addEdge(edge: Edge<T>) : void {
            if (this.hasEdge(edge.from, edge.to)) return;

            this.edges.push(edge);
            this.adjacency_list.get(edge.from).push(edge.to);
            if (edge.from !== edge.to) {
                this.adjacency_list.get(edge.to).push(edge.from);
            }
        }

        //getters & setters

        public getVertices() : T[] {
            return this.vertices;
        }

        public getEdges() : Edge<T>[] {
            return this.edges;

        }

        public getAdjacencyList() : Map<T, T[]> {
            return this.adjacency_list;
        }

        public getAdjacentVertices(v: T) : T[] {
            return this.adjacency_list.get(v);
        }

        public getVertexDegree(v: T) : number {
            return this.getAdjacentVertices(v).length;
        }

        //properties

        public isComplete() : boolean {
            let n = this.vertices.length - 1;

            for (let v = 0; v < n + 1; v++) {
                if (this.getVertexDegree(this.vertices[v]) < n) {
                    return false;
                }
            }

            return true;
        }

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