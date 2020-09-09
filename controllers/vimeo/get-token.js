const fs = require('fs')
const { google } = require('googleapis')

const YOUR_CLIENT_ID = '314288131371-agmtso3reos7go9lg8lt461esj5nt81f.apps.googleusercontent.com'
const YOUR_CLIENT_SECRET = 'PxbEu2grqiRBe_9O5wkBJwNT'
const YOUR_REDIRECT_URL = 'http://localhost'

const TOKEN_PATH = 'token.json'
var oAuth2Client = new google.auth.OAuth2(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, YOUR_REDIRECT_URL)

function getToken() {
    var token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'UTF-8'))
    const refresh_token = token.refresh_token
    const expiry_date = token.expiry_date
    return new Promise(resolve => {
        if (expiry_date < Date.now()) {
            oAuth2Client.setCredentials({
                refresh_token: refresh_token
            })
            oAuth2Client.getRequestHeaders().then(authorization => {
                const newTokens = {
                    ...token,
                    access_token: authorization.Authorization.split(' ')[1],
                    expiry_date: Date.now() + 60 * 60 * 60 - 10
                }
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(newTokens))
                return resolve(newTokens)
            })
        } else {
            return resolve(token)
        }
    })
}

module.exports = getToken