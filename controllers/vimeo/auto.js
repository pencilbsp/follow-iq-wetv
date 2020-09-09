const CronJob = require('cron').CronJob
const mongoose = require('mongoose')
const path = require('path')
const axios = require('axios')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })



mongoose.connect(process.env.MONGOBD_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const DB = require('../../model/queue')
const ACC = require('../../model/acc')
const { vimeoUpload } = require('./vimeo')
const { async } = require('crypto-random-string')

function randomAcc(accounts) {
    return accounts[Math.floor(Math.random() * accounts.length)]
}

async function checkError() {
    const error = await DB.find({})
    error.forEach(async e => {
        const data = e.data
        unProcess = data.filter(o => !o.vimeo)
        if (unProcess.length > 0) {
            await DB.findByIdAndUpdate(e._id, { error: true })
        }
    })
}

async function getAccount() {
    const accounts = await ACC.find({})
    new CronJob({
        cronTime: '*/5 * * * * *',
        onTick: async function () {
            await DB.findOneAndUpdate({ status: false }, { status: true }, (err, data) => {
                if (!data) {
                    checkError()
                }
                else {
                    let queue = data.data
                    async function upload() {
                        for (let i = 0; i < queue.length; i++) {
                            const video = queue[i]
                            if (!video.vimeo) {
                                const { userId, authKey } = randomAcc(accounts)
                                const result = await vimeoUpload(userId, authKey, video.videoId)
                                if (result.link) {
                                    queue = [
                                        ...queue.slice(0, i),
                                        {
                                            ...video,
                                            vimeo: !video.vimeo
                                        },
                                        ...queue.slice(i + 1)
                                    ]
                                    await axios.get(process.env.PHEPHIM_UPLOAD + video.id + '&url=' + encodeURI(result.link))
                                    await DB.findByIdAndUpdate(data._id, { data: queue })
                                }
                            }
                        }
                    }
                    upload()
                }
            })
        }, start: true, timeZone: 'Asia/Ho_Chi_Minh'
    })
}
getAccount()