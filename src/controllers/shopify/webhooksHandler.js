"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderCreateHandler = void 0;
const orderCreateHandler = async (req, res) => {
    const orderCreated = req.bodyObj;
    try { }
    catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            data: { customerId: orderCreated.customer.id, message: error }
        });
    }
};
exports.orderCreateHandler = orderCreateHandler;
