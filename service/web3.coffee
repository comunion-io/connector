Web3 = require('web3')

web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))

module.exports =

	getContract: (abiFile, addr)->
		abi = JSON.parse(fs.readFileSync(abiFile))
		return new web3.eth.Contract(abi, addr)

	send: (abiFile, addr, acct, data)->
		@getContract(abiFile, addr).sendCoin.sendTransaction(acct, 1, data)