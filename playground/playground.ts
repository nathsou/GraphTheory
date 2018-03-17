
/// <reference path="../src/Graph.ts" />
/// <reference path="../src/DirectedGraph.ts" />
/// <reference path="../src/Utils.ts" />

namespace GraphTheory {

import GT = GraphTheory;
import GR = GT.Renderer;
import Vec2 = GT.Utils.Vec2;

    export interface JsonPlayGround<T> {
        graph: GT.JsonGraph<T>,
        vertices_coords: [T, {x: number, y: number}][]
    }

    /**
     * Checks if a given object implements the JsonPlayGround<T> interface
     * 
     * @export
     * @template T 
     * @param {*} obj 
     * @returns {obj is JsonPlayGround<T>} 
     */
    export function isJsonPlayGround<T>(obj: any) : obj is JsonPlayGround<T> {
        return 'graph' in obj && 'vertices_coords' in obj && GT.isJsonGraph(obj.graph);
    }

    export class PlayGround<T> {

        private graph: GT.AbstractGraph<T>;
        private vertices_coords: Map<T, Vec2>;
        private renderer: GR.Renderer<T>;
        private ctx: CanvasRenderingContext2D;
        private vertex_radius = 30;
        private mouse_drag: {origin: T, dest: T};
        private hovering_edge: number;
        private prev_label: T;
        private next_label: (last: T) => T;
        private moving_vertex: T;
        private needs_redraw = true;
        private show_costs = true;
        /**
         * Prevents addVertex() to be called if set to true
         * 
         * @private
         * 
         * @memberOf PlayGround
         */
        private locked = false;

        constructor (private cnv: HTMLCanvasElement, next_label: GT.Utils.labels.LabelProvider<T>, directed = false) {

            this.prev_label = null;
            this.next_label = next_label;

            this.graph = directed ? new GT.DirectedGraph<T>([], []) : new GT.Graph<T>([], []);
            this.vertices_coords = new Map<T, Vec2>();
            this.mouse_drag = {origin: undefined, dest: undefined};

            if (next_label == null) {
                this.locked = true;
            }

            this.renderer = new GT.Renderer.Renderer<T>(this.graph, this.cnv);

            this.ctx = cnv.getContext('2d');

            this.cnv.addEventListener('mousedown', e => {
                this.onMouseDown(new Vec2(e.clientX, e.clientY));
            });

            this.cnv.addEventListener('mouseup', e => {
                this.onMouseUp(new Vec2(e.clientX, e.clientY));
            });

            this.cnv.addEventListener('mousemove', e => {
                this.onMouseMove(new Vec2(e.clientX, e.clientY));
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

        public resize(width: number, height: number) : void {
            this.cnv.width = width;
            this.cnv.height = height;
            this.draw();
        }

        /**
         * Toggles edges's cost visibility
         * 
         * @memberOf PlayGround
         */
        public toggleCostsVisibility() : void {
            this.show_costs = !this.show_costs;
            this.needs_redraw = true;
        }

        private overlappingVertex(a: Vec2, b: Vec2) : boolean {
            return a.distToSq(b) <= this.vertex_radius ** 2;
        }

        //check if a point is over an edge
        private overlappingEdge(p: Vec2, edge: {from: Vec2, to: Vec2}, radius = 4) : boolean {
            if (edge.from.sub(p).dot(p.sub(edge.to)) < 0) return false;
            let edge_dir = edge.from.dirTo(edge.to)

            //project p onto the edge and compute the distance between p and the projection
            let proj = edge.from.add(edge_dir.mul(p.sub(edge.from).dot(edge_dir)));

            return proj.distToSq(p) <= radius ** 2;
        } 

        private checkVertexMouseOver(p: Vec2, cb: (vertex: T, idx: number) => void) : void {
            let i = 0;
            for (let [vert, coords] of this.vertices_coords) {
                if (this.overlappingVertex(coords, p)) {
                    cb.call(this, vert, i);
                }
                i++;
            }
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

        private onMouseDown(p: Vec2) : void {
            if (this.mouse_drag.origin === undefined) {
                this.checkVertexMouseOver(p, (vert: T, idx: number) => {
                    this.mouse_drag.origin = vert;
                });
            }  
        }

        private onMouseMove(p: Vec2) : void {

            let hovering_vertex = false;

            this.checkVertexMouseOver(p, (v: T) => {
                hovering_vertex = true;
                this.hovering_edge = undefined;
            });

            if (this.mouse_drag.origin !== undefined) {
                this.draw();
                this.ctx.beginPath();
                let coords = this.vertices_coords.get(this.mouse_drag.origin);
                this.ctx.moveTo(coords.x, coords.y);
                this.ctx.lineTo(p.x, p.y);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.moving_vertex !== undefined) {
                this.vertices_coords.set(this.moving_vertex, p);
                this.draw();
            } else {
                document.body.style.cursor = 'default';
                this.hovering_edge = undefined;
                if (!hovering_vertex) {
                    this.checkEdgeMouseOver(p, (edge, idx) => {
                        document.body.style.cursor = 'pointer';
                        this.hovering_edge = idx;
                    });
                }
            }
        }

        private onMouseUp(p: Vec2) : void {
            if (this.moving_vertex !== undefined) { //stop moving vertex
                document.body.style.cursor = 'default';
                this.moving_vertex = undefined;
            } else if (this.hovering_edge !== undefined) { //change cost
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
            } else if (this.mouse_drag.origin === undefined) { //add new vertex
                let v = this.addVertex();
                this.vertices_coords.set(v, p);
            } else if (this.mouse_drag.origin !== undefined) {
                this.checkVertexMouseOver(p, (vert: T, idx: number) => {
                    this.mouse_drag.dest = vert;
                    if (vert !== this.mouse_drag.origin) { //add new edge
                        this.addEdge(this.mouse_drag.origin, this.mouse_drag.dest);
                    } else { //move vertex
                        this.moving_vertex = vert;
                        document.body.style.cursor = 'move';
                    }
                });
            }

            this.needs_redraw = true;
            this.mouse_drag.origin = undefined;
            this.mouse_drag.dest = undefined;
        }

        public addVertex() : T {
            if (this.locked) {
                throw new Error(`this PlayGround is locked, cannot add any vertex, call unlock() to do so`);
            }
            this.prev_label = this.next_label(this.prev_label);
            this.graph.addVertex(this.prev_label);
            return this.prev_label;
        }

        public addEdge(from: T, to: T) : void {
            this.graph.addEdge({from: from, to: to});
        }

        public draw() : void {
            this.renderer.draw(this.vertices_coords);
        }

        public setProfile(profile: GR.RendererProfile) {
            this.renderer.setProfile(profile);
        }

        public setGraph(graph: AbstractGraph<T>) : void {
            this.graph = graph;
            this.renderer = new GT.Renderer.Renderer<T>(graph, this.cnv);
        }

        public getGraph() : AbstractGraph<T> {
            return this.graph;
        }

        public lock() : void {
            this.locked = true;
        }

        public isLocked() : boolean {
            return this.locked;
        }

        public unlock(next_label: GT.Utils.labels.LabelProvider<T>) : void {
            this.next_label = next_label;
            this.locked = false;
            const vertices = this.graph.getVertices();
            this.prev_label = vertices[vertices.length - 1];
        }

        public setVerticesCoordinates(vertices_coords: Map<T, Vec2>) : void {
            this.vertices_coords = vertices_coords;
        }

        public toJsonGraph() : JsonPlayGround<T> {
            return {
                graph: this.graph.toJsonGraph(),
                vertices_coords: [...this.vertices_coords]
            }
        }

        public toJSON() : string {
            return JSON.stringify(this.toJsonGraph());
        }

        static fromJSON<T>(cnv: HTMLCanvasElement, json: JsonPlayGround<T> | string) : PlayGround<T> {
            let jpg: JsonPlayGround<T> = typeof json === 'string' ? JSON.parse(json) : json;
            
            let pg = new PlayGround<T>(cnv, null, jpg.graph.directed);
            pg.setGraph(jpg.graph.directed ? DirectedGraph.fromJSON(jpg.graph) : Graph.fromJSON(jpg.graph));
            let map: [T, Vec2][] = [];

            for (let v of jpg.vertices_coords) {
                map.push([v[0], new Vec2(v[1].x, v[1].y)])
            }

            pg.setVerticesCoordinates(new Map<T, Vec2>(map));

            return pg;
        }
    }
}
