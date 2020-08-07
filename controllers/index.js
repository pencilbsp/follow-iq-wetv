const request = require('request');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./db.json');
const db = low(adapter);
db.defaults({ follower: [] }).write();

module.exports.index = (req, res) => {
    const indexData = db.get('follower').value();
    res.render('index', { title: 'Follow Admin', data: indexData });
};

module.exports.add = (req, res) => {
    const url = req.body.url;
    console.log(req.body.time);
    request(url, async (err, response, body) => {
        try {
            const title = body.match(/<\s*title[^>]*>(.*?)<\s*\/s*title>/)[1];
            const name = title.split('|')[0].trim();
            // Check database
            if (db.get('follower').find({ title: name }).value() == undefined) {
                let newEpi = await refreshUrlData(url);
                if (newEpi === 'error') {
                    res.json({
                        mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!',
                    });
                } else {
                    db.get('follower')
                        .push({
                            title: name,
                            url: url,
                            data: newEpi,
                            time: req.body.time,
                        })
                        .write();
                    const htmlCode = `<tr><td><span class="custom-checkbox"><input id="checkbox1" type="checkbox" name="options[]" value="1"><label for="checkbox1"></label></span></td><td>${name}</td><td>${url}</td><td>${newEpi.length}</td><td>${req.body.time}</td><td><a class="edit" href="#editEmployeeModal" data-tl="${name}" data-url="${url}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit"></i></a><a class="delete" href="#deleteEmployeeModal" data-tl="${name}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Delete"></i></a></td></tr>`;
                    res.json({
                        mess: `Phim ${name} đã được thêm vào danh sách theo dõi!`,
                        html: htmlCode,
                    });
                }
            } else {
                res.status(200).json({
                    mess: 'Phim này đã có trong danh sách theo dõi!',
                });
                // let oldEpi = getFullEpi(db.get('follower').find({ title: name }).value().data);
                // let newEpi = getFullEpi(await refreshUrlData(url))
                // // console.log(oldEpi)
                // if (newEpi.length > oldEpi.length) {
                //     var diff = []
                //     newEpi.forEach(element => {
                //         if (JSON.stringify(oldEpi).includes(JSON.stringify(element)) == false) {
                //             // Check Vip and Normal
                //             if (element.type == 'Vip') {
                //                 const check = `{"name":"${element.name}","type":"Normal"}`
                //                 if (JSON.stringify(oldEpi).includes(check) == true) {
                //                     const mess = `${element.name} Normal change to Vip`
                //                     diff.push(mess)
                //                 } else {
                //                     const mess = `${element.name} added`
                //                     diff.push(mess)
                //                 }
                //             } else {
                //                 const check = `{"name":"${element.name}","type":"Vip"}`
                //                 if (JSON.stringify(oldEpi).includes(check) == true) {
                //                     const mess = `${element.name} Vip change to Normal`
                //                     diff.push(mess)
                //                 } else {
                //                     const mess = `${element.name} added`
                //                     diff.push(mess)
                //                 }
                //             }
                //         }
                //     });
                // } else {
                //     res.status(200).send('Phim này chưa có tập mới')
                // }
            }
        } catch (error) {
            res.json({ mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!' });
        }
    });
};

module.exports.delete = (req, res) => {
    if (db.get('follower').remove({ title: req.body.title }).write()) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
};

module.exports.adit = (req, res) => {};

function refreshUrlData(url) {
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
}
function getFullEpi(epi) {
    return epi.filter((e) => {
        if (e.name.indexOf('preview') < 0) {
            return e;
        }
    });
}