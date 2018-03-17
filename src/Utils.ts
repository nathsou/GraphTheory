namespace GraphTheory {

    export namespace Utils {

        export namespace labels { //default label providers

            export type LabelProvider<T> = (last: T) => T;

            /**
             * Provides integer labels starting from 0 : [0, 1, 2, ...]
             * 
             * @param {number} last 
             * @returns {number} 
             */
            export const next_number: LabelProvider<number> = (last: number) : number => last === null ? 0 : last + 1;

            /**
             * Provides integer labels starting from 1 :  [1, 2, 3, ...]
             * 
             * @param {number} last 
             * @returns {number} 
             */
            export const next_number1: LabelProvider<number> = (last: number) : number => last === null ? 1 : last + 1;
           
            /**
             * Provides uppercase letter labels, first 26 are [A..Z], then [A1..Z1] etc..
             * 
             * @export
             * @param {string} last 
             * @returns {string} - the next label
             */
            export const next_letter: LabelProvider<string> = (last: string) : string => {
                if (last === null) return 'A';

                let code = last.charCodeAt(0),
                    idx = (code - 64) % 26,
                    letter = String.fromCharCode(65 + idx),
                    nb = Number(last.substr(1));

                return letter + (idx === 0 ? nb + 1 : (nb === 0 ? '' : nb)).toString();
            }

            /**
             * Provides lowercase letter labels, first 26 are [a..z], then [a1..z1] etc..
             * 
             * @param {string} last 
             * @returns {string} 
             */
            export const next_lowercase_letter: LabelProvider<string> = 
                (last: string) : string => next_letter(last === null ? null : last.toUpperCase()).toLowerCase();

            /**
             * Generates a label provider given an array (repeating labels every array.length calls)
             * 
             * @export
             * @template T 
             * @param {T[]} array 
             * @param {T} last 
             * @returns LabelProvider<T>
             */
            export function next_element<T>(array: T[]) : LabelProvider<T> {
                return (last: T) => {
                    if (last === null) return array[0];
                    return array[(array.indexOf(last) + 1) % array.length];
                };
            }
        }

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
             * Computes a right-hand normal vector to this Vec2 and returns it
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
                return this.sub(v).angle();
            }
        }

        /**
         * Constructs a path from a precedence map
         * 
         * @export
         * @template T 
         * @param {T} vertex 
         * @param {Map<T, {cost: number, pred: T}>} map 
         * @returns {{cost: number, path: T[]}} - the path and its cost
         */
        export function precedenceMapToPath<T>(vertex: T, map: Map<T, {cost: number, pred: T}>) : {cost: number, path: T[]} {

            let path: T[] = [];

            let v = vertex;

            while (map.get(v).pred !== null) {
                path.push(v);
                v = map.get(v).pred;
            }

            path.push(v);

            let cost = map.get(vertex).cost;

            return {cost: cost, path: cost !== Infinity ? path.reverse() : null};
        }

        export function precedenceMapToPaths<T>(map: Map<T, {cost: number, pred: T}>) : Map<T, {cost: number, path: T[]}> {

            let paths = new Map<T, {cost: number, path: T[]}>();

            for (let v of map.keys()) {
                let cost = map.get(v).cost;
                paths.set(v, precedenceMapToPath(v, map));
            }

            return paths;
        }
    }

}