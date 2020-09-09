const mongoose = require('mongoose')
require('dotenv').config()
const axios = require('axios')

mongoose.connect(process.env.MONGOBD_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, () => {
    console.log('Connected to MongoDB')
})
const DB = require('../../model/acc')
const DB_QUEUE = require('../../model/queue')
const { async } = require('crypto-random-string')

module.exports.account = async (req, res) => {
    const accounts = await DB.find({})
    res.render('vimeo/list', {
        accounts: accounts
    })
}

module.exports.index = (req, res) => {
    res.render('vimeo/index')
}

module.exports.upload = async (req, res) => {
    const data = await DB_QUEUE.find({})
    if (data.length > 0) {
        res.render('vimeo/upload', {
            data: data
        })
    } else {
        res.render('vimeo/upload')
    }
    
}
module.exports.uploadPost = (req, res) => {
    const id = req.body.movieId.trim()
    if (id.length > 0) {
        axios.get(process.env.PHEPHIM_GET + id)
            .then(async response => {
                const ep = response.data.trim().split('<br/>')
                ep.pop()
                const epArr = ep.filter(e => e.includes('https://drive.google.com')).map(e => {
                    return {
                        name: e.split('|')[0],
                        id: e.split('|')[1],
                        videoId: e.split('|')[3].split('/')[5],
                        vimeo: e.includes('https://vimeo.com') ? true : false
                    }
                })
                const newQueue = new DB_QUEUE({
                    movieId: id,
                    data: epArr
                })
                await newQueue.save()
                res.redirect('/vimeo/upload')
            })
    } else {
        console.log('Khong co gi o day ca')
        res.redirect('/vimeo/upload')
    }
    
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

module.exports.state = async (req, res) => {
    const state = await DB_QUEUE.findById(req.query.id)
    if (state) {
        const isFinish = state.data.filter(e => e.vimeo).length
        const percent = Math.floor(isFinish / state.data.length * 100)
        res.json({
            id: state.movieId,
            next: (percent === 100) ? false : true,
            state: state.status,
            total: state.data.length,
            finish: isFinish,
            percent: percent
        })
    } else {{
        res.json({
            id: 'Deleted',
            next: false,
            total: 0,
            finish: 0,
            percent: 100
        })
    }}
    
}

module.exports.delete =  async (req, res) => {
    await DB_QUEUE.findByIdAndDelete(req.query.id, err => {
        if (!err) {
            res.json(1)
        } else res.json(0)
    })
}