namespace GraphTheory {

    export namespace Renderer {

        import Vec2 = GraphTheory.Utils.Vec2;

        export enum VertexShape {
            CIRCLE,
            ELLIPSE,
            SQUARE,
            RECTANGLE
        }

        //returns whether labels should be squeezed to profile.vertex_size or not
        export type vertexRenderer = (ctx: CanvasRenderingContext2D, profile: RendererProfile, label: string, pos: Vec2) => boolean;

        export interface RendererProfile {
            show_costs?: boolean,
            vertex_color?: string,
            vertex_shape?: VertexShape,
            vertex_size?: number,
            label_font?: string,
            edge_color?: string,
            edge_width?: number
        }

        //default RendererProfile objects
        export let profiles = {
            classic: {
                show_costs: true,
                vertex_color: 'lightgreen',
                vertex_shape: VertexShape.CIRCLE,
                vertex_size: 10,
                edge_color: 'black',
                edge_width: 1,
                label_font: '12px Georiga, sans-serif'
            }
        };

        export class Renderer<T> {

            private ctx: CanvasRenderingContext2D;

            constructor(
                private graph: AbstractGraph<T>,
                private cnv: HTMLCanvasElement,
                private profile?: RendererProfile
            ) {
                this.ctx = cnv.getContext('2d');
                this.profile = GraphTheory._Internal._default(profile, profiles.classic);
            }

            private drawEdge(from: Vec2, to: Vec2) : void {
                if (this.graph.isDirected()) {
                    this.drawEdgeDirected(from, to);
                } else {
                    this.drawEdgeUndirected(from, to);
                }
            }

            private drawEdgeUndirected(from: Vec2, to: Vec2) : void {
                this.ctx.strokeStyle = this.profile.edge_color;
                this.ctx.beginPath();
                this.ctx.moveTo(from.x, from.y);
                this.ctx.lineTo(to.x, to.y);
                this.ctx.stroke();
                this.ctx.closePath();
            }

            private drawEdgeDirected(from: Vec2, to: Vec2) : void {
                //angle between the two vertices
                let a = to.angleTo(from);
                //direction vector
                let d = new Vec2(Math.cos(a), Math.sin(a));
                //intersection between the line following the direction vector
                //and the circle representing the 'to' vertex
                let p = new Vec2(to.x - this.profile.vertex_size * d.x, to.y - this.profile.vertex_size * d.y);

                //controls the shape of the arrow
                let b = Math.PI / 1.2;
                //bottom right
                let u = new Vec2(Math.cos(a + b), Math.sin(a + b));
                //bottom left
                let v = new Vec2(Math.cos(a - b),  Math.sin(a - b));

                //draw line
                this.drawEdgeUndirected(from, to);

                //draw triangle
                this.ctx.fillStyle = this.profile.edge_color;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x + this.profile.vertex_size * u.x, p.y + this.profile.vertex_size * u.y);
                this.ctx.lineTo(p.x, p.y);
                this.ctx.lineTo(p.x + this.profile.vertex_size * v.x, p.y + this.profile.vertex_size * v.y);
                this.ctx.fill();
                this.ctx.closePath();
            }

            private drawVertex(label: string, pos: Vec2) : void {

                let vr: vertexRenderer;

                switch (this.profile.vertex_shape) {
                    case VertexShape.CIRCLE:
                        vr = circleVertexRenderer;
                        break;

                    case VertexShape.SQUARE:
                        vr = squareVertexRenderer;
                        break;

                    case VertexShape.RECTANGLE:
                        vr = rectangleVertexRenderer;
                        break;

                    default:
                        throw new Error(`${this.profile.vertex_shape} not yet implemented`);
                }
                
                this.drawLabel(label, pos, vr(this.ctx, this.profile, label, pos));
            }

            private drawLabel(label: string, pos: Vec2, squeeze_label: boolean = true) : void {
                this.ctx.beginPath();
                this.ctx.font = this.profile.label_font;
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(label, pos.x, pos.y + 3, squeeze_label ? this.profile.vertex_size : undefined);
                this.ctx.fill();
                this.ctx.closePath();
            }

            public draw(vertices_coords: Map<T, Vec2>) : void {
                    
                this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
                this.ctx.strokeStyle = this.profile.edge_color;
                this.ctx.lineWidth = this.profile.edge_width;

                //draw edges
                for (let edge of this.graph.getEdges()) {
                    let origin = vertices_coords.get(edge.from),
                        dst = vertices_coords.get(edge.to);
                    this.drawEdge(origin, dst);
                    this.ctx.closePath();

                    if (this.profile.show_costs) {

                        //get a normal vector of the line directed by the edge
                        let n = origin.dirTo(dst).normalVector();
                        let sgn = Math.sign;
                        let text_pos = origin.add(dst.sub(origin).div(2));

                        /* show normal vector
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = 'black';
                        this.ctx.moveTo(text_pos.x, text_pos.y);
                        let tp = text_pos.sub(n.times(50));
                        this.ctx.lineTo(tp.x, tp.y);
                        this.ctx.stroke();
                        this.ctx.closePath();
                        */

                        text_pos = text_pos.add(n.mul(10));

                        this.ctx.beginPath();
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(edge.cost.toString(), text_pos.x, text_pos.y);
                        this.ctx.fill();
                        this.ctx.closePath();
                    }
                }
                //draw vertices
                for (let [v, p] of vertices_coords) {
                    this.drawVertex(v.toString(), p);
                }
            }

            public setProfile(profile: RendererProfile) : void {
                this.profile = profile;
            }
        } 

        const circleVertexRenderer: vertexRenderer = (
            ctx: CanvasRenderingContext2D,
            profile: RendererProfile,
            label: string,
            pos: Vec2
        ) : boolean => {
            ctx.beginPath();
            ctx.fillStyle = profile.vertex_color;
            ctx.arc(pos.x, pos.y, profile.vertex_size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            return true;
        };

        const squareVertexRenderer: vertexRenderer = (
            ctx: CanvasRenderingContext2D,
            profile: RendererProfile,
            label: string,
            pos: Vec2
        ) : boolean => {
            ctx.beginPath();
            ctx.fillStyle = profile.vertex_color;
            let s = profile.vertex_size;
            ctx.fillRect(pos.x - s, pos.y - s, 2 * s, 2 * s);
            ctx.fill();
            ctx.rect(pos.x - s, pos.y - s, 2 * s, 2 * s);
            ctx.stroke();
            ctx.closePath();

            return true;
        };

        const rectangleVertexRenderer: vertexRenderer = (
            ctx: CanvasRenderingContext2D,
            profile: RendererProfile,
            label: string,
            pos: Vec2
        ) : boolean => {
            ctx.beginPath();
            ctx.fillStyle = profile.vertex_color;
            let s = profile.vertex_size;
            let width = ctx.measureText(label).width + 6;
            width = width < 2 * s ? 2 * s : width;
            ctx.fillRect(pos.x - width / 2, pos.y - s, width, 2 * s);
            ctx.fill();
            ctx.rect(pos.x - width / 2, pos.y - s, width, 2 * s);
            ctx.stroke();
            ctx.closePath();

            return false;
        };
    }
}