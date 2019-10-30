"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const lock_1 = __importDefault(require("./lock"));
class Socket {
    constructor(listener) {
        this.lock = new lock_1.default();
        this.connecting = false;
        this.serviceListener = listener;
    }
    tryConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connecting) {
                return;
            }
            yield this.lock.run(() => __awaiter(this, void 0, void 0, function* () {
                if (this.connecting) {
                    return;
                }
                this.connecting = true;
                yield this.connect();
            }));
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.serviceListener.getWSUrl();
            if (url instanceof Promise) {
                url = yield url;
            }
            this.chainId = url.indexOf('ropsten') > 0 ? 3 : 1;
            this.ws = new ws_1.default(url);
            this.ws.onopen = () => { this.onOpen(); };
            this.ws.onclose = () => { this.onClose(); };
            this.ws.onerror = (err) => { this.onError(err); };
            this.ws.onmessage = (event) => { this.onGetMessage(event); };
        });
    }
    reConnect() {
        setTimeout(() => {
            this.tryConnect();
        }, 1000);
    }
    onClose() {
        this.connecting = false;
        this.reConnect();
    }
    onError(error) {
        console.log('ws onerror:', error);
        this.connecting = false;
        this.reConnect();
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connecting = false;
            this.onConnected();
        });
    }
    onGetMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = JSON.parse(msg.data.toString());
            this.onReceiveMsg(data);
        });
    }
}
exports.default = Socket;
