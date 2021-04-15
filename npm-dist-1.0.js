// Export Modules
module.exports.is_literal_object = function(input) { return input && input.constructor && input.constructor.name.toLowerCase() === "object"; };
module.exports.is_class_object = function(input) { return input && !Array.isArray(input) && input.constructor && input.constructor.name.toLowerCase() !== "object"; };
module.exports.array_has_values = function(array, values)
{
    for(let i = 0; i < values.length; i++)
    {
        if(!array.includes(values[i]))
            return false;
    }
    return true;
}
module.exports.array_equals = function array_equals(array1, array2)
{
    return array_has_values(array1, array2) && array_has_values(array2, array1);
}
module.exports.gettype = function(input)
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
module.exports.is_object_type = function(type)
{
    let temp = (new RegExp('object<([a-z0-9\_]+)>','gi')).exec(type);
    if(temp === null)
        return false;
    else
        return temp[1];
}

/**
 * JSUnitTestException
 */
class JSUnitTestException 
{
    message;
    data;

    constructor(message, data) 
    {
        this.message = message;
        this.data = data;
    }
    
    getMessage()
    {
        return this.message;
    }

    getData()
    {
        return this.data;
    }
}

/**
 * JSUnitTest
 */
class JSUnitTest
{
    objectReferences = []; // Prevent Maximum call stack size exceeded
    assertions = [];
    expectExceptions = [];

    /**
     * getFunctionNames
     * @returns 
     */
    static getFunctionNames(object)
    {
        let functionNames = [];
        Object.getOwnPropertyNames(object.__proto__.__proto__).forEach((prop) =>
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
        let functionNames = JSUnitTest.getFunctionNames(object);
        let callingObject = object.constructor.name;

        // Throw Exception to Extract function caller name
        try
        {
            throw new Error();
        }
        catch (e)
        {
            let split = e.stack.split("\n");

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

                if(child[1] === callingObject && !functionNames.includes(child[2]))
                    return true;
                else
                    return false;
            });

            // Return result
            let info = result.pop().slice(1);
            
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
}

/**
 * JSUnitTestRunner
 */
class JSUnitTestRunner
{
    static LOG_BREAK_AFTER_TESTS = 50;
    static version = '1.0';
    static runnerClass;
    
    testClasses;
    start;
    end;
    delta;
    tests;
    success;
    assertions;
    log;
    logStyles;

    /**
     * constructor
     */
    constructor()
    {
        this.testClasses = [];
        this.start = null;
        this.end = null;
        this.delta = null;
        this.tests = [];
        this.success = 0;
        this.assertions = [];
        this.log = "";
        this.logStyles = [];
    }

    /**
     * addTest
     * @param {JSUnitTest} testClass 
     */
    addTest(testClass)
    {
        this.testClasses.push(testClass);
    }    

    /**
     * createTestsArray
     */
    createTestsArray()
    {
        this.testClasses.forEach((testClass) =>
        {
            Object.getOwnPropertyNames(testClass.__proto__).forEach((prop) =>
            {
                if((new RegExp('^test','g')).test(prop))
                    this.tests.push(testClass[prop]);
            })
        });
    }

    /**
     * addLog
     * @param {*} message 
     * @param {*} style 
     */
    addLog(message, style = 'background: white; color: black; font-weight: normal')
    {
        // Add line break after JSUnitTestRunner.LOG_BREAK_AFTER_TESTS tests
        if(this.logStyles.length%JSUnitTestRunner.LOG_BREAK_AFTER_TESTS == 0 && this.logStyles.length !== 0)
            this.log += `%c${message}\n`;
        else
            this.log += `%c${message}`;
        
        // Add style
        this.logStyles.push(style);
    }

    /**
     * printLog
     */
    printLog()
    {
        console.log(this.log, ...this.logStyles);
    }

    /**
     * runTests
     */
    runTests(verbose = false)
    {   
        // Set start
        this.start = (new Date()).getTime();

        // Create array
        this.createTestsArray();

        // Execute
        this.testClasses.forEach((testClass) =>
        {
            // Check if setUpBeforeClass has been defined
            if(testClass.setUpBeforeClass)
                testClass.setUpBeforeClass();

            // Execute tests
            Object.getOwnPropertyNames(testClass.__proto__).forEach((prop) =>
            {
                // Set props
                let className = testClass.constructor.name;
                let methodName = prop;

                // Check if function is testFunction
                if((new RegExp('^test','g')).test(methodName))
                {
                    // Check if setUp has been defined
                    if(testClass.setUp)
                        testClass.setUp();

                    // Create temp var
                    let result = null;
                    var thrownException = false;

                    // Execute test
                    try
                    {
                        result = testClass[methodName]();
                    }
                    catch(ex)
                    {
                        // Check if exception was expected
                        thrownException = testClass.isExpectingException(className, methodName);

                        if(thrownException !== false)
                        {
                            if(ex.constructor.name !== thrownException.exception)
                                testClass.throwException(thrownException, `failed asserting that exception of type '${thrownException.exception}' is thrown, received ${ex.constructor.name}`);
                        }
                        else
                        {
                            // Re-throw
                            throw ex;
                        }
                    }

                    // Check if an exception should have been thrown, but was not
                    var shouldHaveCaughtException = testClass.isExpectingException(className, methodName);

                    // Throw Failure
                    if(thrownException === false && shouldHaveCaughtException !== false)
                        testClass.throwException(shouldHaveCaughtException, `failed asserting that exception of type '${shouldHaveCaughtException.exception}' is thrown`);
                    
                    // Add success
                        this.success += 1;

                    // Check if test is in assertions
                    if(!testClass.assertions.includes(`${testClass.constructor.name}.${methodName}`))
                    {
                        if(this.verbose)
                            console.log(`%c${methodName}: No Assertion (${this.success}/${this.tests.length})`, 'background: #e5e510; color: black; font-weight: bolder');
                        else
                            this.addLog(`R`, 'background: #e5e510; color: black; font-weight: bolder');
                    }
                    else
                    {
                        if(this.verbose)
                            console.log(`${methodName}: Success (${this.success}/${this.tests.length})`);
                        else
                            this.addLog(`.`);
                    }

                    // Check if setUp has been defined
                    if(testClass.tearDown)
                        testClass.tearDown();
                }
            });

            // Check if tearDownAfterClass has been defined
            if(testClass.tearDownAfterClass)
                testClass.tearDownAfterClass();

            // Add assertions
            this.assertions = [...this.assertions, ...testClass.assertions];
        });

        // Check if verbose is off
        if(!this.verbose)
            this.printLog();

        // Check if test was success
        if(this.success === this.tests.length)
        {
            // Get exec delta
            this.end = (new Date()).getTime();
            this.delta = (new Date()).setTime(this.end - this.start);

            // Display exec time
            console.log(`Time: ${this.delta} ms`);

            // Check if every test has assertion
            if(this.tests.length === this.assertions.length)
                console.log(`%c OK (${this.tests.length} ${this.tests.length === 1 ? 'test':'tests'}, ${this.assertions.length} ${this.assertions.length === 1 ? 'assertion':'assertions'}) `, 'line-height: 1.1rem; background: #0dbc79; color: black; font-weight: bolder');
            else
                console.log(`%c OK, but incomplete, skipped, or risky tests! \n Tests: ${this.tests.length}, Assertions: ${this.assertions.length}) `, 'line-height: 1.1rem; background: #e5e510; color: black; font-weight: bolder');
        }
    }

    /**
     * getUserAgent
     * @returns {string}
     */
    static getUserAgent()
    {
        return navigator.userAgent.replaceAll(')', ')\n').split("\n").map((p,i)=>{ return `${i==0?'\t'.repeat(0):'\t'.repeat(3)}${p.trim()}`; }).join("\n");
    }

    /**
     * showJSUnitInfo
     */
    static showJSUnitInfo()
    {
        console.log(`%c\n JSUnit ${JSUnitTestRunner.version} by Gijs Bos and contributors. \n\n Runtime:\t${JSUnitTestRunner.getUserAgent()} \n`, 'line-height: 1.1rem');
    }

    /**
     * runner
     *  Define JSUnitTestRunner by adding JSUnitTest Classes.
     * 
     * @param {Function} callable - function that receives a JSUnitTestRunner Class as argument.
     * 
     * Example Usage:
     // Define Runner
        JSUnitTestRunner.runner((runner) =>
        {
            // Add test class files
            runner.addTest(new JSUnitTestTests());
        });

        // Run tests
        JSUnitTestRunner.run();
    */
    static runner(callable)
    {
        // Create runner
        JSUnitTestRunner.runnerClass = new JSUnitTestRunner();

        // Run callable
        callable(JSUnitTestRunner.runnerClass);

        // Set run
        JSUnitTestRunner.run = (verbose = false) =>
        {
            // Set verbose
            JSUnitTestRunner.runnerClass.verbose = verbose;

            // Show info
            JSUnitTestRunner.showJSUnitInfo();

            try
            {
                JSUnitTestRunner.runnerClass.runTests();
            }
            catch(ex)
            {
                if(ex instanceof JSUnitTestException)
                {
                    // Print data
                    if(ex.getData() && gettype(ex.getData()) == "array")
                        console.log(...ex.getData());
            
                    // Report failure
                    console.log(`${ex.getMessage()}`);
                }
                else
                    throw ex;
            }
        };
    }
}

module.exports.JSUnitTestException = JSUnitTestException;
module.exports.JSUnitTest = JSUnitTest;
module.exports.JSUnitTestRunner = JSUnitTest;