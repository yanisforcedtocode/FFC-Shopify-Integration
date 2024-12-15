import dotenv from "dotenv"
dotenv.config({path: "config.env"})
const app = require('./app')

//============= Server =============//
const server = app.listen(process.env.port, ()=>{
    console.log(`${process.env.AppName} is running on ${process.env.port}`)
})
//============= Uncaught Exception =============//
process.on("uncaughtException", err =>{
    console.log(err.name, err.message)
    console.log("uncaughtException, shutting down");
    process.exit(1)
  })
//============= Unhandled Rejections =============//
process.on("unhandledRejection", (err: Error) =>{
    console.log(err.name, err.message)
    console.log("unhanlded rejection, shutting down");
    server.close(()=>{process.exit(1)})
})