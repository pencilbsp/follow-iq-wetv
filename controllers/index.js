const mongoose = require('mongoose')
require('dotenv').config()

const getData = require('./getData')
const getTitle = require('./getTitle')
const getEpi = require('./epi')

mongoose.connect(process.env.MONGOBD_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, () => {
    console.log('Connected to MongoDB')
})
const DB_S = require('../model/model')

module.exports.index = async (req, res) => {
    const indexData = await DB_S.find({})
    res.render('index', { title: 'Follow Admin', data: indexData })
}

module.exports.add = async (req, res) => {
    const urlRaw = req.body.url
    namePage = urlRaw.split('/')[2]
    if (namePage == 'www.iq.com') {
        var name = await getTitle.iq(urlRaw)
        var newEpi = getEpi.full(await getData.iq(urlRaw))
        res.json(await getIndex(name, newEpi, urlRaw, req.body.time))
    } else if (namePage == 'fptplay.vn') {
        var name = await getTitle.fptplay(urlRaw)
        var newEpi = await getData.fptplay(urlRaw)
        res.json(await getIndex(name, newEpi, urlRaw, req.body.time))
    } else if (namePage == 'wetv.vip') {
        console.log('wetv.vip')
    } else {
        res.json({ mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!' })
    }
}

module.exports.delete = (req, res) => {
    DB_S.findByIdAndRemove(req.body.id, err => {
        if (err) {
            res.status(500).json({
                mess: `Đã có lỗi xảy ra, vui lòng thử lại sau!`
            })
        } else {
            res.status(200).json({
                mess: `Phim ${req.body.title} đã được xóa khỏi danh sách theo dõi!`
            })
        }
    })
}

module.exports.adit = (req, res) => { }

async function getIndex(name, newEpi, url, time) {
    const item = await DB_S.find({ title: name })
    if (item.length === 0) {
        if (newEpi === 'error') {
            return {
                mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!',
            }
        } else {
            const newFollow = new DB_S({
                title: name,
                url: url,
                data: newEpi,
                time: time
            })
            await newFollow.save()
            const htmlCode = `<tr><td class="name">${name}</td><td class="url"><a href="${url}" target="_blank">${url}</a></td><td>${newEpi.length}</td><td>${time}</td><td><a class="edit" href="#editEmployeeModal" data-url="${url}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit"></i></a><a class="delete" href="#deleteEmployeeModal" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Delete"></i></a></td></tr>`
            return {
                mess: `Phim ${name} đã được thêm vào danh sách theo dõi!`,
                html: htmlCode,
            }
        }
    } else {
        return {
            mess: 'Phim này đã có trong danh sách theo dõi!',
        }
    }
}