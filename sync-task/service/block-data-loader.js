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
const linq_1 = __importDefault(require("linq"));
const constants_1 = __importDefault(require("./constants"));
const utils_1 = __importDefault(require("../common/utils"));
const comunion_dao_1 = require("comunion-dao");
const sync_service_listener_1 = require("./sync-service-listener");
const lock_1 = __importDefault(require("../common/lock"));
class BlockDatas {
}
class RawLogsLoader {
    constructor(fromBlock, toBlock, ethUtils) {
        this.lock = new lock_1.default();
        this.completed = 0;
        this.count = constants_1.default.TOPICS.length;
        this.fromBlock = fromBlock;
        this.toBlock = toBlock;
        this.ethUtils = ethUtils;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            return new Promise((resolve, reject) => {
                for (let i = 0; i < this.count; i++) {
                    let f = () => __awaiter(this, void 0, void 0, function* () {
                        let r = yield this.loadTopic(constants_1.default.TOPICS[i]);
                        this.lock.run(() => {
                            result = result.concat(r);
                            this.completed += 1;
                            if (this.completed == this.count) {
                                resolve(result);
                            }
                        });
                    });
                    f();
                }
            });
        });
    }
    loadTopic(topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let options = {
                    fromBlock: this.fromBlock,
                    toBlock: this.toBlock,
                    topics: [topic]
                };
                return yield this.ethUtils.web3.eth.getPastLogs(options);
            }
            catch (e) {
                console.log('loadTopic error:', e);
                yield utils_1.default.sleep(5000);
                return yield this.loadTopic(topic);
            }
        });
    }
}
class BlockDataLoader {
    constructor(fromBlock, toBlock, ethUtils, listener) {
        this.daosAddress = null;
        this.fromBlock = fromBlock;
        this.toBlock = toBlock;
        this.ethUtils = ethUtils;
        this.listener = listener;
        this.abiDecoder = require('abi-decoder');
        this.abiDecoder.addABI(comunion_dao_1.AbiManager.getAbiAndBytecode('Daos').abi);
        this.abiDecoder.addABI(comunion_dao_1.AbiManager.getAbiAndBytecode('Organization').abi);
        this.abiDecoder.addABI(comunion_dao_1.AbiManager.getAbiAndBytecode('OrgToken').abi);
    }
    getDatas() {
        return __awaiter(this, void 0, void 0, function* () {
            let rawLogs = yield new RawLogsLoader(this.fromBlock, this.toBlock, this.ethUtils).load();
            let logs = [];
            rawLogs.forEach((rlog) => {
                try {
                    let log = this.abiDecoder.decodeLogs([rlog])[0];
                    if (log) {
                        log['blockNumber'] = rlog['blockNumber'];
                        log['blockHash'] = rlog['blockHash'];
                        log['txHash'] = rlog['transactionHash'];
                        log['address'] = log['address'].toLowerCase();
                        logs.push(log);
                    }
                }
                catch (e) {
                    // console.log('abiDecoder.decodeLogs error:', e)
                }
            });
            return {
                fromBlock: this.fromBlock,
                toBlock: this.toBlock,
                datas: yield this.parseLogs(logs)
            };
        });
    }
    parseLogs(logs) {
        return __awaiter(this, void 0, void 0, function* () {
            let daosAddr = yield this.getDaosAddress();
            let datas = {};
            let newOrgLogs = linq_1.default.from(logs).where(log => log['name'] == 'RegDao' && log['address'].toLowerCase() == daosAddr.toLowerCase()).toArray();
            yield this.addLogs(datas, newOrgLogs);
            let otherLogs = linq_1.default.from(logs).where(log => log['name'] !== 'RegDao').toArray();
            yield this.addLogs(datas, otherLogs);
            let r = Object.values(datas).sort((a, b) => { return a.blockHeight > b.blockHeight ? 1 : -1; });
            return linq_1.default.from(r).where(d => d.datas.length > 0).toArray();
        });
    }
    addLogs(datas, logs) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < logs.length; i++) {
                yield this.addLog(datas, logs[i]);
            }
        });
    }
    addLog(datas, log) {
        return __awaiter(this, void 0, void 0, function* () {
            let blockHeight = log['blockNumber'];
            let d = datas[blockHeight];
            if (!d) {
                d = new sync_service_listener_1.BlockData();
                d.blockHeight = blockHeight;
                d.blockHash = log['blockHash'];
                datas[blockHeight] = d;
            }
            yield this.addBlockLog(d, log);
        });
    }
    addBlockLog(blockData, log) {
        return __awaiter(this, void 0, void 0, function* () {
            let d = null;
            switch (log['name']) {
                case 'RegDao':
                    d = new sync_service_listener_1.NewOrgData();
                    d.txHash = log['txHash'];
                    d.name = this.getLogValue(log, 'name');
                    d.address = this.getLogValue(log, 'addr');
                    blockData.datas.push(d);
                    break;
                case 'OwnershipTransferred':
                    this.updateOwner(blockData, log['address'], this.getLogValue(log, 'newOwner'));
                    break;
                case 'SetMemberRole':
                    if (yield this.isOrganization(blockData, log['address'])) {
                        d = new sync_service_listener_1.SetMemberData();
                        d.txHash = log['txHash'];
                        d.orgAddress = log['address'];
                        d.member = this.getLogValue(log, 'member');
                        d.role = this.ethUtils.web3.utils.hexToUtf8(this.getLogValue(log, 'role'));
                        blockData.datas.push(d);
                    }
                    break;
                case 'RemoveMember':
                    if (yield this.isOrganization(blockData, log['address'])) {
                        d = new sync_service_listener_1.RemoveMemberData();
                        d.txHash = log['txHash'];
                        d.orgAddress = log['address'];
                        d.member = this.getLogValue(log, 'member');
                        blockData.datas.push(d);
                    }
                    break;
                case 'SetSubAccount':
                    if (yield this.isOrganization(blockData, log['address'])) {
                        d = new sync_service_listener_1.SetSubAccountData();
                        d.txHash = log['txHash'];
                        d.orgAddress = log['address'];
                        d.account = this.getLogValue(log, 'account');
                        d.desc = this.ethUtils.web3.utils.hexToUtf8(this.getLogValue(log, 'desc'));
                        blockData.datas.push(d);
                    }
                    break;
                case 'RemoveSubAccount':
                    if (yield this.isOrganization(blockData, log['address'])) {
                        d = new sync_service_listener_1.RemoveSubAccountData();
                        d.txHash = log['txHash'];
                        d.orgAddress = log['address'];
                        d.account = this.getLogValue(log, 'account');
                        blockData.datas.push(d);
                    }
                    break;
                case 'SetToken':
                    if (yield this.isOrganization(blockData, log['address'])) {
                        d = new sync_service_listener_1.SetTokenData();
                        d.txHash = log['txHash'];
                        d.orgAddress = log['address'];
                        d.tokenAddress = this.getLogValue(log, 'token');
                        blockData.datas.push(d);
                    }
                    break;
                case 'Transfer':
                    let from = this.getLogValue(log, 'from');
                    if (yield this.isOrgTokenAndOwner(log['address'], from)) {
                        d = new sync_service_listener_1.TransferData();
                        d.txHash = log['txHash'];
                        d.tokenAddress = log['address'];
                        d.from = from;
                        d.to = this.getLogValue(log, 'to');
                        d.value = this.getLogValue(log, 'value');
                        blockData.datas.push(d);
                    }
                    break;
                case 'Approval':
                    let owner = this.getLogValue(log, 'owner');
                    if (yield this.isOrgTokenAndOwner(log['address'], owner)) {
                        d = new sync_service_listener_1.ApprovalData();
                        d.txHash = log['txHash'];
                        d.tokenAddress = log['address'];
                        d.owner = owner;
                        d.spender = this.getLogValue(log, 'spender');
                        d.value = this.getLogValue(log, 'value');
                        blockData.datas.push(d);
                    }
                    break;
                default:
                    break;
            }
            return d;
        });
    }
    updateOwner(blockData, address, newOwner) {
        let d = linq_1.default.from(blockData.datas).firstOrDefault(d => (d.type == 'NewOrgData') && d['address'].toLowerCase() == address.toLowerCase());
        if (d) {
            d.owner = newOwner;
        }
    }
    getLogValue(log, name) {
        let events = log['events'];
        let e = linq_1.default.from(events).firstOrDefault(e => e['name'] == name);
        if (e) {
            return e['value'];
        }
        return null;
    }
    isOrgTokenAndOwner(tokenAddress, account) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = this.listener.isOrgTokenAndOwner(tokenAddress, account);
            if (r instanceof Promise) {
                r = yield r;
            }
            return r;
        });
    }
    isOrganization(data, address) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = linq_1.default.from(data.datas).any(d => (d.type == 'NewOrgData') && d['address'].toLowerCase() == address.toLowerCase());
            if (!r) {
                let t = this.listener.isOrganization(address);
                if (t instanceof Promise) {
                    t = yield t;
                }
                r = t;
            }
            return r;
        });
    }
    getDaosAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.daosAddress == null) {
                let a = this.listener.getDaosAddress();
                if (a instanceof Promise) {
                    a = yield a;
                }
                this.daosAddress = a.toLowerCase();
            }
            return this.daosAddress;
        });
    }
}
exports.default = BlockDataLoader;
