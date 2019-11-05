"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comunion_dao_1 = require("comunion-dao");
const lock_1 = __importDefault(require("../common/lock"));
const utils_1 = __importDefault(require("../common/utils"));
const block_data_loader_1 = __importDefault(require("./block-data-loader"));
const block_discover_1 = __importDefault(require("./block-discover"));
const constants_1 = __importDefault(require("./constants"));
class SyncService {
    constructor(listener) {
        this.lock = new lock_1.default();
        this.running = false;
        this.comunionStartBlockHeight = null;
        this.blockDiscover = new block_discover_1.default(listener);
        this.listener = listener;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ethUtils = new comunion_dao_1.EthUtils(yield this.getHttpRpcUrl());
            this.startDiscover();
            this.checkAndStartLoader();
        });
    }
    startDiscover() {
        this.blockDiscover.start((currentBlockHeight) => {
            this.currentBlockHeight = currentBlockHeight;
            this.checkAndStartLoader();
        });
    }
    checkAndStartLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.running) {
                return;
            }
            yield this.lock.run(() => {
                if (this.running) {
                    return;
                }
                this.running = true;
                this.startLoader();
            });
        });
    }
    startLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            let lastBlock = this.listener.getLastBlockHeight();
            if (lastBlock instanceof Promise) {
                lastBlock = yield lastBlock;
            }
            if (!lastBlock) {
                lastBlock = (yield this.getComunionStartBlockHeight()) - 1;
            }
            if (lastBlock >= this.currentBlockHeight) {
                yield this.clearRunningFlag();
                return;
            }
            let toBlock = lastBlock + constants_1.default.LOADER_BATCH_SIZE;
            if (toBlock > this.currentBlockHeight) {
                toBlock = this.currentBlockHeight;
            }
            let loader = new block_data_loader_1.default(lastBlock + 1, toBlock, this.ethUtils, this.listener);
            let result = yield loader.getDatas();
            for (let i = 0; i < result.datas.length; ++i) {
                yield this.saveBlockData(result.datas[i]);
            }
            if (result.datas.length == 0 || result.datas[result.datas.length - 1].blockHeight != result.toBlock) {
                yield this.saveBlockData({
                    blockHeight: result.toBlock,
                    blockHash: null,
                    datas: []
                });
            }
            yield this.clearRunningFlag();
            this.checkAndStartLoader();
        });
    }
    getComunionStartBlockHeight() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.comunionStartBlockHeight == null) {
                let h = this.listener.getComunionStartBlockHeight();
                if (h instanceof Promise) {
                    h = yield h;
                }
                this.comunionStartBlockHeight = h;
            }
            return this.comunionStartBlockHeight;
        });
    }
    clearRunningFlag() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lock.run(() => {
                this.running = false;
            });
        });
    }
    getHttpRpcUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.listener.getHttpsRpcUrl();
            if (url instanceof Promise) {
                url = yield url;
            }
            return url;
        });
    }
    saveBlockData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let r = this.listener.saveBlockData(data);
                if (r instanceof Promise) {
                    yield r;
                }
            }
            catch (e) {
                console.trace('SyncService.saveBlockData error:', e);
                yield utils_1.default.sleep(5000);
                yield this.saveBlockData(data);
            }
        });
    }
}
exports.default = SyncService;
