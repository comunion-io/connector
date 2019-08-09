aws = require('aws-sdk')
multer = require('multer')
multerS3 = require('multer-s3')

spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com')

aws.config.loadFromPath('controller/creds.json')

s3 = new aws.S3({
	endpoint: spacesEndpoint
})

bk = 'comunion-avatar'

upload = multer(
	storage: multerS3
		s3: s3
		bucket: bk
		acl: 'public-read'
		key: (req, file, cb) ->
			req.fk = 'avatar_' + util.randomChar(9) + '.' + file.originalname.split('.')[1]
			cb(null, req.fk)
).array('upload', 1)

app.post '/a/upload', (req, rsp) ->
	upload req, rsp, (error)->
		if error
			log(error)
			rsp.json
				err: 1
				msg: 'upload err'
		else
			log('File uploaded successfully.')
			log "http://#{bk}.sgp1.digitaloceanspaces.com/#{req.fk}"
			rsp.json
				msg: 'upload successfully'
				url: "http://#{bk}.sgp1.digitaloceanspaces.com/#{req.fk}"
