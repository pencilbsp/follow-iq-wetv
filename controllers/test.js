const fs = require('fs')

const  doc = fs.readFileSync('./test.html', 'utf-8')
const nonSpace = doc.replace(/[\s]+/g, '')
const data = nonSpace.match(/<adata-vid=".*?"class="video_episode.*?<\/a>/g)
data.forEach(e => {
    const epiName = e.match(/<span>(\d+)<\/span>/)
    let type = 'Normal'
    if (e.indexOf('VIP') > 0) {
        type = 'Vip'
    }
    console.log(epiName[1], type)
})