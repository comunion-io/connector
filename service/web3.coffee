Web3 = require('web3')

if web3?
	web3 = new Web3(web3.currentProvider)
else
	web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.etherscan.io/address/0xfa374fb3a47285dd62244eb8e72a4167339560eb"))

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
			log 'call'
			log res = await web3.eth.getTransaction(hash)
		catch e
			log e