var express = require('express');
var router = express.Router();
const request = require('request');
const { response } = require('../app');

// Create simple database
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ follower: [] }).write()


/* GET home page. */
router.get('/', function (req, res, next) {
    const indexData = db.get('follower').value();
    console.log(indexData)
    res.render('index', { title: 'Express', data: indexData });
});

function refreshUrlData(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject(err)
            try {
                const dataFromUrl = body.match(/<li juji-order="(\d+)" class="v-li drama [selected]*">(.*?)<\/li>/mg);
                const epi = dataFromUrl.map(e => {
                    const eNumber = e.match(/rseat="(\w+)"/);
                    if (eNumber.input.indexOf('card_vip_icon') > 0) {
                        return {
                            name: eNumber[1],
                            type: 'Vip'
                        }
                    } else {
                        return {
                            name: eNumber[1],
                            type: 'Normal'
                        }
                    }
                })
                resolve(epi)
            } catch (error) {
                reject(error)
            }
        })
    })
}
function getFullEpi(epi) {
    return epi.filter(e => {
        if (e.name.indexOf('preview') < 0) {
            return e
        }
    })
}

router.post('/add', (req, res, next) => {
    const url = req.body.url
    request(url, async (err, response, body) => {
        const title = body.match(/<\s*title[^>]*>(.*?)<\s*\/s*title>/)[1]
        const name = title.split('|')[0].trim();
        // Check database
        if (db.get('follower').find({ title: name }).value() == undefined) {
            let newEpi = await refreshUrlData(url)
            db.get('follower').push({ title: name, url: url, data: newEpi}).write()
            res.redirect('/')
        } else {
            let oldEpi = getFullEpi(db.get('follower').find({ title: name }).value().data);
            let newEpi = getFullEpi(await refreshUrlData(url))
            // console.log(oldEpi)
            if (newEpi.length > oldEpi.length) {
                var diff = []
                newEpi.forEach(element => {
                    if (JSON.stringify(oldEpi).includes(JSON.stringify(element)) == false) {
                        // Check Vip and Normal
                        if (element.type == 'Vip') {
                            const check = `{"name":"${element.name}","type":"Normal"}`
                            if (JSON.stringify(oldEpi).includes(check) == true) {
                                const mess = `${element.name} Normal change to Vip`
                                diff.push(mess)
                            } else {
                                const mess = `${element.name} added`
                                diff.push(mess)
                            }
                        } else {
                            const check = `{"name":"${element.name}","type":"Vip"}`
                            if (JSON.stringify(oldEpi).includes(check) == true) {
                                const mess = `${element.name} Vip change to Normal`
                                diff.push(mess)
                            } else {
                                const mess = `${element.name} added`
                                diff.push(mess)
                            }
                        }
                    }
                });
                res.redirect('/')
            } else {
                res.redirect('/')
            }
        }
    });

});

module.exports = router;
