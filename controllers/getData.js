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
                //     console.log(element.url[0])
                // });
                const listEpi = miniJson.filter(e => {
                    if (e.is_trailer == 0) return e
                }).map(o => {
                    if (o.url[0].require_login == 0 && o.url[0].require_vip_plan[0] === undefined) {
                        return {
                            name: o.title.split(' ')[1],
                            type: 'Normal',
                        }
                    } else if (o.url[0].require_login == 1 && o.url[0].require_vip_plan[0]) {
                        return {
                            name: o.title.split(' ')[1],
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