const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    movieId: {
        type: String,
        required: true
    },
    data: {
        type: Array,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    error: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Queue', queueSchema);