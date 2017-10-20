/// <reference path="AbstractGraph.ts" />
/// <reference path="Graph.ts" />

namespace GraphTheory {

    abstract class AbstractTree<T> extends AbstractGraph<T> {

        constructor() {
            super([], []);
        }

        public addEdge(edge: Edge<T>) : void {
            //create new vertices if they don't exist yet
            super.addVertex(edge.from);
            super.addVertex(edge.to);

            //TODO
            //if (no cycle) {
                //super.addEdge(edge);
            //}
        }

        public addVertex(v: T) : void {
            throw new Error(
                `Cannot add an unconnected vertex to a Tree, call addEdge() instead, 
                it will create the necessary vertices`
            );
        }
    }
    
}