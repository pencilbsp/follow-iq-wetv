var express = require('express');
var router = express.Router();
const request = require('request');
const { response } = require('../app');

// Create simple database
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
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

router.post('/', (req, res, next) => {
    const url = req.body.url
    request(url, async (err, response, body) => {
        const title = body.match(/<\s*title[^>]*>(.*?)<\s*\/s*title>/)[1]
        const name = title.split('|')[0].trim();
        // Check database
        if (db.has(name).value() == false) {
            let newEpi = await refreshUrlData(url)
            console.log(newEpi.length)
            db.set(name, newEpi).write();
            res.json(newEpi)
        } else {
            let oldEpi = db.get(name).value();
            let newEpi = await refreshUrlData(url)
            if (newEpi.length > oldEpi.length) {
                res.send('Da co tap moi')
            } else {
                res.send('Chua co tap moi')
            }
            // console.log(oldEpi.length)
            // res.json(db.get(name).value())
        }
    });
    
});

module.exports = router;
