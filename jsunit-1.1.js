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

/**
 * JSUnitTestException
 */
class JSUnitTestException 
{
    /**
     * constructor
     * @param {*} methodName 
     * @param {*} message 
     * @param {*} data 
     */
    constructor(methodName, message, data) 
    {
        this.methodName = methodName;
        this.message = message;
        this.data = data;
    }

    /**
     * getMethodName
     * @returns 
     */
    getMethodName()
    {
        return this.methodName;
    }
    
    /**
     * getMessage
     * @returns 
     */
    getMessage()
    {
        return this.message;
    }

    /**
     * getData
     * @returns 
     */
    getData()
    {
        return this.data;
    }
}

/**
 * JSTestResult
 */
class JSTestResult
{
    /**
     * constructor
     * @param {*} className 
     * @param {*} methodName 
     * @param {*} success 
     * @param {*} message 
     * @param {*} data 
     */
    constructor(className, methodName, success = true, message, data)
    {
        this.className = className;
        this.methodName = methodName;
        this.success = success;
        this.message = message ? message : null;
        this.data = data ? data : null;
    }
}

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
    setFailedResult(message, data)
    {
        let lineInfo = this.getLineInfo();
        var message = lineInfo ? `${message} at line ${lineInfo}` : message;

        if(this.THROW_EXCEPTION_ON_FAILURE)
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
    assertEquals(expected, actual)
    {
        this.addAssertion();

        // Check type
        let expectedType = gettype(expected);
        let actualType = gettype(actual);

        // Check type
        if(expectedType !== actualType)
            return this.setFailedResult(`Failed asserting that '${actual}' equals '${expected}'`);

        // Create temp var for class objects
        let objectType = null;

        // Switch
        switch(true)
        {
            case actualType == "float":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (float) '${actual}' equals expected (float) '${expected}'`);
            break;
            case actualType == "int":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (int) '${actual}' equals expected (int) '${expected}'`);
            break;
            case actualType == "boolean":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (boolean) '${actual}' equals expected (boolean) '${expected}'`);
            break;
            case actualType == "function":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (function) '${actual}' equals expected (function) '${expected}'`);
            break;
            case actualType == "string":
                if(expected != actual)
                    return this.setFailedResult(`Failed asserting that actual (string) '${actual}' equals expected (string) '${expected}'`);
            break;
            case actualType == "array":
                let arrayReport = this.compareArray(expected, actual);
                if(arrayReport !== true)
                {
                    arrayReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two arrays are equal.\n\r--- Expected.\n\r+++ Actual.\n`, arrayReport);
                    return this.setFailedResult("Assertion failed", arrayReport);
                }
            break;
            case actualType == "literal":
                let literalReport = this.compareLiteral(expected, actual);
                if(literalReport !== true)
                {
                    literalReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two literal objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`, literalReport);
                    return this.setFailedResult("Assertion failed", literalReport);
                }
            break;
            case (objectType = is_object_type(actualType)) !== false:
                let classReport = this.compareObject(expected, actual, objectType);
                if(classReport !== true)
                {
                    classReport = this.addAssertEqualsObjectDiffText(`Failed asserting that two objects are equal.\n\r--- Expected.\n\r+++ Actual.\n`, classReport);
                    return this.setFailedResult("Assertion failed", classReport);
                }
            break;
            default:
                if(expected != actual)
                    return this.setFailedResult(`actual (unknown) '${actual}' does not meet expected (unknown) '${expected}'`);
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
            this.assertEquals(expected, actual);
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

/**
 * JSUnitTestRunner
 */
class JSUnitTestRunner
{
    /**
     * constructor
     */
    constructor()
    {
        this.LOG_BREAK_AFTER_TESTS = 50;
        this.SHOW_TEST_START_END = false;
        this.version = '1.0';
        this.runnerClass = null;
        this.testClasses = [];
        this.log = "";
        this.logStyles = [];
        this.assertions = [];
        this.results = [];
        this.success = 0;
        this.failures = 0;
        this.skipped = 0;
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
    async createTestsArray(testClass)
    {
        return new Promise((resolve) =>
        {
            let tests = [];
            Object.getOwnPropertyNames(testClass.__proto__).forEach((prop) => {
                if((new RegExp('^test','g')).test(prop))
                    tests.push([testClass,testClass[prop]]);
            })
            resolve(tests);
        })
    }

    /**
     * runSetUpBeforeClass
     * @param {*} testClass 
     */
    async runSetUpBeforeClass(testClass)
    {
        return new Promise(async (resolve) =>
        {
            if(testClass.setUpBeforeClass)
                await testClass.setUpBeforeClass();

            resolve();
        })
    }

    /**
     * runSetUpBeforeClass
     * @param {*} testClass 
     */
    async runTearDownAfterClass(testClass)
    {
        return new Promise(async (resolve) =>
        {
            if(testClass.tearDownAfterClass)
                testClass.tearDownAfterClass();

            resolve();
        })
    }

    /**
     * runSetUp
     * @param {*} testClass 
     * @returns 
     */
    async runSetUp(testClass)
    {
        return new Promise(async (resolve) =>
        {
            if(testClass.setUp)
                await testClass.setUp();

            resolve();
        })
    }

    /**
     * runTearDown
     * @param {*} testClass 
     * @returns 
     */
    async runTearDown(testClass)
    {
        return new Promise(async (resolve) =>
        {
            if(testClass.tearDown)
                await testClass.tearDown();

            resolve();
        })
    }

    /**
     * isAsyncMethod
     * @param {*} method 
     * @returns 
     */
    isAsyncMethod(method)
    {
        const AsyncFunction = (async () => {}).constructor;

        return method instanceof AsyncFunction === true
    }

    /**
     * runTests
     */
    async runTests(tests)
    {
        return new Promise(async (resolve) =>
        {
            let test = tests.shift();
            
            // Check test
            if(test)
            {
                // Get methodName
                let testClass = test[0];
                let testMethod = test[1];
                let methodName = testMethod.name;

                // Check if method is async
                if(this.isAsyncMethod(testMethod))
                {
                    //Start 
                    if(this.SHOW_TEST_START_END) console.log(`Start\t${methodName}`);

                    // SetUp
                    await this.runSetUp(testClass);

                    // Set current func
                    testClass.currentTestName = methodName;

                    // Create temp
                    var receivedException = false;

                    try
                    {
                        await testClass[methodName]();
                    }
                    catch(exception)
                    {
                        if(testClass.PASS_ON_RUNNER_EXCEPTIONS)
                            throw exception;

                        receivedException = testClass.handleReceivedException(methodName, exception);
                    }

                    // Check if assertion was provided
                    if(!testClass.hasAssertion(methodName))
                        testClass.setSkipped(methodName);

                    // Check if we should have received exception
                    if(receivedException === false)
                        testClass.shouldHaveThrownException(methodName);
                        
                    // End
                    if(this.SHOW_TEST_START_END) console.log(`End\t\t${methodName}`);
                    
                    // Reset
                    testClass.currentTestName = null;
                    
                    // TearDown
                    await this.runTearDown(testClass);
                    
                    // Repeat
                    await this.runTests(tests);

                    // Resolve
                    resolve(true);
                }
                else
                {
                    //Start 
                    if(this.SHOW_TEST_START_END) console.log(`Start\t${methodName}`);

                    // SetUp
                    await this.runSetUp(testClass);

                    // Set current func
                    testClass.currentTestName = methodName;

                    // Create temp
                    var receivedException = false;

                    try
                    {
                        testClass[methodName]();
                    }
                    catch(exception)
                    {
                        if(testClass.PASS_ON_RUNNER_EXCEPTIONS)
                            throw exception;

                        receivedException = testClass.handleReceivedException(methodName, exception);
                    }

                    // Check if assertion was provided
                    if(!testClass.hasAssertion(methodName))
                        testClass.setSkipped(methodName);

                    // Check if we should have received exception
                    if(receivedException === false)
                        testClass.shouldHaveThrownException(methodName);

                    // End
                    if(this.SHOW_TEST_START_END) console.log(`End\t\t${methodName}`);

                    // Reset
                    testClass.currentTestName = null;

                    // TearDown
                    await this.runTearDown(testClass);

                    // Repeat
                    await this.runTests(tests);

                    // Resolve
                    resolve(true);
                }
            }
            else
            {
                resolve('done');
            }
        });
    }

    /**
     * runTestClasses
     * @returns 
     */
    async runTestClasses()
    {
        return new Promise(async (resolve) =>
        {
            // Get testClass
            let testClass = this.testClasses.shift();

            // Check test
            if(testClass)
            {
                // Create test
                let tests = await this.createTestsArray(testClass);

                // Check if setUpBeforeClass has been defined
                await this.runSetUpBeforeClass(testClass);

                // Execute tests
                await this.runTests(tests);

                // Check if tearDownAfterClass has been defined
                await this.runTearDownAfterClass(testClass);

                // Continue, add results
                this.runTestClasses().then(() =>
                {
                    this.results = [...this.results, ...testClass.results];
                    this.assertions = [...this.assertions, ...testClass.assertions];
                    resolve('done');
                });
            }
            else
            {
                resolve('done');
            }
        });
    }

    /**
     * getUserAgent
     * @returns {string}
     */
    getUserAgent()
    {
        return navigator.userAgent.replaceAll(')', ')\n').split("\n").map((p,i)=>{ return `${i==0?'\t'.repeat(0):'\t'.repeat(3)}${p.trim()}`; }).join("\n");
    }

    /**
     * showJSUnitInfo
     */
    showJSUnitInfo()
    {
        console.log(`%c\n JSUnit ${this.version} by Gijs Bos and contributors. \n\n Runtime:\t${this.getUserAgent()} \n`, 'line-height: 1.1rem');
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
     * printResults
     */
    printResults()
    {
        // Add logs
        this.results.forEach((result) =>
        {
            if(result.success)
            {
                this.success += 1;
                this.addLog(".");
            }
            else if (result.success === null)
            {
                this.skipped += 1;
                this.addLog(`R`, 'background: #e5e510; color: black; font-weight: bolder');
            }
            else
            {
                this.failures += 1;
                this.addLog("F", 'background: #ff1616; color: white; font-weight: bolder');
            }
        });

        // Print log
        this.printLog();

        // Print failure messages
        this.results.forEach((result) =>
        {
            if(!result.success)
            {   
                // Print data
                if(result.data && gettype(result.data) == "array")
                    console.log(...result.data);

                // Report failure
                if(result.message)
                    console.log(`${result.message}`);
            }
        });
    }

    /**
     * startRunner
     */
    async startRunner()
    {
        // Show info
        this.showJSUnitInfo();

        // Set start
        let start = (new Date()).getTime();

        // Run tests
        await this.runTestClasses();

        // Done
        this.printResults();

        // Get exec delta
        let end = (new Date()).getTime();
        let delta = (new Date()).setTime(end - start);

        // Display exec time
        console.log(`Time: ${delta} ms`);

        // Check if every test has assertion
        if(this.success === this.results.length)
        {
            console.log(`%c OK (${this.results.length} ${this.results.length === 1 ? 'test':'tests'}, ${this.assertions.length} ${this.assertions.length === 1 ? 'assertion':'assertions'}) `, 'line-height: 1.1rem; background: #0dbc79; color: black; font-weight: bolder');
        }
        else
        {
            if(this.failures > 0)
                console.log(`%c FAILURES! \n Tests: ${this.results.length}, Assertions: ${this.assertions.length}, Failures: ${this.failures} `, 'line-height: 1.1rem; background: #ff1616; color: white; font-weight: bolder');
            else
                console.log(`%c OK, but incomplete, skipped, or risky tests! \n Tests: ${this.results.length}, Assertions: ${this.assertions.length}) `, 'line-height: 1.1rem; background: #e5e510; color: black; font-weight: bolder');
        }       
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

            // Run!
            JSUnitTestRunner.runnerClass.startRunner();
        };
    }
}