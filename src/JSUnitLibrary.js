/**
 * Basic JS Unit Functions
 */
let js_unit_function_exists = (func) => { typeof window[func] === "function"; };

/**
 * is_literal_object
 */
if(!js_unit_function_exists(is_literal_object))
    function is_literal_object(input) { return input && input.constructor && input.constructor.name.toLowerCase() === "object"; };

/**
 * is_class_object
 */
if(!js_unit_function_exists(is_class_object))
    function is_class_object(input) { return input && !Array.isArray(input) && input.constructor && input.constructor.name.toLowerCase() !== "object"; };

/**
 * array_has_values
 * @param {*} array 
 * @param {*} values 
 * @returns 
 */
if(!js_unit_function_exists(array_has_values))
{
    function array_has_values(array, values)
    {
        for(let i = 0; i < values.length; i++)
        {
            if(!array.includes(values[i]))
                return false;
        }
        return true;
    }
}

/**
 * array_equals
 * @param {*} array1 
 * @param {*} array2 
 * @returns 
 */
if(!js_unit_function_exists(array_equals))
{
    function array_equals(array1, array2)
    {
        return array_has_values(array1, array2) && array_has_values(array2, array1);
    }
}

/**
 * gettype
 * @param {*} input 
 * @returns 
 */
if(!js_unit_function_exists(gettype))
{
    function gettype(input)
    {
        let IS_FLOAT_REGEXP =  /^[-]?(?:[0-9]*[,.]{1}[0-9]*)$/g;
    
        if(input === undefined)
            return "undefined";
        else if(input === null)
            return "null";
        else if(typeof input == "number")
        {
            if((new RegExp(IS_FLOAT_REGEXP)).test(input))
                return "float";
            else
                return "int";
        }
        else if (typeof input == "boolean")
        {
            return "boolean";
        }
        else if (typeof input == "function")
        {
            return "function";
        }
        else if (Array.isArray(input))
        {
            return "array";
        }
        else if (typeof input == "object")
        {
            if(is_literal_object(input))
                return "literal";
            else if(is_class_object(input))
                return `Object<${input.constructor.name}>`;
            else
                throw new Exception(`gettype failed, unknown object type ${input}`);
        }
        else if (typeof input == "string")
            return "string";
        else
            throw new Exception(`gettype failed, unknown input type ${typeof input}`);
    }
}

/**
 * is_object_type
 *      Expects return value for gettype as input, returns false if not an object, returns object name if true
 * @param {*} type 
 * @returns 
 */
if(!js_unit_function_exists(is_object_type))
{
    function is_object_type(type)
    {
        let temp = (new RegExp('object<([a-z0-9\_]+)>','gi')).exec(type);
    
        if(temp === null)
            return false;
        else
            return temp[1];
    }
}