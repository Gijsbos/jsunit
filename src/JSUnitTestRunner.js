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