const CronJob = require('cron').CronJob
const mongoose = require('mongoose')
const request = require('request')
require('dotenv').config()

mongoose.connect(process.env.MONGOBD_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const DB_S = require('../model/model')

const getData = require('./getData')
const getEpi = require('./epi')

var job = new CronJob(
    '1 * * * * *',
    async () => {
        var dataLoop = await DB_S.find({}).select('url')
        refreshNewEpi(dataLoop)
    },
    null,
    true,
    'Asia/Ho_Chi_Minh'
)

job.start()

function refreshNewEpi(dataLoop) {
    dataLoop.forEach(async (itemLoop) => {
        const namePage = itemLoop.url.split('/')[2]
        if (namePage == 'www.iq.com') {
            var newEpi = getEpi.full(await getData.iq(itemLoop.url))
        } else if (namePage == 'fptplay.vn') {
            var newEpi = await getData.fptplay(itemLoop.url)
        } else if (namePage == 'wetv.vip') {
            proxyUrl = process.env.PROXY_URL + itemLoop.url
            var newEpi = await getData.wetv(proxyUrl)
        } else {
            res.json({ mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!' })
        }
        const data = await DB_S.findById(itemLoop._id)
        const oldEpi = data.data
        const name = data.title
        if ((oldEpi.length === 0) || (newEpi.length === 0)) {
            console.log('Tất cả các tập phim đã bị xoá hoạc phim chưa có tập phim nào!')
        } else if (newEpi.length >= oldEpi.length) {
            const diff = newEpi.filter(e => {
                const check = oldEpi.includes(e)
                if (check === false) return e
            })
            if (diff.length > 0) {
                await DB_S.findByIdAndUpdate(itemLoop._id, { data: newEpi }, err => {
                    if (err) {
                        request(`${process.env.TELEGRAM_URL}${encodeURI('Xảy ra lỗi khi lưu dữ liệu mới!')}`)
                    } else {
                        const messNew = `[${namePage}] Phim ${name} đã thêm ${diff.length} tập mới: ${diff.join(', ')}`
                        request(`${process.env.TELEGRAM_URL}${encodeURI(messNew)}`)
                    }
                })
            }
        } else if (newEpi.length < oldEpi.length) {
            const diff = oldEpi.filter(e => {
                const check = newEpi.includes(e)
                if (check === false) return e
            })
            await DB_S.findByIdAndUpdate(itemLoop._id, { data: newEpi }, err => {
                if (err) {
                    request(`${process.env.TELEGRAM_URL}${encodeURI('Xảy ra lỗi khi lưu dữ liệu mới!')}`)
                } else {
                    const messNew = `[${namePage}] Phim ${name} đã xoá ${diff.length} tập: ${diff.join(', ')}`
                    request(`${process.env.TELEGRAM_URL}${encodeURI(messNew)}`)
                }
            })
        }
    })
}