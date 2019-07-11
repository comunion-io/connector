module.exports =
	cache: [
		prop:
			createdAt: 1
		opt:
			expireAfterSeconds: 3600 * 24
			background: true
	]
	session: [
		prop:
			createdAt: 1
		opt:
			expireAfterSeconds: 3600 * 24
			background: true
	]
	user: [
		prop:
			username: 1
		opt:
			unique: true
	]
	org: [
		prop:
			title: 1
		opt:
			unique: true
	]
