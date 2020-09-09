const fs = require('fs')

const { vimeoState } = require('./vimeo')

// Yêu cầu file chứa danh sách account
fs.readFile('accounts', 'utf-8', (err, data) => {
    if (err) console.log('Không tìm thấy file account!')
    if (data) try {
        const accounts = data.split('\r\n').map(a => {
            return {
                userId: a.split('|')[0],
                userAuthKey: a.split('|')[1],
            }
        })
        const videos = fs.readFileSync('finish', 'utf-8')
            .split('\n')
            .map(v => {
                return {
                    name: v.split('|')[0],
                    id: v.split('|')[1],
                    vimeoId: v.split('|')[2].split('/')[3]
                }
            })
        console.log(videos)
        async function checking() {
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i]
                const cookiePath = './cookies/' + accounts[0].userId + '.json'
                const cookie = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'))
                    .map(c => c.name + '=' + c.value).join(';')
                const { state } = await vimeoState(cookie, video.vimeoId)
                console.log(`${video.vimeoId}|${state}`)
            }
        }
        checking()
    } catch (error) {

    }

})