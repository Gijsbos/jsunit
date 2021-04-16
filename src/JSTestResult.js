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