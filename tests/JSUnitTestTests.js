/**
 * JSUnitTestTests
 */
class JSUnitTestTests extends JSUnitTest
{
    testIsExpectingException()
    {
        this.expectExceptions[`class.method`] = true;

        this.assertTrue(this.isExpectingException('class','method'));
    }

    testIsExpectingException()
    {
        this.expectExceptions[`class.method`] = true;

        this.assertFalse(this.isExpectingException('class','methodFailure'));
    }

    ////////////////
    // Commented Out: Exception Testing Stops Execution
    ////

    testExpectExceptionTrue()
    {
        this.expectException((new JSUnitTestException).constructor.name);

        throw new JSUnitTestException('Throw!');
    }

    testExpectExceptionExceptsDifferentExceptionFalse()
    {
        try
        {
            // Cannot test?
            // this.expectException((new Exception).constructor.name);

            // throw new JSUnitTestException('Throw!');
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testExpectExceptionExceptsDifferentExceptionFalse'", 'g')).test(ex.getMessage()));
        }
        this.assertTrue(true);
    }

    testExpectExceptionNotThrownFalse()
    {
        try
        {
            // Cannot test?
            // this.expectException((new JSUnitTestException).constructor.name);
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testExpectExceptionNotThrownFalse'", 'g')).test(ex.getMessage()));
        }
        this.assertTrue(true);
    }
    
    testAssertTrueTrue()
    {
        this.assertTrue(true);
    }

    testAssertTrueFalse()
    {
        try
        {
            this.assertTrue(false);
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertTrueFalse'", 'g')).test(ex.getMessage()));
        }
    }

    testAssertFalseTrue()
    {
        this.assertFalse(false);
    }

    testAssertFalseFalse()
    {
        try
        {
            this.assertFalse(true);
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertFalseFalse'", 'g')).test(ex.getMessage()));
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

    testAssertEmptyFalse()
    {
        try
        {
            this.assertEmpty("false");
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEmptyFalse'", 'g')).test(ex.getMessage()));
        }
    }

    testAssertFalseFalse()
    {
        try
        {
            this.assertFalse(true);
        }
        catch(ex)
        {
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertFalseFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertUndefinedFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertNullFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsTypesFailure'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsTypeUndefinedFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsTypeNullFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsTypeFloatFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsTypeIntFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsTypeBooleanFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsFunctionFalse'", 'g')).test(ex.getMessage()));
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
            this.assertTrue((new RegExp("^Test 'JSUnitTestTests.testAssertEqualsStringFalse'", 'g')).test(ex.getMessage()));
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
            let result = (new RegExp("^Test 'JSUnitTestTests.testAssertEqualsArrayFalse'", 'g')).test(ex.getMessage());

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
            let result = (new RegExp("^Test 'JSUnitTestTests.testAssertEqualsLiteralFalse'", 'g')).test(ex.getMessage());

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
            let result = (new RegExp("^Test 'JSUnitTestTests.testAssertEqualsObjectFalse'", 'g')).test(ex.getMessage());

            // Check data
            let actualData = ex.getData().map((item) => { return item.trim(); });
            let expectedData = `Failed asserting that two objects are equal.
            --- Expected.
            +++ Actual.
            JSUnitTestException (
                - [message] => message
                + [message] => message1
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
            let result = (new RegExp("^Test 'JSUnitTestTests.testAssertEqualsNestedObject'", 'g')).test(ex.getMessage());

            // Check data
            let actualData = ex.getData().map((item) => { return item.trim(); });
            let expectedData = `Failed asserting that two arrays are equal.
            --- Expected.
            +++ Actual.
            Array (
                - [1] => 
                        JSUnitTestException (
                            - [message] => message
                            - [data] => undefined
                        )
                + [1] => 
                        JSUnitTestException (
                            - [message] => message
                            + [message] => message1
                        )
            )`
            .split("\n").map((item) => { return item.trim(); });

            // Check result
            this.assertTrue(result && array_equals(actualData, expectedData));
        }
    }
}

class ExampleTestClass extends JSUnitTest
{
    setUpBeforeClass()
    {
        // Executes before tests
    }
    
    setUp()
    {
        // Executes before every test
    }
    
    testHelloWorld()
    {
      let value = "Hello World!";
      
      this.assertEquals("Hello World!", value);
    }
    
    tearDown()
    {
        // Executes after every test
    }
    
    tearDownAfterClass()
    {
        // Executes after tests
    }
}