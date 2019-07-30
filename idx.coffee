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
			sparse: true
			unique: true
	,
		prop:
			email: 1
		opt:
			unique: true
	]
	org: [
		prop:
			name: 1
		opt:
			unique: true
	]
