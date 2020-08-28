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
            console.log('wetv.vip')
        } else {
            res.json({ mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!' })
        }
        const oldData = await DB_S.findById(itemLoop._id)
        const oldEpi = oldData.data
        const name = oldData.title
        if (newEpi.length >= oldEpi.length) {
            let diffNew = []
            let diffChangeVip = []
            let diffChangeNormal = []
            newEpi.forEach((element) => {
                if (JSON.stringify(oldEpi).includes(JSON.stringify(element)) == false) {
                    // Check Vip and Normal
                    if (element.type === 'Vip') {
                        const check = `{"name":"${element.name}","type":"Normal"}`
                        if (JSON.stringify(oldEpi).includes(check) == true) {
                            diffChangeNormal.push(element.name)
                        } else {
                            diffNew.push(element.name)
                        }
                    } else if (element.type === 'Normal') {
                        const check = `{"name":"${element.name}","type":"Vip"}`
                        if (JSON.stringify(oldEpi).includes(check) == true) {
                            diffChangeVip.push(element.name)
                        } else {
                            diffNew.push(element.name)
                        }
                    } else {

                    }
                }
            })
            await DB_S.findByIdAndUpdate(itemLoop._id, { data: newEpi }, err => {
                // if (err) request(`${process.env.TELEGRAM_URL}${encodeURI('Xảy ra lỗi khi lưu dữ liệu mới!')}`)
                if (err) console.log('Xảy ra lỗi khi lưu dữ liệu mới!')
                if (diffNew.length > 0) {
                    const messNew = `[${namePage}] Phim ${name} đã thêm ${diffNew.length} tập mới: ${diffNew.join(', ')}`
                    // console.log(messNew)
                    request(`${process.env.TELEGRAM_URL}${encodeURI(messNew)}`)
                }
                if (diffChangeVip.length > 0) {
                    const messChangeVip = `[${namePage}] ${diffChangeVip.length} tập ${diffChangeVip.join(', ')} phim ${name} đã chuyển Vip sang Normal`
                    // console.log(messChangeVip)
                    request(`${process.env.TELEGRAM_URL}${encodeURI(messChangeVip)}`)
                }
                if (diffChangeNormal.length > 0) {
                    const messChangeNormal = `[${namePage}] ${diffChangeNormal.length} tập ${diffChangeNormal.join(', ')} phim ${name} đã chuyển Normal sang Vip`
                    // console.log(messChangeNormal)
                    request(`${process.env.TELEGRAM_URL}${encodeURI(messChangeNormal)}`)
                }
            })
        } else if (newEpi.length < oldEpi.length) {
            let change = []
            oldEpi.forEach(e => {
                if (JSON.stringify(newEpi).includes(JSON.stringify(e)) == false) {
                    change.push(e.name)
                }
            })
            if (change.length > 0) {
                await DB_S.findByIdAndUpdate(itemLoop._id, { data: newEpi })
            }
        }
    })
}