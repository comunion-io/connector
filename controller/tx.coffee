web3 = require '../service/web3'

module.exports =
	receipt: (req, rsp) ->
		code = req.c.code
		try
			tx = await dao.one code, 'tx', _id: oid(req.params.id)
			if tx.status?
				receipt = await web3.checkTran tx.txhash
				if receipt && receipt.status
					if receipt.status == '0x1'
						tx.status = 1
					else
						tx.status = 0
					await dao.findAndUpdatedb("tx", {txhash: tx.txhash}, {$set: {status: tx.status}})
			rsp.send tx: tx
		catch e
			log e
			rsp.send
				err: 1
				msg: '数据错误'