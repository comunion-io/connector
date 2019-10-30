import Linq from 'linq'
import Constants from './constants'
import Utils from "../common/utils"
import { EthUtils, AbiManager } from "comunion-dao"
import { SyncServiceListener, NewOrgData, SetTokenData, SetMemberData, RemoveMemberData, SetSubAccountData, RemoveSubAccountData, ApprovalData, TransferData, BlockData } from './sync-service-listener'
import Lock from '../common/lock'


class BlockDatas {
    fromBlock: number
    toBlock: number
    datas: BlockData[]
}

class RawLogsLoader {

    private ethUtils: EthUtils
    private fromBlock: number
    private toBlock: number
    private lock = new Lock()
    private completed = 0
    private count = Constants.TOPICS.length

    constructor(fromBlock: number, toBlock: number, ethUtils: EthUtils) {
        this.fromBlock = fromBlock
        this.toBlock = toBlock
        this.ethUtils = ethUtils
    }

    async load(): Promise<any[]> {
        let result = []
        return new Promise<any[]>((resolve, reject) => {
            for (let i = 0; i < this.count; i++) {
                let f = async () => {
                    let r = await this.loadTopic(Constants.TOPICS[i])
                    this.lock.run(() => {
                        result = result.concat(r)
                        this.completed += 1
                        if (this.completed == this.count) {
                            resolve(result)
                        }
                    })
                }
                f()
            }
        })
    }

    private async loadTopic(topic: string) {
        try {
            let options = {
                fromBlock: this.fromBlock,
                toBlock: this.toBlock,
                topics: [topic]
            }
            return await this.ethUtils.web3.eth.getPastLogs(options)
        } catch (e) {
            console.log('loadTopic error:', e)
            await Utils.sleep(5000)
            return await this.loadTopic(topic)
        }
    }
}

class BlockDataLoader {

    private fromBlock: number
    private toBlock: number
    private ethUtils: EthUtils
    private abiDecoder: any
    private listener: SyncServiceListener

    private daosAddress: string = null

    constructor(fromBlock: number, toBlock: number, ethUtils: EthUtils, listener: SyncServiceListener) {
        this.fromBlock = fromBlock
        this.toBlock = toBlock
        this.ethUtils = ethUtils
        this.listener = listener

        this.abiDecoder = require('abi-decoder')
        this.abiDecoder.addABI(AbiManager.getAbiAndBytecode('Daos').abi);
        this.abiDecoder.addABI(AbiManager.getAbiAndBytecode('Organization').abi);
        this.abiDecoder.addABI(AbiManager.getAbiAndBytecode('OrgToken').abi);
    }

    async getDatas(): Promise<BlockDatas> {
        let rawLogs = await new RawLogsLoader(this.fromBlock, this.toBlock, this.ethUtils).load()
        let logs = []
        rawLogs.forEach((rlog: any) => {
            try {
                let log = this.abiDecoder.decodeLogs([rlog])[0]
                if (log) {
                    log['blockNumber'] = rlog['blockNumber']
                    log['blockHash'] = rlog['blockHash']
                    log['txHash'] = rlog['transactionHash']
                    log['address'] = log['address'].toLowerCase()
                    logs.push(log)
                }
            } catch (e) {
                // console.log('abiDecoder.decodeLogs error:', e)
            }
        })
        return {
            fromBlock: this.fromBlock,
            toBlock: this.toBlock,
            datas: await this.parseLogs(logs)
        }
    }

    private async parseLogs(logs: any[]): Promise<BlockData[]> {
        let daosAddr = await this.getDaosAddress()
        let datas: { [key: number]: BlockData; } = {}

        let newOrgLogs = Linq.from(logs).where(log => log['name'] == 'RegDao' && log['address'].toLowerCase() == daosAddr.toLowerCase()).toArray()
        await this.addLogs(datas, newOrgLogs)

        let otherLogs = Linq.from(logs).where(log => log['name'] !== 'RegDao').toArray()
        await this.addLogs(datas, otherLogs)

        let r = Object.values(datas).sort((a, b) => { return a.blockHeight > b.blockHeight ? 1 : -1 })
        return Linq.from(r).where(d => d.datas.length > 0).toArray()
    }

    private async addLogs(datas: { [key: number]: BlockData; }, logs: any[]) {
        for (let i = 0; i < logs.length; i++) {
            await this.addLog(datas, logs[i])
        }
    }

    private async addLog(datas: { [key: number]: BlockData; }, log: any) {
        let blockHeight = log['blockNumber']
        let d = datas[blockHeight]
        if (!d) {
            d = new BlockData()
            d.blockHeight = blockHeight
            d.blockHash = log['blockHash']
            datas[blockHeight] = d
        }
        await this.addBlockLog(d, log)
    }

    private async addBlockLog(blockData: BlockData, log: any): Promise<any> {

        let d = null

        switch (log['name']) {

            case 'RegDao':
                d = new NewOrgData()
                d.txHash = log['txHash']
                d.name = this.getLogValue(log, 'name')
                d.address = this.getLogValue(log, 'addr')
                blockData.datas.push(d)
                break;

            case 'OwnershipTransferred':
                this.updateOwner(blockData, log['address'], this.getLogValue(log, 'newOwner'))
                break

            case 'SetMemberRole':
                if (await this.isOrganization(blockData, log['address'])) {
                    d = new SetMemberData()
                    d.txHash = log['txHash']
                    d.orgAddress = log['address']
                    d.member = this.getLogValue(log, 'member')
                    d.role = this.ethUtils.web3.utils.hexToUtf8(this.getLogValue(log, 'role'))
                    blockData.datas.push(d)
                }
                break

            case 'RemoveMember':
                if (await this.isOrganization(blockData, log['address'])) {
                    d = new RemoveMemberData()
                    d.txHash = log['txHash']
                    d.orgAddress = log['address']
                    d.member = this.getLogValue(log, 'member')
                    blockData.datas.push(d)
                }
                break

            case 'SetSubAccount':
                if (await this.isOrganization(blockData, log['address'])) {
                    d = new SetSubAccountData()
                    d.txHash = log['txHash']
                    d.orgAddress = log['address']
                    d.account = this.getLogValue(log, 'account')
                    d.desc = this.ethUtils.web3.utils.hexToUtf8(this.getLogValue(log, 'desc'))
                    blockData.datas.push(d)
                }
                break

            case 'RemoveSubAccount':
                if (await this.isOrganization(blockData, log['address'])) {
                    d = new RemoveSubAccountData()
                    d.txHash = log['txHash']
                    d.orgAddress = log['address']
                    d.account = this.getLogValue(log, 'account')
                    blockData.datas.push(d)
                }
                break

            case 'SetToken':
                if (await this.isOrganization(blockData, log['address'])) {
                    d = new SetTokenData()
                    d.txHash = log['txHash']
                    d.orgAddress = log['address']
                    d.tokenAddress = this.getLogValue(log, 'token')
                    blockData.datas.push(d)
                }
                break

            case 'Transfer':
                let from = this.getLogValue(log, 'from')
                if (await this.isOrgTokenAndOwner(log['address'], from)) {
                    d = new TransferData()
                    d.txHash = log['txHash']
                    d.tokenAddress = log['address']
                    d.from = from
                    d.to = this.getLogValue(log, 'to')
                    d.value = this.getLogValue(log, 'value')
                    blockData.datas.push(d)
                }
                break

            case 'Approval':
                let owner = this.getLogValue(log, 'owner')
                if (await this.isOrgTokenAndOwner(log['address'], owner)) {
                    d = new ApprovalData()
                    d.txHash = log['txHash']
                    d.tokenAddress = log['address']
                    d.owner = owner
                    d.spender = this.getLogValue(log, 'spender')
                    d.value = this.getLogValue(log, 'value')
                    blockData.datas.push(d)
                }
                break

            default:
                break;
        }
        return d
    }

    private updateOwner(blockData: BlockData, address: string, newOwner: string) {
        let d = Linq.from(blockData.datas).firstOrDefault(d => (d.type == 'NewOrgData') && d['address'].toLowerCase() == address.toLowerCase()) as NewOrgData
        if (d) {
            d.owner = newOwner
        }
    }

    private getLogValue(log: any, name: string) {
        let events = log['events'] as any[]
        let e = Linq.from(events).firstOrDefault(e => e['name'] == name)
        if (e) {
            return e['value']
        }
        return null
    }

    private async isOrgTokenAndOwner(tokenAddress: string, account: string): Promise<boolean> {
        let r = this.listener.isOrgTokenAndOwner(tokenAddress, account)
        if (r instanceof Promise) {
            r = await r
        }
        return r
    }

    private async isOrganization(data: BlockData, address: string): Promise<boolean> {
        let r = Linq.from(data.datas).any(d => (d.type == 'NewOrgData') && d['address'].toLowerCase() == address.toLowerCase())
        if (!r) {
            let t = this.listener.isOrganization(address)
            if (t instanceof Promise) {
                t = await t
            }
            r = t
        }
        return r
    }

    private async getDaosAddress() {
        if (this.daosAddress == null) {
            let a = this.listener.getDaosAddress()
            if (a instanceof Promise) {
                a = await a
            }
            this.daosAddress = a.toLowerCase()
        }
        return this.daosAddress
    }
}


export default BlockDataLoader
