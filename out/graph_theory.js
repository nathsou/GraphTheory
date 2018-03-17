var GraphTheory;
(function (GraphTheory) {
    let Utils;
    (function (Utils) {
        let labels;
        (function (labels) {
            labels.next_number = (last) => last === null ? 0 : last + 1;
            labels.next_number1 = (last) => last === null ? 1 : last + 1;
            labels.next_letter = (last) => {
                if (last === null)
                    return 'A';
                let code = last.charCodeAt(0), idx = (code - 64) % 26, letter = String.fromCharCode(65 + idx), nb = Number(last.substr(1));
                return letter + (idx === 0 ? nb + 1 : (nb === 0 ? '' : nb)).toString();
            };
            labels.next_lowercase_letter = (last) => labels.next_letter(last === null ? null : last.toUpperCase()).toLowerCase();
            function next_element(array) {
                return (last) => {
                    if (last === null)
                        return array[0];
                    return array[(array.indexOf(last) + 1) % array.length];
                };
            }
            labels.next_element = next_element;
        })(labels = Utils.labels || (Utils.labels = {}));
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
                return this.sub(v).angle();
            }
        }
        Utils.Vec2 = Vec2;
        function precedenceMapToPath(vertex, map) {
            let path = [];
            let v = vertex;
            while (map.get(v).pred !== null) {
                path.push(v);
                v = map.get(v).pred;
            }
            path.push(v);
            let cost = map.get(vertex).cost;
            return { cost: cost, path: cost !== Infinity ? path.reverse() : null };
        }
        Utils.precedenceMapToPath = precedenceMapToPath;
        function precedenceMapToPaths(map) {
            let paths = new Map();
            for (let v of map.keys()) {
                let cost = map.get(v).cost;
                paths.set(v, precedenceMapToPath(v, map));
            }
            return paths;
        }
        Utils.precedenceMapToPaths = precedenceMapToPaths;
    })(Utils = GraphTheory.Utils || (GraphTheory.Utils = {}));
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    function isEdge(obj) {
        return 'from' in obj && 'to' in obj;
    }
    GraphTheory.isEdge = isEdge;
    function isJsonGraph(obj) {
        return 'vertices' in obj && 'edges' in obj && 'directed' in obj;
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
        toEdge(from, to, cost) {
            let e = this.directed ? [from, to] : [from, to].sort();
            return {
                from: e[0],
                to: e[1],
                cost: cost !== undefined ? cost : 1
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
            let e = this.toEdge(edge.from, edge.to, edge['cost']);
            this.edges.push(e);
            this.adjacency_list.get(e.from).push(e.to);
            if (!this.directed && e.from !== e.to) {
                this.adjacency_list.get(e.to).push(e.from);
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
            if (i === -1)
                throw new RangeError(`Invalid edge index: ${i}`);
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
                edges: this.edges,
                directed: this.directed
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
    }
    GraphTheory.DirectedGraph = DirectedGraph;
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    var GT = GraphTheory;
    var Vec2 = GT.Utils.Vec2;
    function isJsonPlayGround(obj) {
        return 'graph' in obj && 'vertices_coords' in obj && GT.isJsonGraph(obj.graph);
    }
    GraphTheory.isJsonPlayGround = isJsonPlayGround;
    class PlayGround {
        constructor(cnv, next_label, directed = false) {
            this.cnv = cnv;
            this.vertex_radius = 30;
            this.needs_redraw = true;
            this.show_costs = true;
            this.locked = false;
            this.prev_label = null;
            this.next_label = next_label;
            this.graph = directed ? new GT.DirectedGraph([], []) : new GT.Graph([], []);
            this.vertices_coords = new Map();
            this.mouse_drag = { origin: undefined, dest: undefined };
            if (next_label == null) {
                this.locked = true;
            }
            this.renderer = new GT.Renderer.Renderer(this.graph, this.cnv);
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
        resize(width, height) {
            this.cnv.width = width;
            this.cnv.height = height;
            this.draw();
        }
        toggleCostsVisibility() {
            this.show_costs = !this.show_costs;
            this.needs_redraw = true;
        }
        overlappingVertex(a, b) {
            return a.distToSq(b) <= Math.pow(this.vertex_radius, 2);
        }
        overlappingEdge(p, edge, radius = 4) {
            if (edge.from.sub(p).dot(p.sub(edge.to)) < 0)
                return false;
            let edge_dir = edge.from.dirTo(edge.to);
            let proj = edge.from.add(edge_dir.mul(p.sub(edge.from).dot(edge_dir)));
            return proj.distToSq(p) <= Math.pow(radius, 2);
        }
        checkVertexMouseOver(p, cb) {
            let i = 0;
            for (let [vert, coords] of this.vertices_coords) {
                if (this.overlappingVertex(coords, p)) {
                    cb.call(this, vert, i);
                }
                i++;
            }
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
        onMouseDown(p) {
            if (this.mouse_drag.origin === undefined) {
                this.checkVertexMouseOver(p, (vert, idx) => {
                    this.mouse_drag.origin = vert;
                });
            }
        }
        onMouseMove(p) {
            let hovering_vertex = false;
            this.checkVertexMouseOver(p, (v) => {
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
            }
            else if (this.moving_vertex !== undefined) {
                this.vertices_coords.set(this.moving_vertex, p);
                this.draw();
            }
            else {
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
        onMouseUp(p) {
            if (this.moving_vertex !== undefined) {
                document.body.style.cursor = 'default';
                this.moving_vertex = undefined;
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
                let v = this.addVertex();
                this.vertices_coords.set(v, p);
            }
            else if (this.mouse_drag.origin !== undefined) {
                this.checkVertexMouseOver(p, (vert, idx) => {
                    this.mouse_drag.dest = vert;
                    if (vert !== this.mouse_drag.origin) {
                        this.addEdge(this.mouse_drag.origin, this.mouse_drag.dest);
                    }
                    else {
                        this.moving_vertex = vert;
                        document.body.style.cursor = 'move';
                    }
                });
            }
            this.needs_redraw = true;
            this.mouse_drag.origin = undefined;
            this.mouse_drag.dest = undefined;
        }
        addVertex() {
            if (this.locked) {
                throw new Error(`this PlayGround is locked, cannot add any vertex, call unlock() to do so`);
            }
            this.prev_label = this.next_label(this.prev_label);
            this.graph.addVertex(this.prev_label);
            return this.prev_label;
        }
        addEdge(from, to) {
            this.graph.addEdge({ from: from, to: to });
        }
        draw() {
            this.renderer.draw(this.vertices_coords);
        }
        setProfile(profile) {
            this.renderer.setProfile(profile);
        }
        setGraph(graph) {
            this.graph = graph;
            this.renderer = new GT.Renderer.Renderer(graph, this.cnv);
        }
        getGraph() {
            return this.graph;
        }
        lock() {
            this.locked = true;
        }
        isLocked() {
            return this.locked;
        }
        unlock(next_label) {
            this.next_label = next_label;
            this.locked = false;
            const vertices = this.graph.getVertices();
            this.prev_label = vertices[vertices.length - 1];
        }
        setVerticesCoordinates(vertices_coords) {
            this.vertices_coords = vertices_coords;
        }
        toJsonGraph() {
            return {
                graph: this.graph.toJsonGraph(),
                vertices_coords: [...this.vertices_coords]
            };
        }
        toJSON() {
            return JSON.stringify(this.toJsonGraph());
        }
        static fromJSON(cnv, json) {
            let jpg = typeof json === 'string' ? JSON.parse(json) : json;
            let pg = new PlayGround(cnv, null, jpg.graph.directed);
            pg.setGraph(jpg.graph.directed ? GraphTheory.DirectedGraph.fromJSON(jpg.graph) : GraphTheory.Graph.fromJSON(jpg.graph));
            let map = [];
            for (let v of jpg.vertices_coords) {
                map.push([v[0], new Vec2(v[1].x, v[1].y)]);
            }
            pg.setVerticesCoordinates(new Map(map));
            return pg;
        }
    }
    GraphTheory.PlayGround = PlayGround;
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    let _Internal;
    (function (_Internal) {
        function _default(obj, def) {
            let res = {};
            obj = obj == null ? {} : obj;
            for (let key of Object.keys(def)) {
                res[key] = obj.hasOwnProperty(key) ? obj[key] : def[key];
            }
            return res;
        }
        _Internal._default = _default;
    })(_Internal = GraphTheory._Internal || (GraphTheory._Internal = {}));
})(GraphTheory || (GraphTheory = {}));
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
                return recursiveDepthFirstSearch(g, initial_vertex, label_ordering);
            }
            return iterativeDepthFirstSearch(g, initial_vertex, label_ordering);
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
        function getShortestPaths(g, initial_vertex, method = SHORTEST_PATH_METHOD.AUTO, end_vertex) {
            let prec_map;
            switch (method) {
                case SHORTEST_PATH_METHOD.DIJKSTRA:
                    prec_map = dijkstra(g, initial_vertex, end_vertex);
                    break;
                case SHORTEST_PATH_METHOD.BELLMAN_FORD:
                    prec_map = bellman_ford(g, initial_vertex, end_vertex);
                    break;
                case SHORTEST_PATH_METHOD.AUTO:
                default:
                    prec_map = g.hasNegativeCosts() ?
                        bellman_ford(g, initial_vertex, end_vertex) :
                        dijkstra(g, initial_vertex, end_vertex);
                    break;
            }
            return GraphTheory.Utils.precedenceMapToPaths(prec_map);
        }
        Algorithms.getShortestPaths = getShortestPaths;
        function getShortestPathTo(g, initial_vertex, end_vertex, method = SHORTEST_PATH_METHOD.AUTO) {
            let paths = getShortestPaths(g, initial_vertex, method, end_vertex);
            return paths.get(end_vertex);
        }
        Algorithms.getShortestPathTo = getShortestPathTo;
        function dijkstra(g, initial_vertex, end_vertex) {
            let dist_map = new Map();
            for (let v of g.getVertices()) {
                dist_map.set(v, { pred: null, cost: Infinity });
            }
            dist_map.set(initial_vertex, { pred: null, cost: 0 });
            let Q = g.getVertices().slice();
            loop: while (Q.length !== 0) {
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
                if (neighbors === undefined) {
                    break loop;
                }
                for (let s2 of neighbors) {
                    let cost = g.getCost(s1, s2);
                    let dist = dist_map.get(s1).cost + cost;
                    if (cost < 0) {
                        throw new RangeError(`Cost of edge [${s1} -> ${s2}] is negative (${cost}) ` +
                            'use SHORTEST_PATH_METHOD.BELLMAN_FORD instead of DIJKSTRA.');
                    }
                    if (dist_map.get(s2).cost > dist) {
                        dist_map.set(s2, { pred: s1, cost: dist });
                    }
                }
                Q.splice(idx, 1);
                if (s1 === end_vertex) {
                    break loop;
                }
            }
            return dist_map;
        }
        function bellman_ford(g, initial_vertex, end_vertex) {
            throw new Error('Bellman-Ford not yet implemented');
        }
    })(Algorithms = GraphTheory.Algorithms || (GraphTheory.Algorithms = {}));
})(GraphTheory || (GraphTheory = {}));
var GraphTheory;
(function (GraphTheory) {
    let Renderer;
    (function (Renderer_1) {
        var Vec2 = GraphTheory.Utils.Vec2;
        let VertexShape;
        (function (VertexShape) {
            VertexShape[VertexShape["CIRCLE"] = 0] = "CIRCLE";
            VertexShape[VertexShape["ELLIPSE"] = 1] = "ELLIPSE";
            VertexShape[VertexShape["SQUARE"] = 2] = "SQUARE";
            VertexShape[VertexShape["RECTANGLE"] = 3] = "RECTANGLE";
        })(VertexShape = Renderer_1.VertexShape || (Renderer_1.VertexShape = {}));
        Renderer_1.profiles = {
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
        class Renderer {
            constructor(graph, cnv, profile) {
                this.graph = graph;
                this.cnv = cnv;
                this.profile = profile;
                this.ctx = cnv.getContext('2d');
                this.profile = GraphTheory._Internal._default(profile, Renderer_1.profiles.classic);
            }
            drawEdge(from, to) {
                if (this.graph.isDirected()) {
                    this.drawEdgeDirected(from, to);
                }
                else {
                    this.drawEdgeUndirected(from, to);
                }
            }
            drawEdgeUndirected(from, to) {
                this.ctx.strokeStyle = this.profile.edge_color;
                this.ctx.beginPath();
                this.ctx.moveTo(from.x, from.y);
                this.ctx.lineTo(to.x, to.y);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            drawEdgeDirected(from, to) {
                let a = to.angleTo(from);
                let d = new Vec2(Math.cos(a), Math.sin(a));
                let p = new Vec2(to.x - this.profile.vertex_size * d.x, to.y - this.profile.vertex_size * d.y);
                let b = Math.PI / 1.2;
                let u = new Vec2(Math.cos(a + b), Math.sin(a + b));
                let v = new Vec2(Math.cos(a - b), Math.sin(a - b));
                this.drawEdgeUndirected(from, to);
                this.ctx.fillStyle = this.profile.edge_color;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x + this.profile.vertex_size * u.x, p.y + this.profile.vertex_size * u.y);
                this.ctx.lineTo(p.x, p.y);
                this.ctx.lineTo(p.x + this.profile.vertex_size * v.x, p.y + this.profile.vertex_size * v.y);
                this.ctx.fill();
                this.ctx.closePath();
            }
            drawVertex(label, pos) {
                let vr;
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
            drawLabel(label, pos, squeeze_label = true) {
                this.ctx.beginPath();
                this.ctx.font = this.profile.label_font;
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(label, pos.x, pos.y + 3, squeeze_label ? this.profile.vertex_size : undefined);
                this.ctx.fill();
                this.ctx.closePath();
            }
            draw(vertices_coords) {
                this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
                this.ctx.strokeStyle = this.profile.edge_color;
                this.ctx.lineWidth = this.profile.edge_width;
                for (let edge of this.graph.getEdges()) {
                    let origin = vertices_coords.get(edge.from), dst = vertices_coords.get(edge.to);
                    this.drawEdge(origin, dst);
                    this.ctx.closePath();
                    if (this.profile.show_costs) {
                        let n = origin.dirTo(dst).normalVector();
                        let sgn = Math.sign;
                        let text_pos = origin.add(dst.sub(origin).div(2));
                        text_pos = text_pos.add(n.mul(10));
                        this.ctx.beginPath();
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(edge.cost.toString(), text_pos.x, text_pos.y);
                        this.ctx.fill();
                        this.ctx.closePath();
                    }
                }
                for (let [v, p] of vertices_coords) {
                    this.drawVertex(v.toString(), p);
                }
            }
            setProfile(profile) {
                this.profile = profile;
            }
        }
        Renderer_1.Renderer = Renderer;
        const circleVertexRenderer = (ctx, profile, label, pos) => {
            ctx.beginPath();
            ctx.fillStyle = profile.vertex_color;
            ctx.arc(pos.x, pos.y, profile.vertex_size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            return true;
        };
        const squareVertexRenderer = (ctx, profile, label, pos) => {
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
        const rectangleVertexRenderer = (ctx, profile, label, pos) => {
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
    })(Renderer = GraphTheory.Renderer || (GraphTheory.Renderer = {}));
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