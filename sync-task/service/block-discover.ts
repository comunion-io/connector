import { SyncServiceListener } from "./sync-service-listener"
import Socket from "../common/web-socket"


class BlockDiscover extends Socket {

    private listener: (blockHeight: number) => void
    private currentBlockHeight: number = 0
    private subscribeId: string = null
    private subscribeTimeoutedHandle: any

    constructor(serviceListener: SyncServiceListener) {
        super(serviceListener)
    }

    start(listener: (blockHeight: number) => void) {
        this.listener = listener
        this.tryConnect()
    }


    // override -----

    onConnected() {
        this.subscribeId = null
        this.subscribe()
    }

    onReceiveMsg(msg: any) {
        if (!msg['method'] && msg['result']) {
            this.subscribeId = msg['result']
            clearTimeout(this.subscribeTimeoutedHandle)
        } else if (msg['method'] == 'eth_subscription') {
            try {
                let n = parseInt(msg['params']['result']['number'], 16)
                if (n > this.currentBlockHeight) {
                    this.currentBlockHeight = n
                    this.listener(this.currentBlockHeight)
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    private subscribe() {
        this.ws.send(`{"jsonrpc":"2.0", "id": ${this.chainId}, "method": "eth_subscribe", "params": ["newHeads"]}`)
        this.subscribeTimeoutedHandle = setTimeout(() => {
            this.subscribe()
        }, 20000)
    }
}


export default BlockDiscover
