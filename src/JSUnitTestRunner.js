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