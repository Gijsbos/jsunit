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