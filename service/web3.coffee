Web3 = require('web3')

phash = 'ropsten.infura.io/v3/11ae2b7ff4c04391b71dd5a196c21b0d'

if web3?
	web3 = new Web3(web3.currentProvider)
else
	web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/11ae2b7ff4c04391b71dd5a196c21b0d"))

module.exports =

	getContract: (abiFile, addr)->
		abi = JSON.parse(fs.readFileSync(abiFile))
		return new web3.eth.Contract(abi, addr)

	send: (abiFile, addr, acct, data)->
		@getContract(abiFile, addr).sendCoin.sendTransaction(acct, 1, data)

	trans: (from, data)->
		rec = await web3.eth.sendTransaction({from, data})
			.once 'receipt', (rec)->
			.once 'confirmation', (cfn, rec)->
			.on 'err', (err)-> log err
		log rec

	checkTran: (hash) ->
		try
			await web3.eth.getTransaction(hash)
		catch e
			log e