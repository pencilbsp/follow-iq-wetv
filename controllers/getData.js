const request = require('request');

module.exports.iq = url => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject(err);
            try {
                const dataFromUrl = body.match(/<li juji-order="(\d+)" class="v-li drama [selected]*">(.*?)<\/li>/gm);
                const epi = dataFromUrl.map((e) => {
                    const eNumber = e.match(/rseat="(\w+)"/);
                    if (eNumber.input.indexOf('card_vip_icon') > 0) {
                        return {
                            name: eNumber[1],
                            type: 'Vip',
                        };
                    } else {
                        return {
                            name: eNumber[1],
                            type: 'Normal',
                        };
                    }
                });
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
                    const isRaw = e.title.indexOf('Raw')
                    const isPreview = e.title.indexOf('Preview')
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
                    if (o.url[0].require_login === 0 && o.url[0].require_vip_plan[0] === undefined) {
                        return {
                            name: o.title.match(/\d+[A-Z]?/g)[0],
                            type: 'Normal',
                        }
                    } else if (o.url[0].require_login === 1 && o.url[0].require_vip_plan[0]) {
                        return {
                            name: o.title.match(/\d+[A-F]?/g)[0],
                            type: 'Vip',
                        }
                    }
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
                    const epiName = e.match(/<span>(\d+)<\/span>/)[1]
                    let type = 'Normal'
                    if (e.indexOf('VIP') > 0) {
                        type = 'Vip'
                    } else if (e.indexOf('FastTrack') > 0) {
                        type = 'Vip+'
                    }
                    return {
                        name: epiName,
                        type: type
                    }
                })
                return resolve(epi)
            } catch (error) {
                return resolve('error')
            }
        })
    })
}