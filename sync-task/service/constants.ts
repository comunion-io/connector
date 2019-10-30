import Web3 from 'web3'

const web3 = new Web3(null)

class Constants {

    /**
     * 获取链上日志时，一次性获取区块个数
     */
    static readonly LOADER_BATCH_SIZE = 10

    /**
     * 需要处理的 topics
     */
    static readonly TOPICS = [
        web3.utils.sha3('RegDao(address,string)'),
        web3.utils.sha3('OwnershipTransferred(address,address)'),
        web3.utils.sha3('SetToken(address)'),
        web3.utils.sha3('SetMemberRole(address,bytes32)'),
        web3.utils.sha3('RemoveMember(address)'),
        web3.utils.sha3('SetSubAccount(address,bytes32)'),
        web3.utils.sha3('RemoveSubAccount(address)'),
        web3.utils.sha3('Approval(address,address,uint256)'),
        web3.utils.sha3('Transfer(address,address,uint256)')
    ]
}


export default Constants
