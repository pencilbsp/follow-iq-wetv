const axios = require('axios')
const cryptoRandomString = require('crypto-random-string')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const getFileMeta = require('./get-file-meta')
const getToken = require('./get-token')
const acceptVideoType = ['video/mp4', 'video/x-matroska', 'video/avi']

async function vimeoUpload(userId, userAuthKey, videoId) {
    const { fileSize, iconLink, videoMediaMetadata } = await getFileMeta(videoId)
    const { access_token } = await getToken()
    // Kiểm tra định dạng file
    if (fileSize && acceptVideoType.includes(iconLink.split('/type/')[1])) {
        const apiUri = 'https://api.vimeo.com/users/' + userId + '/videos'
        const directUrl = 'https://www.googleapis.com/drive/v3/files/' + videoId + '?alt=media'
        return axios({
            method: 'POST',
            url: apiUri,
            headers: {
                'Accept': 'application/vnd.vimeo.video;version=3.2',
                'Authorization': 'Bearer ' + userAuthKey,
                'Content-Type': 'application/json'
            },
            data: {
                'type': 'pull',
                'link': directUrl,
                'headers': {
                    'authorization': 'Bearer ' + access_token
                },
                'size': fileSize,
                'name': 'PhePhim@' + cryptoRandomString({ length: 20, characters: videoId })
            }
        }).then(res => {
            if (res.status === 200) return res.data
        }).catch(err => err.response.statusText)
    } else {
        if (iconLink) return 'Định dạng file ' + iconLink.split('/type/')[1] + ' không được hỗ trợ!'
        return 'File không tồn tại hoặc chưa được chia sẻ!'
    }
}

async function vimeoState(cookie, vimeoId) {
    return axios({
        method: 'GET',
        url: 'https://vimeo.com/manage/' + vimeoId + '/services/status',
        headers: {
            'Cookie': cookie,
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(res => {
        if (res.status === 200) return res.data
    }).catch(err => err.response.status)
}

module.exports = { vimeoUpload, vimeoState }