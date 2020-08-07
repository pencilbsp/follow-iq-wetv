const CronJob = require('cron').CronJob;
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db.json')
const db = low(adapter)

var loopDb = db.get('follower').map('url').value();
console.log(loopDb)

// var job = new CronJob('*/3 * * * * *', async function () {
//     console.log('You will see this message every second');
// }, null, true, 'Asia/Ho_Chi_Minh');

// job.start();