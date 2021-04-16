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