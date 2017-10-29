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

        /**
         * Simple 2d Vector class
         * 
         * @export
         * @class Vec2
         * @implements {Point}
         */
        export class Vec2 {

            constructor(public x: number, public y: number) {}
        
            /**
             * Adds two Vec2 and returns a new Vec2
             * 
             * @param {Vec2} v 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public add(v: Vec2) : Vec2 {
                return new Vec2(this.x + v.x, this.y + v.y);
            }

            /**
             * Subtracts two Vec2 and returns a new Vec2
             * 
             * @param {Vec2} v 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public sub(v: Vec2) : Vec2 {
                return new Vec2(this.x - v.x, this.y - v.y);
            }

            /**
             * Multiplies a Vec2 by a number and returns a new Vec2
             * 
             * @param {number} k 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public mul(k: number) : Vec2 {
                return new Vec2(this.x * k, this.y * k);
            }

            /**
             * Divides a Vec2 by a number and returns a new Vec2
             * 
             * @param {number} k 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public div(k: number) : Vec2 {
                return this.mul(1 / k);
            }

            /**
             * Applies a function to the x and y components of this Vec2
             * and returns a new Vec2
             * 
             * @param {(component: number) => number} f 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public map(f: (component: number) => number) : Vec2 {
                return new Vec2(f(this.x), f(this.y));
            }
        
            /**
             * Computes the dot product of two Vec2
             * 
             * @param {Vec2} v 
             * @returns {number} 
             * 
             * @memberOf Vec2
             */
            public dot(v: Vec2) : number {
                return this.x * v.x + this.y * v.y;
            }
        
            /**
             * Computes the length of this Vec2
             * 
             * @returns {number} 
             * 
             * @memberOf Vec2
             */
            public length() : number {
                return Math.sqrt(this.lengthSq());
            }

            /**
             * Computes the squared length of this Vec2
             * 
             * @returns {number} 
             * 
             * @memberOf Vec2
             */
            public lengthSq() : number {
                return this.dot(this);
            }
        
            /**
             * Normalizes this Vec2 and returns a new Vec2
             * 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public normalize() : Vec2 {
                return this.div(this.length());
            }

            /**
             * Computes a normal vector to this Vec2 and returns it
             * 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public normalVector() : Vec2 {
                return new Vec2(-this.y, this.x).normalize();
            }
        
            /**
             * Computes the angle given by this Vec2's direction (in radians)
             * 
             * @returns {number} 
             * 
             * @memberOf Vec2
             */
            public angle() : number {
                return Math.atan2(this.y, this.x);
            }

            /**
             * Computes the distance between two Vec2
             * 
             * @param {Vec2} v 
             * @returns {number} 
             * 
             * @memberOf Vec2
             */
            public distTo(v: Vec2) : number {
                return Math.sqrt(this.distToSq(v));
            }

            /**
             * Computes the squared distance between two Vec2
             * 
             * @param {Vec2} v 
             * @returns {number} 
             * 
             * @memberOf Vec2
             */
            public distToSq(v: Vec2) : number {
                return this.sub(v).lengthSq();
            }

            /**
             * Computes a direction vector to this Vec2 and returns it
             * 
             * @param {Vec2} v 
             * @returns {Vec2} 
             * 
             * @memberOf Vec2
             */
            public dirTo(v: Vec2) : Vec2 {
                return this.sub(v).normalize();
            }

            /**
             * Computes the angle between this Vec2 and v (in radians)
             * 
             * @param {Vec2} v 
             * @returns {number} 
             * 
             * @memberOf Vec2
             */
            public angleTo(v: Vec2) : number {
                return this.angle() - v.angle();
            }
        }

    }

}