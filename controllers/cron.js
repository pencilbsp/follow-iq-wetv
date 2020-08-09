const CronJob = require('cron').CronJob;
const low = require('lowdb');
const request = require('request');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./db.json');
const db = low(adapter);
require('dotenv').config()

const getData = require('./getData');
const getEpi = require('./epi');

var job = new CronJob(
    '1 * * * * *',
    () => {
        var dataLoop = db.get('follower').map('url').value();
        refreshNewEpi(dataLoop);
    },
    null,
    true,
    'Asia/Ho_Chi_Minh'
);

job.start();

function refreshNewEpi(dataLoop) {
    dataLoop.forEach(async (itemLoop) => {
        const namePage = itemLoop.split('/')[2]
        if (namePage == 'www.iq.com') {
            var newEpi = getEpi.full(await getData.iq(itemLoop));
        } else if (namePage == 'fptplay.vn') {
            var newEpi = await getData.fptplay(itemLoop);
        } else if (namePage == 'wetv.vip') {
            console.log('wetv.vip')
        } else {
            res.json({ mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!' })
        }
        const oldData = db.get('follower').find({ url: itemLoop }).value();
        const oldEpi = oldData.data;
        const name = oldData.title;

        // console.log(oldEpi)
        if (newEpi.length > oldEpi.length) {
            var diffNew = [];
            var diffChangeVip = [];
            var diffChangeNormal = [];
            newEpi.forEach((element) => {
                if (JSON.stringify(oldEpi).includes(JSON.stringify(element)) == false) {
                    // Check Vip and Normal
                    if (element.type == 'Vip') {
                        const check = `{"name":"${element.name}","type":"Normal"}`;
                        if (JSON.stringify(oldEpi).includes(check) == true) {
                            diffChangeNormal.push(element.name);
                        } else {
                            diffNew.push(element.name);
                        }
                    } else {
                        const check = `{"name":"${element.name}","type":"Vip"}`;
                        if (JSON.stringify(oldEpi).includes(check) == true) {
                            diffChangeVip.push(element.name);
                        } else {
                            diffNew.push(element.name);
                        }
                    }
                }
            });
            const messNew = `[${namePage}] Phim ${name} đã thêm ${diffNew.length} tập mới: ${diffNew.join(', ')}`
            const messChangeVip = `[${namePage}] ${diffChangeVip.length} tập ${diffChangeVip.join(', ')} phim ${name} đã chuyển Vip sang Normal`
            const messChangeNormal = `[${namePage}] ${diffChangeNormal.length} tập ${diffChangeNormal.join(', ')} phim ${name} đã chuyển Normal sang Vip`
            if (diffNew.length > 0) request(`${process.env.TELEGRAM_URL}${encodeURI(messNew)}`);
            if (diffChangeVip.length > 0) request(`${process.env.TELEGRAM_URL}${encodeURI(messChangeVip)}`);
            if (diffChangeNormal.length > 0) request(`${process.env.TELEGRAM_URL}${encodeURI(messChangeNormal)}`);
            db.get('follower')
                .find({ url: itemLoop })
                .assign({ data: newEpi })
                .write();
        }
    });
}
