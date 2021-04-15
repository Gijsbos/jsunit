# JSUnit
JSUnit for creating JavaScript unit tests.  

After JUnit and PHPUnit it feels only natural to introduce JSUnit.  
As the name suggests, JSUnit allows you to create JavaScript tests.

### Creating a JSUnitTest class
**ExampleTestClass.js**
```
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
```

### Executing tests
**TestSuite.js**
```
// Add test files
JSUnitTestRunner.runner((runner) =>
{
    // Add test class files
    runner.addTest(new ExampleTestClass());
});

// Run
JSUnitTestRunner.run();
```
**Output**
```
JSUnit 1.0 by Gijs Bos and contributors.

Runtime:  Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3)
          AppleWebKit/537.36 (KHTML, like Gecko)
          Chrome/89.0.4389.114 Safari/537.36

.

Time: 1ms

OK (1 test, 1 assertion) 
```

### Assertions
- assertTrue(value: boolean) - Success when 'value' asserts to *true*  
- assertFalse(value: boolean) - Success when 'value' asserts to *false*  
- assertEmpty(value: any) - Success when 'value' asserts to *undefined* or *null*  
- assertUndefined(value: any) - Success when 'value' asserts to *undefined*  
- assertNull(value: any) - Success when 'value' asserts to *null*   
- assertEquals(expected: any, actual: any) - Success when 'actual' quals 'expected'  
- expectException(exception: string|Object) - Success when exception is thrown that matches exception name or object type  
