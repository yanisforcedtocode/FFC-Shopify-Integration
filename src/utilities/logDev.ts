export const logDev = (log: any)=>{
    if(process.env.NODE_ENV === 'production')return
    if(process.env.NODE_ENV === 'test')return
    console.log(log)
}
