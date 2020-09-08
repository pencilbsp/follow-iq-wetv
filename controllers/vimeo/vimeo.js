const mongoose = require('mongoose')
require('dotenv').config()
const axios = require('axios')

mongoose.connect(process.env.MONGOBD_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, () => {
    console.log('Connected to MongoDB')
})
const DB = require('../../model/acc')
const { response } = require('express')

module.exports.account = async (req, res) => {
    const accounts = await DB.find({})
    res.render('vimeo/list', {
        accounts: accounts
    })
}

module.exports.index = (req, res) => {
    res.render('vimeo/index')
}

module.exports.upload = (req, res) => {
    res.render('vimeo/upload')
}
module.exports.uploadPost = (req, res) => {
    const id = req.body.movieId
    axios.get(process.env.PHEPHIM_GET + id)
        .then(response => {
            const ep = response.data.trim().split('<br/>')
            ep.pop()
            const epArr = ep.map(e => {
                return {
                    name: e.split('|')[0],
                    id: e.split('|')[1],
                    videoId: e.split('|')[3].split('/')[5],
                    vimeo: e.includes('https://vimeo.com') ? true : false
                }
            })
            res.json(epArr)
        })
}

module.exports.add = (req, res) => {
    res.render('vimeo/add')
}
module.exports.addPost = async (req, res) => {
    const newAccount = new DB({
        userId: req.body.userId,
        authKey: req.body.userAuthKey
    })
    await newAccount.save(err => {
        if (!err) res.redirect('/vimeo/accounts')
    })
}