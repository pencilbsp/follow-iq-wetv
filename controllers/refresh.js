const request = require('request');

module.exports.refresh = url => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (err) return reject(err);
            try {
                const dataFromUrl = body.match(
                    /<li juji-order="(\d+)" class="v-li drama [selected]*">(.*?)<\/li>/gm
                );
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