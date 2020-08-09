const request = require('request');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./db.json');
const db = low(adapter);
require('dotenv').config()

const getData = require('./getData');
const getTitle = require('./getTitle');
const getEpi = require('./epi');

db.defaults({ follower: [] }).write();

module.exports.index = (req, res) => {
    const indexData = db.get('follower').value();
    res.render('index', { title: 'Follow Admin', data: indexData });
};

module.exports.add = async (req, res) => {
    const urlRaw = req.body.url;
    namePage = urlRaw.split('/')[2]
    if (namePage == 'www.iq.com') {
        var name = await getTitle.iq(urlRaw);
        var newEpi = getEpi.full(await getData.iq(urlRaw));
    } else if (namePage == 'fptplay.vn') {
        var name = await getTitle.fptplay(urlRaw);
        var newEpi = await getData.fptplay(urlRaw);
    } else if (namePage == 'wetv.vip') {
        console.log('wetv.vip')
    } else {
        res.json({ mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!' })
    }
    try {
        if (db.get('follower').find({ title: name }).value() == undefined) {
            if (newEpi === 'error') {
                res.json({
                    mess: 'Url bạn nhập sai hoặc chưa được hỗ trợ!',
                });
            } else {
                db.get('follower')
                    .push({
                        title: name,
                        url: urlRaw,
                        data: newEpi,
                        time: req.body.time,
                    })
                    .write();
                const htmlCode = `<tr><td><span class="custom-checkbox"><input id="checkbox1" type="checkbox" name="options[]" value="1"><label for="checkbox1"></label></span></td><td>${name}</td><td>${urlRaw}</td><td>${newEpi.length}</td><td>${req.body.time}</td><td><a class="edit" href="#editEmployeeModal" data-tl="${name}" data-url="${urlRaw}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit"></i></a><a class="delete" href="#deleteEmployeeModal" data-tl="${name}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Delete"></i></a></td></tr>`;
                const messNew = `[${namePage}] Phim ${name} đã được thêm vào danh sách theo dõi với ${newEpi.length} tập mới!`
                // request(`${process.env.TELEGRAM_URL}${encodeURI(messNew)}`);
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
};

module.exports.delete = (req, res) => {
    if (db.get('follower').remove({ title: req.body.title }).write()) {
        res.status(200).json({
            mess: `Phim ${req.body.title} đã được xóa khỏi danh sách theo dõi!`
        });
    } else {
        res.status(500).json({
            mess: `Đã có lỗi xảy ra, vui lòng thử lại sau!`
        });
    }
};

module.exports.adit = (req, res) => { };