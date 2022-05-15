const globalErrorHandler = (err, req, res)=>{
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || `something's happening I can feel it.`
    })
}

module.exports = globalErrorHandler