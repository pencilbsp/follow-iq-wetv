const request = require('request');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./db.json');
const db = low(adapter);

const urlData = require('./refresh')

db.defaults({ follower: [] }).write();

module.exports.index = (req, res) => {
    const indexData = db.get('follower').value();
    res.render('index', { title: 'Follow Admin', data: indexData });
};

module.exports.add = (req, res) => {
    const url = req.body.url;
    request(url, async (err, response, body) => {
        try {
            const title = body.match(/<\s*title[^>]*>(.*?)<\s*\/s*title>/)[1];
            const name = title.split('|')[0].trim();
            // Check database
            if (db.get('follower').find({ title: name }).value() == undefined) {
                let newEpi = await urlData.refresh(url);
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