const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    title: {
        type: String
    },
    url: {
        type: String
    },
    data: {
        type: Array
    }
})

module.exports = mongoose.model('follow_db', dataSchema);