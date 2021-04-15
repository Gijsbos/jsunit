let is_literal_object = (input) => { return input && input.constructor && input.constructor.name.toLowerCase() === "object"; };

let is_class_object = (input) => { return input && !Array.isArray(input) && input.constructor && input.constructor.name.toLowerCase() !== "object"; };

function array_has_values(array, values)
{
    for(let i = 0; i < values.length; i++)
        if(!array.includes(values[i]))
            return false;

    return true;
}

let array_equals = (array1, array2) => { return array_has_values(array1, array2) && array_has_values(array2, array1); };

/**
 * gettype
 * @param {*} input 
 * @returns 
 */
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

/**
 * is_object_type
 *  True when type equals gettype() Object<> response 
 * @param {*} type 
 * @returns 
 */
function is_object_type(type)
{
    let temp = (new RegExp('object<([a-z0-9\_]+)>','gi')).exec(type);

    if(temp === null)
        return false;
    else
        return temp[1];
}