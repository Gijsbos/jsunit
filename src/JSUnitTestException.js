/**
 * JSUnitTestException
 */
class JSUnitTestException 
{
    /**
     * constructor
     * @param {*} message 
     * @param {*} data 
     */
    constructor(message, data) 
    {
        this.message = message;
        this.data = data;
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