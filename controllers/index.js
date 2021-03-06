const mongoose = require('mongoose')
require('dotenv').config()

const getData = require('./getData')
const getTitle = require('./getTitle')

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
        let name = await getTitle.iq(urlRaw)
        let newEpi = await getData.iq(urlRaw)
        res.json(await getIndex(name, newEpi, urlRaw, req.body.time))
    } else if (namePage == 'fptplay.vn') {
        let name = await getTitle.fptplay(urlRaw)
        let newEpi = await getData.fptplay(urlRaw)
        res.json(await getIndex(name, newEpi, urlRaw, req.body.time))
    } else if (namePage == 'wetv.vip') {
        const proxyUrl = process.env.PROXY_URL + urlRaw
        let name = await getTitle.fptplay(proxyUrl)
        let newEpi = await getData.wetv(proxyUrl)
        res.json(await getIndex(name, newEpi, urlRaw, req.body.time))
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

module.exports.edit = async (req, res) => {
    const newTitle = req.body.newTitle
    if ((newTitle.trim() !== '') && (newTitle !== req.body.title)) {
        await DB_S.findByIdAndUpdate(req.body.id, {title: newTitle}, (err, data) => {
            if (err) {
                res.status(500).json({
                    mess: `Đã có lỗi xảy ra, vui lòng thử lại sau!`
                })
            } else if (data) {
                res.status(200).json({
                    mess: `Phim ${req.body.title} đã được đổi tên thành ${newTitle}`
                })
            }
        })
    } else {
        res.status(200).json({
            mess: `Tên mới không được để trống và phải khác tên cũ!`
        })
    }
}

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
                data: newEpi
            })
            await newFollow.save()
            const htmlCode = `<tr><td class="name">${name}</td><td class="url"><a href="${url}" target="_blank">${url}</a></td><td>${newEpi.length}</td><td><a class="edit" href="#editEmployeeModal" data-url="${url}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit"></i></a><a class="delete" href="#deleteEmployeeModal" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Delete"></i></a></td></tr>`
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