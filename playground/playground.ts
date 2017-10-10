/// <reference path="../src/Graph.ts" />
/// <reference path="../src/DirectedGraph.ts" />

namespace PlayGround {

import GT = GraphTheory;

    interface Point {
        x: number,
        y: number
    }

    export class PlayGround {

        private graph: GT.Graph<number>;
        private vertices_coords: Map<number, Point>;
        private ctx: CanvasRenderingContext2D;
        private vertex_radius = 10;

        constructor (private cnv: HTMLCanvasElement, directed = false) {

            this.graph = directed ? new GT.DirectedGraph<number>([], []) : new GT.Graph<number>([], []);
            this.vertices_coords = new Map<number, Point>();

            this.ctx = cnv.getContext('2d');
            this.draw();

            let rad_sq = this.vertex_radius ** 2;

            let overlapping = (a: Point, b: Point) : boolean => {
                return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) <= rad_sq;
            };

            let origin: number;

            let mouse_move_listener = (e: MouseEvent) => {
                if (origin !== undefined) {
                    this.draw();
                    this.ctx.beginPath();
                    let p = this.vertices_coords.get(origin);
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(e.clientX, e.clientY);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            };

            cnv.addEventListener('mousedown', e => {

                for (let [v, p] of this.vertices_coords) {
                    if (overlapping(p, {x: e.clientX, y: e.clientY})) {
                        origin = v;
                    }
                }

                cnv.addEventListener('mousemove', mouse_move_listener);
            });

            cnv.addEventListener('mouseup', (e: MouseEvent) => {
                if (origin === undefined) {
                    let v = this.graph.getVertices().length;
                    this.vertices_coords.set(v, {x: e.clientX, y: e.clientY});
                    this.addVertex(v);
                } else {
                    for (let [v, p] of this.vertices_coords) {
                        if (v !== origin && overlapping(p, {x: e.clientX, y: e.clientY})) {
                            let dst = v;
                            this.addEdge(origin, dst);
                        }
                    }
                }

                this.draw();
                origin = undefined;
                cnv.removeEventListener('mousemove', mouse_move_listener);
            });
        }

        public addVertex(v: number) : void {
            this.graph.addVertex(v);
        }

        public addEdge(from: number, to: number) : void {
            this.graph.addEdge({from: from, to: to});
        }

        public draw() : void {
            this.graph.draw(this.cnv, this.vertices_coords, {
                vertex_color: 'lightgreen',
                vertex_radius: this.vertex_radius,
                edge_color: 'black',
                edge_width: 1
            });
        }
    }
}