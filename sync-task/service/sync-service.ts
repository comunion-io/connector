import { EthUtils } from 'comunion-dao'
import Lock from '../common/lock'
import Utils from '../common/utils'
import BlockDataLoader from './block-data-loader'
import BlockDiscover from './block-discover'
import { SyncServiceListener, NewOrgData, SetTokenData, SetMemberData, RemoveMemberData, SetSubAccountData, RemoveSubAccountData, ApprovalData, TransferData, BlockData } from './sync-service-listener'
import Constants from './constants'


class SyncService {

    private lock = new Lock()
    private running = false
    private comunionStartBlockHeight: number = null
    private currentBlockHeight: number

    private ethUtils: EthUtils
    private blockDiscover: BlockDiscover
    private listener: SyncServiceListener

    constructor(listener: SyncServiceListener) {
        this.blockDiscover = new BlockDiscover(listener)
        this.listener = listener
    }

    async start() {
        this.ethUtils = new EthUtils(await this.getHttpRpcUrl())
        this.startDiscover()
        this.checkAndStartLoader()
    }

    private startDiscover() {
        this.blockDiscover.start((currentBlockHeight: number) => {
            this.currentBlockHeight = currentBlockHeight
            this.checkAndStartLoader()
        })
    }

    private async checkAndStartLoader() {
        if (this.running) {
            return
        }
        await this.lock.run(() => {
            if (this.running) {
                return
            }
            this.running = true
            this.startLoader()
        })
    }

    private async startLoader() {
        let lastBlock = this.listener.getLastBlockHeight()
        if (lastBlock instanceof Promise) {
            lastBlock = await lastBlock
        }
        if (!lastBlock) {
            lastBlock = await this.getComunionStartBlockHeight() - 1
        }
        if (lastBlock >= this.currentBlockHeight) {
            await this.clearRunningFlag()
            return
        }
        let toBlock = lastBlock + Constants.LOADER_BATCH_SIZE
        if (toBlock > this.currentBlockHeight) {
            toBlock = this.currentBlockHeight
        }
        let loader = new BlockDataLoader(lastBlock + 1, toBlock, this.ethUtils, this.listener)
        let result = await loader.getDatas()
        for (let i = 0; i < result.datas.length; ++i) {
            await this.saveBlockData(result.datas[i])
        }
        if (result.datas.length == 0 || result.datas[result.datas.length - 1].blockHeight != result.toBlock) {
            await this.saveBlockData({
                blockHeight: result.toBlock,
                blockHash: null,
                datas: []
            })
        }
        await this.clearRunningFlag()
        this.checkAndStartLoader()
    }

    private async getComunionStartBlockHeight() {
        if (this.comunionStartBlockHeight == null) {
            let h = this.listener.getComunionStartBlockHeight()
            if (h instanceof Promise) {
                h = await h
            }
            this.comunionStartBlockHeight = h
        }
        return this.comunionStartBlockHeight
    }

    private async clearRunningFlag() {
        await this.lock.run(() => {
            this.running = false
        })
    }

    private async getHttpRpcUrl() {
        let url = this.listener.getHttpsRpcUrl()
        if (url instanceof Promise) {
            url = await url
        }
        return url
    }

    private async saveBlockData(data: BlockData): Promise<void> {
        try {
            let r = this.listener.saveBlockData(data)
            if (r instanceof Promise) {
                await r
            }
        } catch (e) {
            console.trace('SyncService.saveBlockData error:', e)
            await Utils.sleep(5000)
            await this.saveBlockData(data)
        }
    }
}


export default SyncService
