web3 = require '../service/web3'

module.exports =
	receipt: (req, rsp) ->
		code = req.c.code
		try
			tx = await dao.one code, 'tx', txHash: req.params.hash
			if tx.status == 2
				receipt = await web3.checkTran tx.txHash
				if receipt && receipt.status?
					if receipt.status == '0x1'
						tx.status = 1
					else
						tx.status = 0
					await dao.findAndUpdatedb("tx", {txHash: tx.txHash}, {$set: {status: tx.status}})
			rsp.send tx
		catch e
			log e
			rsp.send
				err: 1
				msg: '数据错误'