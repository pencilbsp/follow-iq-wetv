const CronJob = require('cron').CronJob;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./db.json');
const db = low(adapter);

const urlData = require('./refresh');
const getEpi = require('./epi');

var job = new CronJob(
    '*/10 * * * * *',
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
        let oldEpi = getEpi.full(
            db.get('follower').find({ url: itemLoop }).value().data
        );
        let newEpi = getEpi.full(await urlData.refresh(itemLoop));
        // console.log(oldEpi)
        if (newEpi.length > oldEpi.length) {
            var diff = [];
            newEpi.forEach((element) => {
                if (
                    JSON.stringify(oldEpi).includes(JSON.stringify(element)) ==
                    false
                ) {
                    // Check Vip and Normal
                    if (element.type == 'Vip') {
                        const check = `{"name":"${element.name}","type":"Normal"}`;
                        if (JSON.stringify(oldEpi).includes(check) == true) {
                            const mess = `${element.name} Normal change to Vip`;
                            diff.push(mess);
                        } else {
                            const mess = `${element.name} added`;
                            diff.push(mess);
                        }
                    } else {
                        const check = `{"name":"${element.name}","type":"Vip"}`;
                        if (JSON.stringify(oldEpi).includes(check) == true) {
                            const mess = `${element.name} Vip change to Normal`;
                            diff.push(mess);
                        } else {
                            const mess = `${element.name} added`;
                            diff.push(mess);
                        }
                    }
                }
            });
            console.log(diff);
            db.get('follower')
                .find({ url: itemLoop })
                .assign({ data: newEpi })
                .write();
        }
    });
}
