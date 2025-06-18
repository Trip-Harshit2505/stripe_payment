const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    sessionId : String,
    productId : String,
    transaction: {
        status: Boolean,
        amount: {
            type: Number,
            default: 0
        }
    },
    transactionId : String
})

module.exports = mongoose.model('Cart', cartSchema);;