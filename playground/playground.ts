
/// <reference path="../src/Graph.ts" />
/// <reference path="../src/DirectedGraph.ts" />
/// <reference path="../src/Utils.ts" />

namespace PlayGround {

import GT = GraphTheory;
import Vec2 = GT.Utils.Vec2;

    export class PlayGround {

        private graph: GT.Graph<number>;
        private vertices_coords: Map<number, Vec2>;
        private ctx: CanvasRenderingContext2D;
        private vertex_radius = 10;
        private mouse_drag: {origin: number, dest: number};
        private hovering_edge: number;
        private hovering_vertex: number;
        private needs_redraw = true;
        private show_costs = true;

        constructor (private cnv: HTMLCanvasElement, directed = false) {

            this.graph = directed ? new GT.DirectedGraph<number>([], []) : new GT.Graph<number>([], []);
            this.vertices_coords = new Map<number, Vec2>();
            this.mouse_drag = {origin: undefined, dest: undefined};

            this.ctx = cnv.getContext('2d');

            this.cnv.addEventListener('mousedown', e => {
                this.onMouseDown(e);
            });

            this.cnv.addEventListener('mouseup', e => {
                this.onMouseUp(e);
            });

            this.cnv.addEventListener('mousemove', e => {
                this.onMouseMove(e);
            });

            let redraw = () => {
                if (this.needs_redraw) {
                    this.needs_redraw = false;
                    this.draw();
                }
                requestAnimationFrame(redraw);
            };

            redraw();
        }

        private overlappingVertex(a: Vec2, b: Vec2) : boolean {
            return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) <= this.vertex_radius ** 2;
        }

        //check if a point is over an edge
        private overlappingEdge(p: Vec2, edge: {from: Vec2, to: Vec2}, radius = 4) : boolean {

            if (edge.from.sub(p).dot(p.sub(edge.to)) < 0) return false;

            let edge_dir = edge.from.dirTo(edge.to)

            //project p onto the edge and compute the distance between p and the projection
            let proj = edge.from.add(edge_dir.mul(p.sub(edge.from).dot(edge_dir)));

            return proj.distToSq(p) <= radius ** 2;
        } 

        private checkEdgeMouseOver(p: Vec2, cb: (edge: {from: Vec2, to: Vec2}, idx: number) => void, radius = 4) : void {

            let i = 0;
            for (let edge of this.graph.getEdges()) {
                let ed = {
                    from: this.vertices_coords.get(edge.from),
                    to: this.vertices_coords.get(edge.to)
                };

                if (this.overlappingEdge(p, ed, radius)) {
                    cb.call(this, ed, i);
                }
                i++;
            }
        }

        private onMouseDown(e: MouseEvent) : void {

            for (let [v, p] of this.vertices_coords) {
                if (this.overlappingVertex(p, new Vec2(e.clientX, e.clientY))) {
                    this.mouse_drag.origin = v;
                }
            }
        }

        private onMouseMove(e: MouseEvent) : void {
            if (this.mouse_drag.origin !== undefined) {
                this.draw();
                this.ctx.beginPath();
                let p = this.vertices_coords.get(this.mouse_drag.origin);
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.hovering_vertex !== undefined) {
                this.vertices_coords.set(this.hovering_vertex, new Vec2(e.clientX, e.clientY));
                this.draw();
            } else {
                document.body.style.cursor = 'default';
                this.hovering_edge = undefined;
                this.checkEdgeMouseOver(new Vec2(e.clientX, e.clientY), (edge, idx) => {
                    document.body.style.cursor = 'pointer';
                    this.hovering_edge = idx;
                });
            }
        }

        private onMouseUp(e: MouseEvent) : void {
            if (this.hovering_vertex !== undefined) {
                document.body.style.cursor = 'default';
                this.hovering_vertex = undefined;
            } else if (this.hovering_edge !== undefined) {
                let edges = [this.hovering_edge];
                let top_edge = this.graph.getEdge(this.hovering_edge);

                //ask cost for both directions
                if (this.graph.isDirected() && this.graph.hasOppositeEdge(top_edge)) {
                    edges.push(this.graph.getEdgeIndex({from: top_edge.to, to: top_edge.from}))
                }

                for (let idx of edges) {
                    let edge = this.graph.getEdge(idx);
                    let def = edge.cost !== undefined ? edge.cost.toString() : '1';
                    let new_cost = prompt('Set cost of [' + edge.from + ' -> ' + edge.to + ']', def);
                    if (new_cost === null) new_cost = def; //cancel
                    edge.cost = Number(new_cost);
                }
            } else if (this.mouse_drag.origin === undefined) {
                let v = this.graph.getVertices().length;
                this.vertices_coords.set(v, new Vec2(e.clientX, e.clientY));
                this.addVertex(v);
            } else {
                for (let [v, p] of this.vertices_coords) {
                    if (this.overlappingVertex(p, new Vec2(e.clientX, e.clientY))) {
                        this.mouse_drag.dest = v;
                        if (v !== this.mouse_drag.origin) {
                            this.addEdge(this.mouse_drag.origin, this.mouse_drag.dest);
                        } else {
                            this.hovering_vertex = v;
                            document.body.style.cursor = 'move';
                        }
                    }
                }
            }

            this.needs_redraw = true;
            this.mouse_drag.origin = undefined;
            this.mouse_drag.dest = undefined;
        }

        public addVertex(v: number) : void {
            this.graph.addVertex(v);
        }

        public addEdge(from: number, to: number) : void {
            this.graph.addEdge({from: from, to: to});
        }

        public draw() : void {
            this.graph.draw(this.cnv, this.vertices_coords, {
                show_costs: true,
                vertex_color: 'lightgreen',
                vertex_radius: this.vertex_radius,
                edge_color: 'black',
                edge_width: 1
            });
        }
    }
}