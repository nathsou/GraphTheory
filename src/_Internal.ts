namespace GraphTheory {

    //Contains functions that shouln't be used by the end user
    export namespace _Internal {
        /**
         * Internal function to give an object default values if not supplied
         * @export
         * @param {Object} obj 
         * @param {Object} def 
         * @returns {Object} 
         */
        export function _default(obj: Object, def : Object) : Object {
            
            let res = {};
            obj = obj == null ? {} : obj;

            for (let key of Object.keys(def)) {
                res[key] = obj.hasOwnProperty(key) ? obj[key] : def[key];
            }

            return res;
        }
    }
}