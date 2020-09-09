const axios = require('axios')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// Lấy dữ liệu bao gồm fileSize, fileType, độ phân giải và thời lượng video
const queryParams = '?fields=fileSize%2CiconLink%2CvideoMediaMetadata(height%2Cwidth%2CdurationMillis)&supportsTeamDrives=true&key='
function getFileMeta(videoId) {
    return axios({
        method: 'GET',
        url: 'https://content.googleapis.com/drive/v2beta/files/' + videoId + queryParams + process.env.GD_KEY,
        headers: {
            'x-origin': 'https://drive.google.com',
            'x-referer': 'https://drive.google.com'
        }
    }).then(res => {
        if (res.status === 200) return res.data
    }).catch(err => err.response.status)
}

module.exports = getFileMeta