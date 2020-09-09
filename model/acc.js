const mongoose = require('mongoose');

const vimeoSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    authKey: {
        type: String,
        required: true
    },
    active: {
        type: Boolean
    }
})

module.exports = mongoose.model('Vimeo', vimeoSchema);