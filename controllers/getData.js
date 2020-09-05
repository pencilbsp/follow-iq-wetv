const request = require('request');

module.exports.iq = url => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject(err);
            try {
                const dataFromUrl = body.match(/<li juji-order="(\d+)" class="v-li drama [selected]*">(.*?)<\/li>/gm);
                const epi = dataFromUrl.map((e) => {
                    return e.match(/rseat="(\w+)"/)[1]
                }).filter(e => !e.includes('preview'));
                resolve(epi);
            } catch (error) {
                resolve('error');
            }
        });
    });
};

module.exports.fptplay = url => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject('error')
            try {
                const dataFromUrl = body.match(/<script type="text\/javascript">window\.__NUXT__=(.*?);<\/script>/)[1]
                const dataRaw = JSON.parse(dataFromUrl)
                const miniJson = dataRaw.data[0].result.episodes
                // miniJson.forEach(element => {
                //     console.log(element.title)
                // });
                const listEpi = miniJson.filter(e => {
                    const isRaw = e.title.toLowerCase().indexOf('raw')
                    const isPreview = e.title.toLowerCase().indexOf('preview')
                    let byPass
                    if (isRaw > 0) {
                        byPass = 0
                    } else if (isPreview > 0) {
                        byPass = 0
                    } else {
                        byPass = 1
                    }
                    if (e.is_trailer === 0 && byPass === 1) return e
                }).map(o => {
                    return o.title.match(/\d+[A-Z]?/g)[0]
                })
                resolve(listEpi)
            } catch (error) {
                return resolve('error')
            }
        })
    })
}

module.exports.wetv = url => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject('error')
            try {
                const bodyNoneSpace = body.replace(/[\s]+/g, '')
                const dataRaw = bodyNoneSpace.match(/<adata-vid=".*?"class="video_episode.*?<\/a>/g)
                const epi = dataRaw.map(e => {
                    return e.match(/<span>(\d+)<\/span>/)[1]
                })
                return resolve(epi)
            } catch (error) {
                return resolve('error')
            }
        })
    })
}