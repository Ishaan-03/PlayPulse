class ApiError extends Error {

constructor(
    message ="somthing went wrong",
    statusCode = statusCode,
    errors =[],
    stack =""
    
){
super(message)
this.message = message
this.statusCode = statusCode
this.errors = errors
this.success =false;
this.data= null

if (stack) {
    this.stack =stack
}else[
    Error.captureStackTrace(this, this.constructor)
]
}

}

export {ApiError};