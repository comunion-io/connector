"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_socket_1 = __importDefault(require("../common/web-socket"));
class BlockDiscover extends web_socket_1.default {
    constructor(serviceListener) {
        super(serviceListener);
        this.currentBlockHeight = 0;
        this.subscribeId = null;
    }
    start(listener) {
        this.listener = listener;
        this.tryConnect();
    }
    // override -----
    onConnected() {
        this.subscribeId = null;
        this.subscribe();
    }
    onReceiveMsg(msg) {
        if (!msg['method'] && msg['result']) {
            this.subscribeId = msg['result'];
            clearTimeout(this.subscribeTimeoutedHandle);
        }
        else if (msg['method'] == 'eth_subscription') {
            try {
                let n = parseInt(msg['params']['result']['number'], 16);
                if (n > this.currentBlockHeight) {
                    this.currentBlockHeight = n;
                    this.listener(this.currentBlockHeight);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    subscribe() {
        this.ws.send(`{"jsonrpc":"2.0", "id": ${this.chainId}, "method": "eth_subscribe", "params": ["newHeads"]}`);
        this.subscribeTimeoutedHandle = setTimeout(() => {
            this.subscribe();
        }, 20000);
    }
}
exports.default = BlockDiscover;
