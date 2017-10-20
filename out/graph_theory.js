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
                    edge['cost'] = edge['cost'];
                }
                else {
                    edge = {
                        from: edges[e][0],
                        to: edges[e][1],
                        cost: edges[e][2]
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
            }
            ctx.fillStyle = options.vertex_color;
            for (let [v, p] of vertices_coords) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, options.vertex_radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeText(v.toString(), p.x - 3, p.y + 3, options.vertex_radius);
                ctx.stroke();
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
        constructor(vertices, edges) {
            super(vertices, edges, true);
        }
        isArcUndirected(arc) {
            return this.hasEdge(arc) && this.hasEdge({ from: arc.to, to: arc.from });
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
    class PlayGround {
        constructor(cnv, directed = false) {
            this.cnv = cnv;
            this.vertex_radius = 10;
            this.graph = directed ? new GT.DirectedGraph([], []) : new GT.Graph([], []);
            this.vertices_coords = new Map();
            this.ctx = cnv.getContext('2d');
            this.draw();
            let rad_sq = Math.pow(this.vertex_radius, 2);
            let overlapping = (a, b) => {
                return (Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)) <= rad_sq;
            };
            let origin;
            let mouse_move_listener = (e) => {
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
                    if (overlapping(p, { x: e.clientX, y: e.clientY })) {
                        origin = v;
                    }
                }
                cnv.addEventListener('mousemove', mouse_move_listener);
            });
            cnv.addEventListener('mouseup', (e) => {
                if (origin === undefined) {
                    let v = this.graph.getVertices().length;
                    this.vertices_coords.set(v, { x: e.clientX, y: e.clientY });
                    this.addVertex(v);
                }
                else {
                    for (let [v, p] of this.vertices_coords) {
                        if (v !== origin && overlapping(p, { x: e.clientX, y: e.clientY })) {
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
        addVertex(v) {
            this.graph.addVertex(v);
        }
        addEdge(from, to) {
            this.graph.addEdge({ from: from, to: to });
        }
        draw() {
            this.graph.draw(this.cnv, this.vertices_coords, {
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
    })(Utils = GraphTheory.Utils || (GraphTheory.Utils = {}));
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
        function getShortestPath(g, initial_vertex, method = SHORTEST_PATH_METHOD.AUTO) {
        }
        Algorithms.getShortestPath = getShortestPath;
        function dijkstra(g, initial_vertex) {
            let dist_map = new Map();
            for (let v of g.getVertices()) {
                dist_map.set(v, Infinity);
            }
            dist_map.set(initial_vertex, 0);
            let Q = g.getVertices().slice;
            while (Q.length !== 0) {
                let min = Infinity, vertex = -1;
                for (let i = 0; i < Q.length; i++) {
                    if (dist_map.get(g.getVertex(i)) < min) {
                        min = dist_map.get(g.getVertex(i));
                        vertex;
                    }
                }
            }
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