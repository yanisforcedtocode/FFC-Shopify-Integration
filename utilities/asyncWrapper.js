const asyncWrapper = (fn)=>{
    return async(req, res, next)=>{ 
        fn(req, res, next).catch((e)=>{
        next(e)})
    }
}
module.exports = asyncWrapper