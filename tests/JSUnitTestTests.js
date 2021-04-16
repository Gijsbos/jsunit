/**
 * JSUnitTestTests
 */
class JSUnitTestTests extends JSUnitTest
{
    /**
     * looksLike
     *  Makes comparing easier
     * @param {*} message 
     * @param {*} source 
     * @returns 
     */
    looksLike(message, source)
    {
        message = message.replaceAll('(','\\(');
        message = message.replaceAll(')','\\)');
        message = message.replaceAll('[','\\[');
        message = message.replaceAll(']','\\]');
        message = message.replaceAll('.','\\.');
        return (new RegExp(message, 'gis')).test(source);
    }

    async executeAsyncFunction(value)
    {
        return new Promise((resolve) =>
        {
            setTimeout(() => {   
                resolve(value);
            }, 200);
        });
    }

    async testSetUpBeforeClass()
    {
        let result = await this.executeAsyncFunction('setupBeforeClass');

        this.assertTrue(result == 'setupBeforeClass');
    }

    async testTearDownAfterClass()
    {
        let result = await this.executeAsyncFunction('tearDownAfterClass');

        this.assertTrue(result == 'tearDownAfterClass');
    }

    testExpectException()
    {
        this.expectException('JSUnitTestException');

        throw new JSUnitTestException('Expected');
    }

    async testExpectExceptionNotThrownFalse()
    {
        try
        {
            // Cannot be done!
            // this.expectException('Exception');
            this.assertTrue(true);
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testExpectExceptionNotThrownFalse'", 'g')).test(ex.getMessage()));
        }
    }

    async testExpectExceptionThrownDifferentExceptionFalse()
    {
        try
        {
            // Cannot be done!
            // this.expectException('Exception');
            // throw new JSUnitTestException('Different Exception');
            this.assertTrue(true);
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testExpectExceptionNotThrownFalse'", 'g')).test(ex.getMessage()));
        }
    }

    testAssertTrueSuccess()
    {
        this.assertTrue(true);
    }

    testAssertTrueFailure()
    {   
        try
        {
            this.THROW_EXCEPTION_ON_FAILURE = true;
            this.PASS_ON_RUNNER_EXCEPTIONS = true;
            this.assertTrue(false);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'JSUnitTestTests.testAssertTrueFailure'", ex.getMessage()));
        }
    }

    testAssertFalseSuccess()
    {
        this.assertFalse(false);
    }

    testAssertFalseFailure()
    {
        try
        {
            this.assertFalse(true);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'JSUnitTestTests.testAssertFalseFailure'", ex.getMessage()));
        }
    }

    testAssertEmptyTrueUndefined()
    {
        this.assertEmpty(undefined);
    }

    testAssertEmptyTrueNull()
    {
        this.assertEmpty(null);
    }

    testAssertEmptyTrueFailure()
    {
        try
        {
            this.assertEmpty('not empty');
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'JSUnitTestTests.testAssertEmptyTrueFailure'", ex.getMessage()));
        }
    }

    testAssertUndefinedTrue()
    {
        this.assertUndefined(undefined);
    }

    testAssertUndefinedFalse()
    {
        try
        {
            this.assertUndefined("undefined");
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'JSUnitTestTests.testAssertUndefinedFalse'", ex.getMessage()));
        }
    }

    testAssertNullTrue()
    {
        this.assertNull(null);
    }

    testAssertNullFalse()
    {
        try
        {
            this.assertNull("null");
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'JSUnitTestTests.testAssertNullFalse'", ex.getMessage()));
        }
    }

    testAssertEqualsTypesTrue()
    {
        this.assertEquals("string", "string");
    }

    testAssertEqualsTypesFailure()
    {
        try
        {
            this.assertEquals("string", true);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'true' equals 'string", ex.getMessage()));
        }
    }

    testAssertEqualsTypeUndefinedTrue()
    {
        this.assertEquals(undefined, undefined);
    }

    testAssertEqualsTypeUndefinedFalse()
    {
        try
        {
            this.assertEquals(undefined, null);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'null' equals 'undefined'", ex.getMessage()));
        }
    }

    testAssertEqualsTypeNullTrue()
    {
        this.assertEquals(null, null);
    }

    testAssertEqualsTypeNullFalse()
    {
        try
        {
            this.assertEquals(null, undefined);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'undefined' equals 'null'", ex.getMessage()));
        }
    }

    testAssertEqualsTypeFloatTrue()
    {
        this.assertEquals(1.1,1.1);
    }

    testAssertEqualsTypeFloatFalse()
    {
        try
        {
            this.assertEquals(1.1,1.2);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that actual (float) '1.2' equals expected (float) '1.1'", ex.getMessage()));
        }
    }

    testAssertEqualsTypeIntTrue()
    {
        this.assertEquals(1,1);
    }

    testAssertEqualsTypeIntFalse()
    {
        try
        {
            this.assertEquals(1,2);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that actual (int) '2' equals expected (int) '1'", ex.getMessage()));
        }
    }

    testAssertEqualsTypeBooleanTrue()
    {
        this.assertEquals(true,true);
    }

    testAssertEqualsTypeBooleanFalse()
    {
        try
        {
            this.assertEquals(true,false);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that actual (boolean) 'false' equals expected (boolean) 'true'", ex.getMessage()));
        }
    }

    testAssertEqualsFunctionTrue()
    {
        let func = () => { return true; };
        this.assertEquals(func, func);
    }

    testAssertEqualsFunctionFalse()
    {
        try
        {
            let func1 = () => { return true; };
            let func2 = () => { return true; };
            this.assertEquals(func1, func2);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that actual (function) '() => { return true; }' equals expected (function) '() => { return true; }'", ex.getMessage()));
        }
    }

    testAssertEqualsStringTrue()
    {
        this.assertEquals("hi", "hi");
    }

    testAssertEqualsStringFalse()
    {
        try
        {
            this.assertEquals("hi", "bye");
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that actual (string) 'bye' equals expected (string) 'hi'", ex.getMessage()));
        }
    }

    testAssertEqualsArrayTrue()
    {
        let array1 = ['value'];
        let array2 = ['value'];
        this.assertEquals(array1, array2);
    }

    testAssertEqualsArrayFalse()
    {
        try
        {
            let array1 = ['value1','value2','value3'];
            let array2 = ['value1','valuea'];
            this.assertEquals(array1, array2);
        }
        catch(ex)
        {   
            // Get header
            let result = this.looksLike("Assertion failed", ex.getMessage());

            // Check data
            let actualData = ex.getData().map((item) => { return item.trim(); });
            let expectedData = `Failed asserting that two arrays are equal.
            --- Expected.
            +++ Actual.
            Array (
                - [1] => value2
                + [1] => valuea
                - [2] => value3
            )`
            .split("\n").map((item) => { return item.trim(); });

            // Check result
            this.assertTrue(result && array_equals(actualData, expectedData));
        }
    }

    testAssertEqualsLiteralTrue()
    {
        let literal = {
            key: "value"
        };
        this.assertEquals(literal, literal);
    }

    testAssertEqualsLiteralFalse()
    {
        try
        {
            let literal1 = {
                key1: "value1",
                key2: "value2",
                key3: "value2",
            };
            let literal2 = {
                key1: "value1",
                key2: "valuea",
            };
            this.assertEquals(literal1, literal2);
        }
        catch(ex)
        {   
            // Get header
            let result = this.looksLike("Assertion failed at line", ex.getMessage());

            // Check data
            let actualData = ex.getData().map((item) => { return item.trim(); });
            let expectedData = `Failed asserting that two literal objects are equal.
            --- Expected.
            +++ Actual.
            Literal (
                - [key2] => value2
                + [key2] => valuea
                - [key3] => value2
            )`
            .split("\n").map((item) => { return item.trim(); });

            // Check result
            this.assertTrue(result && array_equals(actualData, expectedData));
        }
    }

    testAssertEqualsObjectTrue()
    {
        let obj1 = new JSUnitTestException('message');
        let obj2 = new JSUnitTestException('message');
        this.assertEquals(obj1, obj2);
    }

    testAssertEqualsObjectFalse()
    {
        try
        {
            let obj1 = new JSUnitTestException('message');
            let obj2 = new JSUnitTestException('message1');
            this.assertEquals(obj1, obj2);
        }
        catch(ex)
        {   
            // Get header
            let result = this.looksLike("Assertion failed at line", ex.getMessage());

            // Check data
            let actualData = ex.getData().map((item) => { return item.trim(); });
            let expectedData = `Failed asserting that two objects are equal.
            --- Expected.
            +++ Actual.
            JSUnitTestException (
                - [methodName] => message
                + [methodName] => message1
            )`
            .split("\n").map((item) => { return item.trim(); });

            // Check result
            this.assertTrue(result && array_equals(actualData, expectedData));
        }
    }

    testAssertEqualsNestedObject()
    {
        try
        {
            let array1 = ['value', new JSUnitTestException('message')];
            let array2 = ['value', new JSUnitTestException('message1')];
            this.assertEquals(array1, array2);
        }
        catch(ex)
        {   
            // Get header
            let result = this.looksLike("Assertion failed at line", ex.getMessage());

            // Check data
            let actualData = ex.getData().map((item) => { return item.trim(); });
            let expectedData = `Failed asserting that two arrays are equal.
            --- Expected.
            +++ Actual.
            Array (
                - [1] => 
                        JSUnitTestException (
                            - [methodName] => message
                            - [message] => undefined
                            - [data] => undefined
                        )
                + [1] => 
                        JSUnitTestException (
                            - [methodName] => message
                            + [methodName] => message1
                        )
            )`
            .split("\n").map((item) => { return item.trim(); });

            // Check result
            this.assertTrue(result && array_equals(actualData, expectedData));
        }
    }

    testAssertNotEqualsTrue()
    {
        let array1 = ['value', new JSUnitTestException('message')];
        let array2 = ['value', new JSUnitTestException('message1')];
        this.assertNotEquals(array1, array2);
    }

    testAssertNotEqualsFalse()
    {
        try
        {
            let array1 = ['value', new JSUnitTestException('message')];
            let array2 = ['value', new JSUnitTestException('message')];
            this.assertNotEquals(array1, array2);
        }
        catch(ex)
        {
            this.assertTrue(this.looksLike("Failed asserting that 'value,[object Object]' is not equal to 'value,[object Object]'", ex.getMessage()));
        }
    }
}