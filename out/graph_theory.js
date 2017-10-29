var GraphTheory;
(function (GraphTheory) {
    let Utils;
    (function (Utils) {
        class AbstractList {
            constructor(...elements) {
                this.elements = elements;
            }
            peek() {
                return this.elements[this.elements.length - 1];
            }
            size() {
                return this.elements.length;
            }
            isEmpty() {
                return this.size() === 0;
            }
        }
        class Stack extends AbstractList {
            push(...elems) {
                this.elements.push(...elems);
            }
            pop() {
                return this.elements.pop();
            }
        }
        Utils.Stack = Stack;
        class Queue extends AbstractList {
            enqueue(...elems) {
                this.elements.unshift(...elems);
            }
            dequeue() {
                return this.elements.pop();
            }
        }
        Utils.Queue = Queue;
        class Vec2 {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
            add(v) {
                return new Vec2(this.x + v.x, this.y + v.y);
            }
            sub(v) {
                return new Vec2(this.x - v.x, this.y - v.y);
            }
            mul(k) {
                return new Vec2(this.x * k, this.y * k);
            }
            div(k) {
                return this.mul(1 / k);
            }
            map(f) {
                return new Vec2(f(this.x), f(this.y));
            }
            dot(v) {
                return this.x * v.x + this.y * v.y;
            }
            length() {
                return Math.sqrt(this.lengthSq());
            }
            lengthSq() {
                return this.dot(this);
            }
            normalize() {
                return this.div(this.length());
            }
            normalVector() {
                return new Vec2(-this.y, this.x).normalize();
            }
            angle() {
                return Math.atan2(this.y, this.x);
            }
            distTo(v) {
                return Math.sqrt(this.distToSq(v));
            }
            distToSq(v) {
                return this.sub(v).lengthSq();
            }
            dirTo(v) {
                return this.sub(v).normalize();
            }
            angleTo(v) {
                return this.angle() - v.angle();
            }
        }
        Utils.Vec2 = Vec2;
    })(Utils = GraphTheory.Utils || (GraphTheory.Utils = {}));
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    function isEdge(obj) {
        return 'from' in obj && 'to' in obj;
    }
    GraphTheory.isEdge = isEdge;
    function isJsonGraph(obj) {
        return 'vertices' in obj && 'edges' in obj;
    }
    GraphTheory.isJsonGraph = isJsonGraph;
    class AbstractGraph {
        constructor(vertices, edges, directed = false) {
            this.directed = directed;
            this.vertices = [];
            this.edges = [];
            this.adjacency_list = new Map();
            for (let v = 0; v < vertices.length; v++) {
                this.addVertex(vertices[v]);
            }
            for (let e = 0; e < edges.length; e++) {
                let edge;
                if (isEdge(edges[e])) {
                    edge = edges[e];
                    edge['cost'] = edge['cost'] !== undefined ? edge['cost'] : 1;
                }
                else {
                    edge = {
                        from: edges[e][0],
                        to: edges[e][1],
                        cost: edges[e][2] !== undefined ? edges[e][2] : 1
                    };
                }
                this.addEdge(edge);
            }
        }
        hasVertex(v) {
            return this.adjacency_list.has(v);
        }
        toEdge(from, to) {
            let e = this.directed ? [from, to] : [from, to].sort();
            return {
                from: e[0],
                to: e[1]
            };
        }
        hasEdge(edge) {
            if (!this.hasVertex(edge.from) || !this.hasVertex(edge.to)) {
                return false;
            }
            let e = this.toEdge(edge.from, edge.to);
            return this.getAdjacentVertices(e.from).indexOf(e.to) !== -1;
        }
        hasOppositeEdge(edge) {
            return this.hasEdge({ from: edge.to, to: edge.from });
        }
        hasNegativeCosts() {
            return this.edges.some((edge) => edge.cost < 0);
        }
        addVertex(v) {
            if (!this.hasVertex(v)) {
                this.vertices.push(v);
                this.adjacency_list.set(v, []);
            }
        }
        removeVertex(v) {
            this.adjacency_list.delete(v);
            this.vertices.splice(this.vertices.indexOf(v), 1);
        }
        addEdge(edge) {
            if (this.hasEdge(edge))
                return;
            if (edge['cost'] === undefined)
                edge['cost'] = 1;
            this.edges.push(edge);
            this.adjacency_list.get(edge.from).push(edge.to);
            if (!this.directed && edge.from !== edge.to) {
                this.adjacency_list.get(edge.to).push(edge.from);
            }
        }
        getEdgeIndex(edge) {
            if (this.hasEdge(edge)) {
                let e = this.toEdge(edge.from, edge.to);
                for (let i = 0; i < this.edges.length; i++) {
                    if (this.edges[i].from === e.from && this.edges[i].to === e.to) {
                        return i;
                    }
                }
            }
            return -1;
        }
        removeEdge(edge) {
            let idx = this.getEdgeIndex(edge);
            if (idx === -1)
                return;
            let e = this.toEdge(edge.from, edge.to);
            this.adjacency_list.get(e.from).splice(this.adjacency_list.get(e.from).indexOf(e.to), 1);
            this.edges.splice(idx, 1);
        }
        clearEdges() {
            this.edges = [];
            for (let v of this.vertices) {
                this.adjacency_list.set(v, []);
            }
        }
        clear() {
            this.edges = [];
            this.vertices = [];
            this.adjacency_list.clear();
        }
        getVertices() {
            return this.vertices;
        }
        getVertex(i) {
            return this.vertices[i];
        }
        getEdges() {
            return this.edges;
        }
        getEdge(i) {
            return this.edges[i];
        }
        getCost(u, v) {
            return this.getEdge(this.getEdgeIndex({
                from: u,
                to: v
            })).cost;
        }
        getAdjacencyList() {
            return this.adjacency_list;
        }
        getAdjacentVertices(v) {
            return this.adjacency_list.get(v);
        }
        getVertexDegree(v) {
            return this.getAdjacentVertices(v).length;
        }
        isDirected() {
            return this.directed;
        }
        isEmpty() {
            return this.vertices.length === 0;
        }
        toJsonGraph(include_adjacency_list = false) {
            let graph = {
                vertices: this.vertices,
                edges: this.edges
            };
            if (include_adjacency_list) {
                graph['adjacency_list'] = [...this.adjacency_list];
            }
            return graph;
        }
        toJSON(include_adjacency_list = false) {
            return JSON.stringify(this.toJsonGraph(include_adjacency_list));
        }
        static checkJsonGraph(json) {
            let graph = typeof json === 'string' ? JSON.parse(json) : json;
            if (!isJsonGraph(graph)) {
                throw new Error(`${JSON.stringify(graph)}\ndoesn't implement JsonGraph interface.`);
            }
            return graph;
        }
        static fromJSON(json) {
            return null;
        }
        ;
        drawEdge(ctx, vertex_radius, edge_color, from, to) {
            ctx.strokeStyle = edge_color;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            ctx.closePath();
        }
        draw(cnv, vertices_coords, options = {
                show_costs: false,
                vertex_radius: 10,
                vertex_color: 'lightblue',
                edge_width: 1,
                edge_color: 'black'
            }) {
            let ctx = cnv.getContext('2d');
            ctx.clearRect(0, 0, cnv.width, cnv.height);
            ctx.strokeStyle = options.edge_color;
            ctx.lineWidth = options.edge_width;
            for (let edge of this.getEdges()) {
                let origin = vertices_coords.get(edge.from), dst = vertices_coords.get(edge.to);
                this.drawEdge(ctx, options.vertex_radius, options.edge_color, origin, dst);
                ctx.closePath();
                if (options.show_costs) {
                    let n = origin.dirTo(dst).normalVector();
                    let sgn = Math.sign;
                    let text_pos = origin.add(dst.sub(origin).div(2));
                    text_pos = text_pos.add(n.mul(10));
                    ctx.beginPath();
                    ctx.textAlign = 'center';
                    ctx.strokeText(edge.cost.toString(), text_pos.x, text_pos.y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
            for (let [v, p] of vertices_coords) {
                ctx.beginPath();
                ctx.fillStyle = options.vertex_color;
                ctx.arc(p.x, p.y, options.vertex_radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.textAlign = 'center';
                ctx.fillStyle = 'black';
                ctx.fillText(v.toString(), p.x, p.y + 3, options.vertex_radius);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
    GraphTheory.AbstractGraph = AbstractGraph;
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    class Graph extends GraphTheory.AbstractGraph {
        constructor(vertices, edges) {
            super(vertices, edges);
        }
        clone() {
            return new Graph(this.vertices.slice(), this.edges.slice());
        }
        static fromJSON(json) {
            let graph = Graph.checkJsonGraph(json);
            return new Graph(graph.vertices, graph.edges);
        }
    }
    GraphTheory.Graph = Graph;
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    class DirectedGraph extends GraphTheory.AbstractGraph {
        constructor(vertices, arcs) {
            super(vertices, arcs, true);
        }
        isArcUndirected(arc) {
            return this.hasEdge(arc) && this.hasOppositeEdge(arc);
        }
        static fromUndirected(graph) {
            let directed = new DirectedGraph(graph.getVertices(), graph.getEdges());
            for (let edge of graph.getEdges()) {
                directed.addEdge({ from: edge.to, to: edge.from, cost: edge.cost });
            }
            return directed;
        }
        static fromJSON(json) {
            let graph = GraphTheory.Graph.checkJsonGraph(json);
            return new DirectedGraph(json.vertices, json.edges);
        }
        clone() {
            return new DirectedGraph(this.vertices.slice(), this.edges.slice());
        }
        drawEdge(ctx, vertex_radius, edge_color, from, to) {
            let a = Math.atan2(to.y - from.y, to.x - from.x);
            let d = { x: Math.cos(a), y: Math.sin(a) };
            let p = { x: to.x - vertex_radius * d.x, y: to.y - vertex_radius * d.y };
            let b = Math.PI / 1.2;
            let u = { x: Math.cos(a + b), y: Math.sin(a + b) };
            let v = { x: Math.cos(a - b), y: Math.sin(a - b) };
            super.drawEdge(ctx, vertex_radius, edge_color, from, to);
            ctx.fillStyle = edge_color;
            ctx.beginPath();
            ctx.moveTo(p.x + vertex_radius * u.x, p.y + vertex_radius * u.y);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo(p.x + vertex_radius * v.x, p.y + vertex_radius * v.y);
            ctx.fill();
            ctx.closePath();
        }
    }
    GraphTheory.DirectedGraph = DirectedGraph;
})(GraphTheory || (GraphTheory = {}));
var PlayGround;
(function (PlayGround_1) {
    var GT = GraphTheory;
    var Vec2 = GT.Utils.Vec2;
    class PlayGround {
        constructor(cnv, directed = false) {
            this.cnv = cnv;
            this.vertex_radius = 10;
            this.needs_redraw = true;
            this.show_costs = true;
            this.graph = directed ? new GT.DirectedGraph([], []) : new GT.Graph([], []);
            this.vertices_coords = new Map();
            this.mouse_drag = { origin: undefined, dest: undefined };
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
        overlappingVertex(a, b) {
            return (Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)) <= Math.pow(this.vertex_radius, 2);
        }
        overlappingEdge(p, edge, radius = 4) {
            if (edge.from.sub(p).dot(p.sub(edge.to)) < 0)
                return false;
            let edge_dir = edge.from.dirTo(edge.to);
            let proj = edge.from.add(edge_dir.mul(p.sub(edge.from).dot(edge_dir)));
            return proj.distToSq(p) <= Math.pow(radius, 2);
        }
        checkEdgeMouseOver(p, cb, radius = 4) {
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
        onMouseDown(e) {
            for (let [v, p] of this.vertices_coords) {
                if (this.overlappingVertex(p, new Vec2(e.clientX, e.clientY))) {
                    this.mouse_drag.origin = v;
                }
            }
        }
        onMouseMove(e) {
            if (this.mouse_drag.origin !== undefined) {
                this.draw();
                this.ctx.beginPath();
                let p = this.vertices_coords.get(this.mouse_drag.origin);
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (this.hovering_vertex !== undefined) {
                this.vertices_coords.set(this.hovering_vertex, new Vec2(e.clientX, e.clientY));
                this.draw();
            }
            else {
                document.body.style.cursor = 'default';
                this.hovering_edge = undefined;
                this.checkEdgeMouseOver(new Vec2(e.clientX, e.clientY), (edge, idx) => {
                    document.body.style.cursor = 'pointer';
                    this.hovering_edge = idx;
                });
            }
        }
        onMouseUp(e) {
            if (this.hovering_vertex !== undefined) {
                document.body.style.cursor = 'default';
                this.hovering_vertex = undefined;
            }
            else if (this.hovering_edge !== undefined) {
                let edges = [this.hovering_edge];
                let top_edge = this.graph.getEdge(this.hovering_edge);
                if (this.graph.isDirected() && this.graph.hasOppositeEdge(top_edge)) {
                    edges.push(this.graph.getEdgeIndex({ from: top_edge.to, to: top_edge.from }));
                }
                for (let idx of edges) {
                    let edge = this.graph.getEdge(idx);
                    let def = edge.cost !== undefined ? edge.cost.toString() : '1';
                    let new_cost = prompt('Set cost of [' + edge.from + ' -> ' + edge.to + ']', def);
                    if (new_cost === null)
                        new_cost = def;
                    edge.cost = Number(new_cost);
                }
            }
            else if (this.mouse_drag.origin === undefined) {
                let v = this.graph.getVertices().length;
                this.vertices_coords.set(v, new Vec2(e.clientX, e.clientY));
                this.addVertex(v);
            }
            else {
                for (let [v, p] of this.vertices_coords) {
                    if (this.overlappingVertex(p, new Vec2(e.clientX, e.clientY))) {
                        this.mouse_drag.dest = v;
                        if (v !== this.mouse_drag.origin) {
                            this.addEdge(this.mouse_drag.origin, this.mouse_drag.dest);
                        }
                        else {
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
        addVertex(v) {
            this.graph.addVertex(v);
        }
        addEdge(from, to) {
            this.graph.addEdge({ from: from, to: to });
        }
        draw() {
            this.graph.draw(this.cnv, this.vertices_coords, {
                show_costs: true,
                vertex_color: 'lightgreen',
                vertex_radius: this.vertex_radius,
                edge_color: 'black',
                edge_width: 1
            });
        }
    }
    PlayGround_1.PlayGround = PlayGround;
})(PlayGround || (PlayGround = {}));
var GraphTheory;
(function (GraphTheory) {
    let Algorithms;
    (function (Algorithms) {
        let CONNECTED_COMPONENT_METHOD;
        (function (CONNECTED_COMPONENT_METHOD) {
            CONNECTED_COMPONENT_METHOD[CONNECTED_COMPONENT_METHOD["BREADH_FIRST_SEARCH"] = 0] = "BREADH_FIRST_SEARCH";
            CONNECTED_COMPONENT_METHOD[CONNECTED_COMPONENT_METHOD["DEPTH_FIRST_SEARCH_ITERATIVE"] = 1] = "DEPTH_FIRST_SEARCH_ITERATIVE";
            CONNECTED_COMPONENT_METHOD[CONNECTED_COMPONENT_METHOD["DEPTH_FIRST_SEARCH_RECURSIVE"] = 2] = "DEPTH_FIRST_SEARCH_RECURSIVE";
        })(CONNECTED_COMPONENT_METHOD = Algorithms.CONNECTED_COMPONENT_METHOD || (Algorithms.CONNECTED_COMPONENT_METHOD = {}));
        function getConnectedComponent(g, initial_vertex, label_ordering, method = CONNECTED_COMPONENT_METHOD.BREADH_FIRST_SEARCH) {
            switch (method) {
                case CONNECTED_COMPONENT_METHOD.BREADH_FIRST_SEARCH:
                    return breadthFirstSearch(g, initial_vertex, label_ordering);
                case CONNECTED_COMPONENT_METHOD.DEPTH_FIRST_SEARCH_ITERATIVE:
                    return iterativeDepthFirstSearch(g, initial_vertex, label_ordering);
                default:
                    return recursiveDepthFirstSearch(g, initial_vertex, label_ordering);
            }
        }
        Algorithms.getConnectedComponent = getConnectedComponent;
        function breadthFirstSearch(g, initial_vertex, label_ordering) {
            let visited_nodes = new Map();
            let queue = new GraphTheory.Utils.Queue(initial_vertex);
            let order = [];
            while (!queue.isEmpty()) {
                let j = queue.dequeue();
                let adj_nodes = g.getAdjacentVertices(j).sort(label_ordering);
                for (let i = 0; i < adj_nodes.length; i++) {
                    let k = adj_nodes[i];
                    if (!visited_nodes.has(k)) {
                        visited_nodes.set(k, true);
                        queue.enqueue(k);
                    }
                }
                visited_nodes.set(j, true);
                order.push(j);
            }
            return order;
        }
        Algorithms.breadthFirstSearch = breadthFirstSearch;
        let DFS_METHOD;
        (function (DFS_METHOD) {
            DFS_METHOD[DFS_METHOD["ITERATIVE"] = 0] = "ITERATIVE";
            DFS_METHOD[DFS_METHOD["RECURSIVE"] = 1] = "RECURSIVE";
        })(DFS_METHOD = Algorithms.DFS_METHOD || (Algorithms.DFS_METHOD = {}));
        function depthFirstSearch(g, initial_vertex, label_ordering, method = DFS_METHOD.ITERATIVE) {
            if (method === DFS_METHOD.ITERATIVE) {
                return iterativeDepthFirstSearch(g, initial_vertex, label_ordering);
            }
            return recursiveDepthFirstSearch(g, initial_vertex, label_ordering);
        }
        Algorithms.depthFirstSearch = depthFirstSearch;
        function iterativeDepthFirstSearch(g, initial_vertex, label_ordering) {
            let visited_nodes = new Map();
            let stack = new GraphTheory.Utils.Stack(initial_vertex);
            let order = [];
            while (!stack.isEmpty()) {
                let v = stack.pop();
                let adj_nodes = g.getAdjacentVertices(v).sort(label_ordering);
                if (!visited_nodes.has(v)) {
                    visited_nodes.set(v, true);
                    order.push(v);
                    for (let w of adj_nodes) {
                        stack.push(w);
                    }
                }
            }
            return order;
        }
        function recursiveDepthFirstSearch(g, initial_vertex, label_ordering) {
            let visited_nodes = new Map();
            let order = [];
            let DFS = (g, v) => {
                visited_nodes.set(v, true);
                order.push(v);
                let adj_nodes = g.getAdjacentVertices(v).sort(label_ordering);
                for (let w of adj_nodes) {
                    if (!visited_nodes.has(w)) {
                        DFS(g, w);
                    }
                }
            };
            DFS(g, initial_vertex);
            return order;
        }
        let MINIMUM_SPANNING_TREE_METHOD;
        (function (MINIMUM_SPANNING_TREE_METHOD) {
            MINIMUM_SPANNING_TREE_METHOD[MINIMUM_SPANNING_TREE_METHOD["PRIM"] = 0] = "PRIM";
        })(MINIMUM_SPANNING_TREE_METHOD = Algorithms.MINIMUM_SPANNING_TREE_METHOD || (Algorithms.MINIMUM_SPANNING_TREE_METHOD = {}));
        function getMinimumSpanningTree(g, initial_vertex, method = MINIMUM_SPANNING_TREE_METHOD.PRIM) {
            let vertices = [];
        }
        Algorithms.getMinimumSpanningTree = getMinimumSpanningTree;
        function getComplementaryGraph(g) {
            let edges = [];
            let n = g.getVertices().length;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i !== j && !g.hasEdge({ from: g.getVertex(i), to: g.getVertex(j) })) {
                        edges.push([g.getVertex(i), g.getVertex(j)]);
                    }
                }
            }
            if (g.isDirected()) {
                return new GraphTheory.DirectedGraph(g.getVertices().slice(), edges);
            }
            else {
                return new GraphTheory.Graph(g.getVertices().slice(), edges);
            }
        }
        Algorithms.getComplementaryGraph = getComplementaryGraph;
        function isComplete(g) {
            let n = g.getVertices().length - 1;
            for (let v = 0; v < n + 1; v++) {
                if (g.getVertexDegree(g.getVertex(v)) < n) {
                    return false;
                }
            }
            return true;
        }
        Algorithms.isComplete = isComplete;
        let SHORTEST_PATH_METHOD;
        (function (SHORTEST_PATH_METHOD) {
            SHORTEST_PATH_METHOD[SHORTEST_PATH_METHOD["DIJKSTRA"] = 0] = "DIJKSTRA";
            SHORTEST_PATH_METHOD[SHORTEST_PATH_METHOD["BELLMAN_FORD"] = 1] = "BELLMAN_FORD";
            SHORTEST_PATH_METHOD[SHORTEST_PATH_METHOD["AUTO"] = 2] = "AUTO";
        })(SHORTEST_PATH_METHOD = Algorithms.SHORTEST_PATH_METHOD || (Algorithms.SHORTEST_PATH_METHOD = {}));
        function getShortestPaths(g, initial_vertex, method = SHORTEST_PATH_METHOD.AUTO) {
            switch (method) {
                case SHORTEST_PATH_METHOD.DIJKSTRA:
                    return dijkstra(g, initial_vertex);
                case SHORTEST_PATH_METHOD.BELLMAN_FORD:
                    return bellman_ford(g, initial_vertex);
                case SHORTEST_PATH_METHOD.AUTO:
                    let method = g.hasNegativeCosts() ?
                        SHORTEST_PATH_METHOD.BELLMAN_FORD : SHORTEST_PATH_METHOD.DIJKSTRA;
                    return getShortestPaths(g, initial_vertex, method);
            }
            return null;
        }
        Algorithms.getShortestPaths = getShortestPaths;
        function dijkstra(g, initial_vertex) {
            let dist_map = new Map();
            for (let v of g.getVertices()) {
                dist_map.set(v, { pred: null, cost: Infinity });
            }
            dist_map.set(initial_vertex, { pred: null, cost: 0 });
            let Q = g.getVertices().slice();
            while (Q.length !== 0) {
                let min = Infinity, idx = -1;
                for (let i = 0; i < Q.length; i++) {
                    let v = Q[i];
                    if (dist_map.get(v).cost < min) {
                        min = dist_map.get(v).cost;
                        idx = i;
                    }
                }
                let s1 = Q[idx];
                let neighbors = g.getAdjacentVertices(s1);
                if (neighbors.length === 0) {
                    return dist_map;
                }
                for (let s2 of neighbors) {
                    let cost = g.getCost(s1, s2);
                    let dist = dist_map.get(s1).cost + cost;
                    if (cost < 0)
                        throw new RangeError(`Cost of edge [${s1} -> ${s2}] is negative (${cost}) ` +
                            'use SHORTEST_PATH_METHOD.BELLMAN_FORD instead of DIJKSTRA.');
                    let dist2 = dist_map.get(s2).cost;
                    if (dist2 > dist) {
                        dist_map.set(s2, { pred: s1, cost: dist });
                    }
                }
                Q.splice(idx, 1);
            }
            return dist_map;
        }
        function bellman_ford(g, initial_vertex) {
            throw new Error('Bellman-Ford not yet implemented');
        }
    })(Algorithms = GraphTheory.Algorithms || (GraphTheory.Algorithms = {}));
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    class AbstractTree extends GraphTheory.AbstractGraph {
        constructor() {
            super([], []);
        }
        addEdge(edge) {
            super.addVertex(edge.from);
            super.addVertex(edge.to);
        }
        addVertex(v) {
            throw new Error(`Cannot add an unconnected vertex to a Tree, call addEdge() instead, 
                it will create the necessary vertices`);
        }
    }
})(GraphTheory || (GraphTheory = {}));
//# sourceMappingURL=graph_theory.js.map