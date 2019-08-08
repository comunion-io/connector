aws = require('aws-sdk')
multer = require('multer')
multerS3 = require('multer-s3')

spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com')

aws.config.loadFromPath('controller/creds.json')

s3 = new aws.S3({
	endpoint: spacesEndpoint
})

upload = multer(
	storage: multerS3
		s3: s3
		bucket: 'comunion-avatar'
		acl: 'public-read'
		key: (request, file, cb) ->
			console.log(file);
			cb(null, file.originalname)
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
			rsp.json msg: 'upload successfully'
