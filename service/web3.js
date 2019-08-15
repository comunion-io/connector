// Generated by CoffeeScript 2.3.2
var Web3, web3;

Web3 = require('web3');

if (typeof web3 !== "undefined" && web3 !== null) {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider(setting.web3Address));
}

module.exports = {
  getContract: function(abiFile, addr) {
    var abi;
    abi = JSON.parse(fs.readFileSync(abiFile));
    return new web3.eth.Contract(abi, addr);
  },
  send: function(abiFile, addr, acct, data) {
    return this.getContract(abiFile, addr).sendCoin.sendTransaction(acct, 1, data);
  },
  trans: async function(from, data) {
    var rec;
    rec = (await web3.eth.sendTransaction({from, data}).once('receipt', function(rec) {}).once('confirmation', function(cfn, rec) {}).on('err', function(err) {
      return log(err);
    }));
    return log(rec);
  },
  checkTran: async function(hash) {
    var e;
    try {
      return (await web3.eth.getTransactionReceipt(hash));
    } catch (error) {
      e = error;
      return log(e);
    }
  }
};
