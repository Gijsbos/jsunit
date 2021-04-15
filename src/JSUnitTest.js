/**
 * JSUnitTest
 */
class JSUnitTest
{
    /**
     * constructor
     */
    constructor()
    {
        this.objectReferences = []; // Prevent Maximum call stack size exceeded
        this.assertions = [];
        this.expectExceptions = [];
    }

    /**
     * getFunctionNames
     * @returns 
     */
    static getFunctionNames(object)
    {
        let functionNames = [];
        Object.getOwnPropertyNames(object.__proto__).forEach((prop) =>
        {
            functionNames.push(prop);
        });
        return functionNames;
    }

    /**
     * getFunctionCaller
     * @returns {string}
     */
    static getFunctionCaller(object)
    {
        // Get function names
        let functionNames = JSUnitTest.getFunctionNames(object.__proto__);
        let callingObject = object.constructor.name;
        let callingObjectFunctionNames = JSUnitTest.getFunctionNames(new object.constructor);

        // Throw Exception to Extract function caller name
        try
        {
            throw new Error();
        }
        catch (e)
        {
            var split = e.stack.split("\n");

            // For firefox we adjust the lines
            if((new RegExp('firefox','gi')).test(navigator.userAgent) === true)
            {
                split = split.map((line) =>
                {
                    return line.replace(/(\s*)([a-z0-9]+)(\s*)(.*)/gi, `\$1at ${callingObject}.\$2 \$3(\$4)`);
                });
            }

            // Extract info
            let result = split.map((child) =>
            {
                return new RegExp('\s*at ([a-z0-9\_]+)\.([a-z0-9\_]+) \((.+)\)','gi').exec(child);
            });

            // Filter out relevant
            result = result.filter((child) =>
            {
                if(child === null)
                    return false;

                return child[1] === callingObject && !functionNames.includes(child[2]) && callingObjectFunctionNames.includes(child[2]);
            });

            // Return result
            let info = result.pop().slice(1);

            // Return info
            return {
                class: info[0],
                method: info[1],
                line: info[2],
            }
        }
    }

    /**
     * addAssertion
     * @param {*} info 
     */
    addAssertion(info)
    {
        let assertion = `${info['class']}.${info['method']}`;

        if(!this.assertions.includes(assertion))
            this.assertions.push(assertion);
    }

    /**
     * throwException
     * @param {*} info 
     * @param {*} message 
     * @param {*} data 
     */
    throwException(info, message = "", data)
    {
        throw new JSUnitTestException(`Test '${info['class']}.${info['method']}' failed, ${message} at line '${info['line']}'`, data);
    }

    /**
     * isExpectingException
     * @param {*} className 
     * @param {*} methodName 
     * @returns 
     */
    isExpectingException(className, methodName)
    {
        for(let i = 0; i < this.expectExceptions.length; i++)
        {
            let child = this.expectExceptions[i];
            if(child.class == className && child.method == methodName)
                return child;
        }
        return false;
    }

    /**
     * expectException
     * 
     * @param {string|Object} exception - name of expected exception
     */
    expectException(exception)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        // Check if exception is object
        if(typeof exception == "string")
            info.exception = exception;
        else if(typeof exception == "object")
            info.exception = exception.constructor.name;

        // Store
        this.expectExceptions.push(info);
    }

    /**
     * assertTrue
     *  Success when value is 'true'
     * @param {boolean} value 
     */
    assertTrue(value)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        if(value !== true)
            this.throwException(info);
    }

    /**
     * assertFalse
     *  Success when value is 'false'
     * @param {boolean} value 
     */
    assertFalse(value)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        if(value !== false)
            this.throwException(info);
    }

    /**
     * assertEmpty
     *  Success when value is 'undefined' or 'null'
     * @param {any} value 
     */
    assertEmpty(value)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        if(!(value === undefined || value === null))
            this.throwException(info);
    }

    /**
     * assertUndefined
     *  Success when value is 'undefined'
     * @param {any} value 
     */
    assertUndefined(value)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        if(value !== undefined)
            this.throwException(info);
    }

    /**
     * assertNull
     *  Success when value is 'null'
     * @param {any} value 
     */
    assertNull(value)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        if(value !== null)
            this.throwException(info);
    }

    /**
     * addAssertEqualsObjectDiffText
     * 
     * @param {string} message 
     * @param {Object} report 
     * @returns {Array}
     */
    addAssertEqualsObjectDiffText(message, report)
    {
        return [...`${message}`.split("\r"), ...report];
    }

    /**
     * indents
     * @param {int} indents 
     * @returns {string}
     */
    indents(indents)
    {
        return "\t".repeat(indents);
    }

    /**
     * objectToString
     * @param {Object} object 
     * @param {string} name 
     * @param {int} indents 
     * @param {boolean} filterNull 
     * @returns 
     */
    objectToString(object, name, indents, filterNull = false)
    {
        let change = [];

        for(const key in object)
        {
            if((filterNull && (object[key] == 'null' || object[key] == null)) === false)
                change.push(`${this.indents(indents+1)}- [${key}] => ${object[key]}\n`);
        }

        return [`${this.indents(indents)}${name} (\n`, ...change, `${this.indents(indents)})\n`];
    }

    /**
     * getObjectChange
     * @param {Object} expected 
     * @param {Object} actual 
     * @param {int} indents 
     * @returns {Array<string>}
     */
    getObjectChange(expected, actual, indents)
    {
        let change = [];

        for(const key in expected)
        {
            // Check if expected 'key' exists in actual
            if(actual[key] !== undefined)
            {
                let expectedType = gettype(expected[key]);
                let actualType = gettype(actual[key]);

                if(expectedType !== actualType)
                {
                    change.push(`${this.indents(indents+1)}- [${key}] => ${expected[key]}\n`);
                    change.push(`${this.indents(indents+1)}+ [${key}] => ${actual[key]}\n`);
                }
                else
                {
                    switch(true)
                    {
                        case is_object_type(expectedType) !== false:

                            // Check if objects are literally the same by reference
                            if(expected[key] === actual[key])
                                continue;

                            // Check objects
                            let objName = is_object_type(expectedType);
                            let objChange = this.compareObject(expected[key], actual[key], objName, indents + 3);
                            if(objChange.length > 2)
                            {
                                change.push(`${this.indents(indents+1)}- [${key}] => \n`);
                                change = [...change, ...this.objectToString(expected[key], objName, indents + 3)];
                                change.push(`${this.indents(indents+1)}+ [${key}] => \n`);
                                change = [...change, ...objChange];
                            }
                        break;
                        case expectedType == "literal":

                            // Check if object literals are literally the same by reference
                            if(expected[key] === actual[key])
                                continue;
                            
                            let literalName = "Literal";
                            let litChange = this.compareObject(expected[key], actual[key], literalName, indents + 3);
                            if(litChange.length > 2)
                            {
                                change.push(`${this.indents(indents+1)}- [${key}] => \n`);
                                change = [...change, ...this.objectToString(expected[key], literalName, indents + 3)];
                                change.push(`${this.indents(indents+1)}+ [${key}] => \n`);
                                change = [...change, ...litChange];
                            }
                        break;
                        case expectedType == "array":
                            let arrayName = "Array";
                            let arrayChange = this.compareObject(this.convertArrayToObject(expected[key]), this.convertArrayToObject(actual[key]), arrayName, indents + 3);
                            if(arrayChange.length > 2)
                            {
                                change.push(`${this.indents(indents+1)}- [${key}] => \n`);
                                change = [...change, ...this.objectToString(expected[key], arrayName, indents + 3)];
                                change.push(`${this.indents(indents+1)}+ [${key}] => \n`);
                                change = [...change, ...arrayChange];
                            }
                        break;
                        default:
                            if(expected[key] !== actual[key])
                            {
                                change.push(`${this.indents(indents+1)}- [${key}] => ${expected[key]}\n`);
                                change.push(`${this.indents(indents+1)}+ [${key}] => ${actual[key]}\n`);
                            }
                    }
                }
            }
            else
            {
                if(actual[key] === undefined && expected[key] !== undefined)
                {
                    change.push(`${this.indents(indents+1)}- [${key}] => ${expected[key]}\n`);
                }
            }
        }

        // Values that are in actual but not in expected
        for(const key in actual)
        {
            if(expected[key] === undefined && actual[key] !== undefined)
            {
                change.push(`${this.indents(indents+1)}+ [${key}] => ${actual[key]}\n`);
            }
        }

        return change;
    }

    /**
     * convertArrayToObject
     * @param {Array} array 
     * @returns {Object}
     */
    convertArrayToObject(array)
    {
        let object = {};
        for(let i = 0; i < array.length; i++)
        {
            object[i] = array[i];
        }
        return object;
    }

    /**
     * compareArray
     * @param {Array} expected 
     * @param {Array} actual 
     * @param {int} indents 
     * @returns {Array<string>}
     */
    compareArray(expected, actual, indents = 0)
    {
        // Convert arrays to literal
        expected = this.convertArrayToObject(expected);
        actual = this.convertArrayToObject(actual);

        // Get change
        let change = [`${this.indents(indents)}Array (\n`, ...this.getObjectChange(expected, actual, indents), `${this.indents(indents)})\n`];

        // Return
        return change.length > 2 ? change : true;
    }

    /**
     * compareLiteral
     * @param {Object} expected 
     * @param {Object} actual 
     * @param {int} indents 
     * @returns {Array<string>}
     */
    compareLiteral(expected, actual, indents = 0)
    {
        // Get change
        let change = [`${this.indents(indents)}Literal (\n`, ...this.getObjectChange(expected, actual, indents), `${this.indents(indents)})\n`];

        // Return
        return change.length > 2 ? change : true;
    }

    /**
     * compareObject
     * @param {Object} expected 
     * @param {Object} actual 
     * @param {string} name 
     * @param {int} indents 
     * @returns {Array<string>}
     */
    compareObject(expected, actual, name, indents = 0)
    {
        // Prevent circular references
        if(!this.objectReferences.includes(expected))
            this.objectReferences.push(expected);
        else
            return this.objectToString(expected, name, indents);

        if(!this.objectReferences.includes(actual))
            this.objectReferences.push(actual);
        else
            return this.objectToString(actual, name, indents);

        // Get change
        let change = [`${this.indents(indents)}${name} (\n`, ...this.getObjectChange(expected, actual, indents), `${this.indents(indents)})\n`];

        // Return
        return change.length > 2 ? change : true;
    }

    /**
     * assertEquals
     *  Compares 'expected' with 'actual' value.
     * @param {any} expected 
     * @param {any} actual 
     * @throws JSUnitException
     */
    assertEquals(expected, actual)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        // Check type
        let expectedType = gettype(expected);
        let actualType = gettype(actual);

        // Check type
        if(expectedType !== actualType)
            this.throwException(info, `actual type '${actualType}' does not meet expected type '${expectedType}'`);

        // Create temp var for class objects
        let objectType = null;

        // Switch
        switch(true)
        {
            case actualType == "float":
                if(expected != actual)
                    this.throwException(info, `actual (float) '${actual}' does not meet expected (float) '${expected}'`);
            break;
            case actualType == "int":
                if(expected != actual)
                    this.throwException(info, `actual (int) '${actual}' does not meet expected (int) '${expected}'`);
            break;
            case actualType == "boolean":
                if(expected != actual)
                    this.throwException(info, `actual (boolean) '${actual}' does not meet expected (boolean) '${expected}'`);
            break;
            case actualType == "function":
                if(expected != actual)
                    this.throwException(info, `actual (function) '${actual}' does not meet expected (function) '${expected}'`);
            break;
            case actualType == "string":
                if(expected != actual)
                    this.throwException(info, `actual (string) '${actual}' does not meet expected (string) '${expected}'`);
            break;
            case actualType == "array":
                let arrayReport = this.compareArray(expected, actual);
                if(arrayReport !== true)
                {
                    arrayReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two arrays are equal.\n\r--- Expected.\n\r+++ Actual.\n`, arrayReport);
                    this.throwException(info, `Expected array is not equal actual array`, arrayReport);
                }
            break;
            case actualType == "literal":
                let literalReport = this.compareLiteral(expected, actual);
                if(literalReport !== true)
                {
                    literalReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two literal objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`, literalReport);
                    this.throwException(info, `Expected object literal is not equal actual object literal`, literalReport);
                }
            break;
            case (objectType = is_object_type(actualType)) !== false:
                let classReport = this.compareObject(expected, actual, objectType);
                if(classReport !== true)
                {
                    classReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`, classReport);
                    this.throwException(info, `Expected object of type '${objectType}' is not equal actual object`, classReport);
                }
            break;
            default:
                if(expected != actual)
                    this.throwException(info, `actual (unknown) '${actual}' does not meet expected (unknown) '${expected}'`);
        }
    }

    /**
     * assertNotEquals
     *  Compares 'expected' with 'actual' value.
     * @param {any} expected 
     * @param {any} actual 
     */
    assertNotEquals(expected, actual)
    {
        let info = JSUnitTest.getFunctionCaller(this);

        // Add to assertions
        this.addAssertion(info);

        // Set ex
        var caughtException = null;

        try
        {
            this.assertEquals(expected, actual);
        }
        catch(ex)
        {
            caughtException = ex;

            if(!ex instanceof JSUnitTestException)
                throw ex;
        }

        if(caughtException === null)
        {
            this.throwException(info, `failed asserting that '${actual}' is not equal to '${expected}'`);
        }
    }
}