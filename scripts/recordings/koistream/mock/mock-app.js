// Local stand-in for the clone's src/app.js. It mounts the clone's own routers, views and
// socket.io wiring unchanged, and swaps out only what needs the outside world:
// Google sign-in (a cookie picks a seeded user), the Postgres session store, the AWS SDK
// and the IP lookup middleware. Copied into <clone>/src by setup.sh; never committed there.
const Module = require('module')
const realLoad = Module._load
Module._load = function (request, ...rest) {
	if (request === 'aws-sdk') {
		const refuse = () => { throw new Error('aws-sdk is stubbed in the mock run') }
		return { config: { update() {}, getCredentials() {} }, MediaLive: function () { return new Proxy({}, { get: () => refuse }) } }
	}
	return realLoad.call(this, request, ...rest)
}

const path = require('path')
const express = require('express')
const createError = require('http-errors')
const { reader } = require('./db/pool')

const cookieUser = (header) => {
	const m = /(?:^|;\s*)mock_user=([^;]+)/.exec(header || '')
	return m ? decodeURIComponent(m[1]) : null
}

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Mock media first, so /videos/koistream-promo.mp4 and /mock-stream resolve to generated files.
app.use(express.static(process.env.MOCK_PUBLIC))
app.use(express.static(path.join(__dirname, '..', 'bin')))
app.use(express.static(path.join(__dirname, '..', 'libs')))

app.use(async (req, res, next) => {
	const id = cookieUser(req.headers.cookie)
	if (id) req.user = (await reader.select('*').from('users').where('googleId', id))[0]
	next()
})
app.get('/mock/login/:googleId', (req, res) => {
	res.cookie('mock_user', req.params.googleId)
	res.redirect(req.query.to || '/stream')
})
app.get('/mock/logout', (req, res) => { res.clearCookie('mock_user'); res.redirect('/') })

app.use('/', require('./routes/user/pages'))
app.use('/user/api', require('./routes/user/api'))
app.use('/admin', require('./routes/admin/pages'))
app.use('/admin/api', require('./routes/admin/api'))
app.use((req, res, next) => next(createError(404)))
app.use((err, req, res, next) => { console.error(err); res.status(err.status || 500).send('error') })

const port = parseInt(process.env.PORT)
const server = app.listen(port, '127.0.0.1', () => console.log('KoiStream mock run on http://127.0.0.1:' + port))
const io = require('socket.io').listen(server)
app.set('socketio', io)

// Same connection bookkeeping as src/app.js, with the user read from the mock cookie.
const userConnect = require('./db/socketConnections/userConnect')
const userDisconnect = require('./db/socketConnections/userDisconnect')
const getUserAuth = require('./db/users/getUserAuth')
require('./db/socketConnections/resetUserStatuses')()
io.on('connection', async (socket) => {
	const googleId = cookieUser(socket.request.headers.cookie)
	if (!googleId) return
	await userConnect(googleId, socket.request.headers.referer, socket.id)
	if ((await getUserAuth(googleId)) === 3) socket.join('admin')
	socket.on('disconnect', () => userDisconnect(googleId, socket.id))
})
