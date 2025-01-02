"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "config.env" });
const app = require('./app');
//============= Server =============//
const server = app.listen(process.env.PORT || 8080, () => {
    console.log(`${process.env.AppName} is running on ${process.env.PORT}`);
});
//============= Uncaught Exception =============//
process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    console.log("uncaughtException, shutting down");
    process.exit(1);
});
//============= Unhandled Rejections =============//
process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("unhanlded rejection, shutting down");
    server.close(() => { process.exit(1); });
});
