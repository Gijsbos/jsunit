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
        this.THROW_EXCEPTION_ON_FAILURE = false;
        this.PASS_ON_RUNNER_EXCEPTIONS = false;
        this.objectReferences = []; // Prevent Maximum call stack size exceeded
        this.expectExceptions = [];
        this.currentTestName = null;
        this.assertions = [];
        this.results = [];
    }

    /**
     * getLineInfo
     */
    getLineInfo()
    {
        try
        {
            throw new Error();
        }
        catch(ex)
        {
            var split = ex.stack;

            // For firefox we adjust the lines
            if((new RegExp('firefox','gi')).test(navigator.userAgent) === true)
            {
                let name = `${this.currentTestName}`;
                let indexOf = split.indexOf(name);
                if(indexOf > 0)
                {
                    let lineBreakPos = split.indexOf('\n', indexOf);
                    return split.substr(0, lineBreakPos).split("\n").pop().trim().split("@")[1].trim();
                }
            }
            else if((new RegExp('chrome','gi')).test(navigator.userAgent) === true)
            {
                let name = `${this.constructor.name}.${this.currentTestName}`;
                let indexOf = split.indexOf(name);
                if(indexOf > 0)
                {
                    let lineBreakPos = split.indexOf('\n', indexOf);
                    let fragment = split.substr(0, lineBreakPos).split("\n").pop().trim();
                    return /\((.+)\)/g.exec(fragment)[1];   
                }
            }
            return null;
        }
    }

    /**
     * addAssertion
     */
    addAssertion()
    {
        let name = `${this.constructor.name}.${this.currentTestName}`;

        if(!this.assertions.includes(name))
            this.assertions.push(name);
    }

    /**
     * hasAssertion
     * @param {*} methodName 
     * @returns 
     */
    hasAssertion(methodName)
    {
        return this.assertions.includes(`${this.constructor.name}.${methodName}`);
    }

    /**
     * hasResult
     * @param {*} methodName 
     * @returns 
     */
    hasResult(methodName)
    {
        for(let i = 0; i < this.results.length; i++)
            if(this.results[i].methodName == methodName)
                return true;
        
        return false;
    }

    /**
     * setFailedResult
     * @param {*} methodName 
     * @param {*} message 
     * @param {*} data 
     */
    setFailedResult(message, data, throws = false)
    {
        let lineInfo = this.getLineInfo();
        var message = lineInfo ? `${message} at line ${lineInfo}` : message;

        if(throws || this.THROW_EXCEPTION_ON_FAILURE)
            throw new JSUnitTestException(this.currentTestName, message, data);

        if(this.hasResult(this.currentTestName))
            return false;

        this.results.push(new JSTestResult(this.constructor.name, this.currentTestName, false, message, data));
    }

    /**
     * setSuccess
     */
    setSuccess()
    {
        if(this.hasResult(this.currentTestName))
            return false;

        this.results.push(new JSTestResult(this.constructor.name, this.currentTestName, true))
    }

    /**
     * setSkipped
     */
    setSkipped()
    {
        if(this.hasResult(this.currentTestName))
            return false;

        this.results.push(new JSTestResult(this.constructor.name, this.currentTestName, null))
    }

    /**
     * handleReceivedException
     * @param {*} methodName 
     * @returns {boolean} true when exception was expected, false when not
     */
    handleReceivedException(methodName, exception)
    {
        let expected = null;

        for(let i = 0; i < this.expectExceptions.length; i++)
            if(this.expectExceptions[i][0] == methodName)
                expected = this.expectExceptions[i][1];
    
        // Was not expected
        if(expected === null)
        {   
            throw exception;
        }
        else
        {
            // Check if the right exception was received
            if(exception.constructor.name !== expected)
                this.setFailedResult(methodName, `Failed asserting that '${this.constructor.name}.${methodName}' throws an exception of type ${expected}`);
            else
                this.setSuccess();
        }

        return expected !== null;
    }

    /**
     * shouldHaveThrownException
     * @param {*} methodName 
     */
    shouldHaveThrownException(methodName)
    {
        let expected = null;

        for(let i = 0; i < this.expectExceptions.length; i++)
            if(this.expectExceptions[i][0] == methodName)
                expected = this.expectExceptions[i][1];

        if(expected !== null)
            this.setFailedResult(methodName, `Failed asserting that '${this.constructor.name}.${methodName}' throws an exception of type ${expected}`);
    }

    /**
     * expectException
     */
    expectException(exception)
    {
        this.addAssertion();

        this.expectExceptions.push([this.currentTestName, typeof exception == "object" ? exception.constructor.name : exception]);
    }

    /**
     * assertTrue
     *  Success when value is 'true'
     * @param {boolean} value 
     */
    assertTrue(value)
    {
        this.addAssertion();

        if(value !== true)
            this.setFailedResult(`Failed asserting that '${this.constructor.name}.${this.currentTestName}' is true`);
        else
            this.setSuccess();
    }

    /**
     * assertFalse
     *  Success when value is 'false'
     * @param {boolean} value 
     */
    assertFalse(value)
    {
        this.addAssertion();
        
        if(value === true)
            this.setFailedResult(`Failed asserting that '${this.constructor.name}.${this.currentTestName}' is false`);
        else
            this.setSuccess();
    }

    /**
     * assertEmpty
     *  Success when value is 'undefined' or 'null'
     * @param {any} value 
     */
    assertEmpty(value)
    {
        this.addAssertion();

        if(!(value === undefined || value === null))
            this.setFailedResult(`Failed asserting that '${this.constructor.name}.${this.currentTestName}' is empty (undefined|null)`);
        else
            this.setSuccess();
    }

    /**
     * assertUndefined
     *  Success when value is 'undefined'
     * @param {any} value 
     */
    assertUndefined(value)
    {
        this.addAssertion();

        if(value !== undefined)
            this.setFailedResult(`Failed asserting that '${this.constructor.name}.${this.currentTestName}' is undefined`);
        else
            this.setSuccess();
    }

    /**
     * assertNull
     *  Success when value is 'null'
     * @param {any} value 
     */
    assertNull(value)
    {
        this.addAssertion();

        if(value !== null)
            this.setFailedResult(`Failed asserting that '${this.constructor.name}.${this.currentTestName}' is null`);
        else
            this.setSuccess();
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
    assertEquals(expected, actual, throws = false)
    {
        this.addAssertion();

        // Check if objects are literally the same
        if(expected === actual)
            return this.setSuccess();

        // Check type
        let expectedType = gettype(expected);
        let actualType = gettype(actual);

        // Check type
        if(expectedType !== actualType)
            return this.setFailedResult(`Failed asserting that '${actual}' equals '${expected}'`, null, throws);

        // Create temp var for class objects
        let objectType = null;

        // Switch
        switch(true)
        {
            case actualType == "float":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (float) '${actual}' equals expected (float) '${expected}'`, null, throws);
            break;
            case actualType == "int":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (int) '${actual}' equals expected (int) '${expected}'`, null, throws);
            break;
            case actualType == "boolean":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (boolean) '${actual}' equals expected (boolean) '${expected}'`, null, throws);
            break;
            case actualType == "function":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (function) '${actual}' equals expected (function) '${expected}'`, null, throws);
            break;
            case actualType == "string":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (string) '${actual}' equals expected (string) '${expected}'`, null, throws);
            break;
            case actualType == "array":
                let arrayReport = this.compareArray(expected, actual);
                if(arrayReport !== true)
                {
                    arrayReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two arrays are equal.\n\r--- Expected.\n\r+++ Actual.\n`, arrayReport);
                    return this.setFailedResult("Assertion failed", arrayReport, throws);
                }
            break;
            case actualType == "literal":
                let literalReport = this.compareLiteral(expected, actual);
                if(literalReport !== true)
                {
                    literalReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two literal objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`, literalReport);
                    return this.setFailedResult("Assertion failed", literalReport, throws);
                }
            break;
            case (objectType = is_object_type(actualType)) !== false:
                let classReport = this.compareObject(expected, actual, objectType);
                if(classReport !== true)
                {
                    classReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`, classReport);
                    return this.setFailedResult("Assertion failed", classReport, throws);
                }
            break;
            default:
                if(expected != actual)
                    return this.setFailedResult(`actual (unknown) '${actual}' does not meet expected (unknown) '${expected}'`, null, throws);
        }

        // Set success if current test name has been set, async functions might mark the test as success
        if(this.currentTestName)
            this.setSuccess();
    }

    /**
     * assertNotEquals
     *  Compares 'expected' with 'actual' value.
     * @param {any} expected 
     * @param {any} actual 
     */
    assertNotEquals(expected, actual)
    {
        this.addAssertion();

        // Set ex
        var caughtException = null;

        try
        {
            this.assertEquals(expected, actual, true);
        }
        catch(ex)
        {
            caughtException = ex;

            if(!ex instanceof JSUnitTestException)
                throw ex;
        }

        // Check if exception is caught
        if(caughtException === null)
        {
            // Remove last from results
            this.results.pop();

            // Set failure
            this.setFailedResult(`Failed asserting that '${actual}' is not equal to '${expected}'`);
        }
        else
            this.setSuccess();
    }
}