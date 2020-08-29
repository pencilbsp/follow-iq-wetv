const mongoose = require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGOBD_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, () => {
    console.log('Connected to MongoDB')
})
const DB = require('../model/model')
const { index } = require('.')



async function getEpi() {
    const newEpi = ['1', '2', '3A']
    const { data } = await DB.findById('5f4a723bcc17936d5300f693', { data: 1 })
    const diff = data.filter(e => {
        newEpi.includes(e)
    })
    console.log(diff)
}

getEpi()