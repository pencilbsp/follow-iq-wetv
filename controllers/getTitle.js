const request = require('request');

module.exports.iq = url => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject('error')
            try {
                const title = body.match(/<\s*title[^>]*>(.*?)<\s*\/s*title>/)[1];
                const name = title.split('|')[0].trim();
                return resolve(name)
            } catch (error) {
                return resolve('error')
            }
        })
    }) 
}

module.exports.fptplay = url => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject('error')
            try {
                const name = body.match(/<\s*title[^>]*>(.*?)<\s*\/s*title>/)[1];
                return resolve(name)
            } catch (error) {
                return resolve('error')
            }
        })
    }) 
}