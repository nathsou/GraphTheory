/// <reference path="Graph.ts" />
/// <reference path="DirectedGraph.ts" />

namespace GraphTheory {

    export namespace Utils {

        /**
         * Abstract representation of a list of elements
         * 
         * @abstract
         * @class AbstractList
         * @template T - The elements's type
         */
        abstract class AbstractList<T> {
            protected elements: T[];

            constructor(...elements: T[]) {
                this.elements = elements;
            }
    
            /**
             * @returns {T} - the last element of the list
             * 
             * @memberOf AbstractList
             */
            public peek() : T {
                return this.elements[this.elements.length - 1];
            }
    
            /**
             * @returns {number} - the number of elements in the list
             * 
             * @memberOf AbstractList
             */
            public size() : number {
                return this.elements.length;
            }
    
            /**
             * @returns {boolean} - whether the list has no element
             * 
             * @memberOf AbstractList
             */
            public isEmpty() : boolean {
                return this.size() === 0;
            }
        }

        /**
         * Stack implementation (Last In First Out)
         * 
         * @export
         * @class Stack
         * @extends {AbstractList<T>}
         * @template T 
         */
        export class Stack<T> extends AbstractList<T> {
            
            /**
             * Pushes one or more elements on top of the stack
             * 
             * @param {...T[]} elems 
             * 
             * @memberOf Stack
             */
            public push(...elems: T[]) : void {
                this.elements.push(...elems);
            }

            /**
             * Removes and returns the element at the top of the stack
             * 
             * @returns {T} 
             * 
             * @memberOf Stack
             */
            public pop() : T {
                return this.elements.pop();
            }

        }
            
        /**
         * Queue implementation (First In First out)
         * 
         * @export
         * @class Queue
         * @extends {AbstractList<T>}
         * @template T 
         */
        export class Queue<T> extends AbstractList<T> {

            /**
             * Adds an element at the beginning of the queue
             * 
             * @param {...T[]} elems 
             * 
             * @memberOf Queue
             */
            public enqueue(...elems: T[]) : void {
                this.elements.unshift(...elems);
            }

            /**
             * Removes the last element in the queue
             * 
             * @returns {T} 
             * 
             * @memberOf Queue
             */
            public dequeue() : T {
                return this.elements.pop();
            }
        }

    }

}