import WebSocket from 'ws'
import Lock from './lock'
import { SyncServiceListener } from '../service/sync-service-listener'


abstract class Socket {

    protected ws: WebSocket
    protected serviceListener: SyncServiceListener
    protected chainId: number

    private lock = new Lock()
    private connecting = false

    constructor(listener: SyncServiceListener) {
        this.serviceListener = listener
    }

    async tryConnect() {
        if (this.connecting) {
            return
        }
        await this.lock.run(async () => {
            if (this.connecting) {
                return
            }
            this.connecting = true
            await this.connect()
        })
    }

    private async connect() {
        let url = this.serviceListener.getWSUrl()
        if (url instanceof Promise) {
            url = await url
        }
        this.chainId = url.indexOf('ropsten') > 0 ? 3 : 1
        this.ws = new WebSocket(url)
        this.ws.onopen = () => { this.onOpen() }
        this.ws.onclose = () => { this.onClose() }
        this.ws.onerror = (err: any) => { this.onError(err) }
        this.ws.onmessage = (event: WebSocket.MessageEvent) => { this.onGetMessage(event) }
    }

    private reConnect() {
        setTimeout(() => {
            this.tryConnect()
        }, 1000);
    }

    private onClose() {
        this.connecting = false
        this.reConnect()
    }

    private onError(error: any) {
        console.log('ws onerror:', error)
        this.connecting = false
        this.reConnect()
    }

    private async onOpen() {
        this.connecting = false
        this.onConnected()
    }

    private async onGetMessage(msg: WebSocket.MessageEvent) {
        let data = JSON.parse(msg.data.toString())
        this.onReceiveMsg(data)
    }

    abstract onConnected();
    abstract onReceiveMsg(msg: any);

}


export default Socket
