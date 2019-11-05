"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_service_1 = __importDefault(require("./service/sync-service"));
class SyncTask {
    getHttpsRpcUrl() {
        // TODO: 返回 eth json rpc 地址, 如 infura 的 ropsten为: 'https://ropsten.infura.io/v3/<appid>'
        throw new Error("Method not implemented.");
    }
    getWSUrl() {
        // TODO: 返回 infura websocket 地址, 如 ropsten 为: 'wss://ropsten.infura.io/ws/v3/<appid>'
        throw new Error("Method not implemented.");
    }
    getDaosAddress() {
        // TODO: 返回 Daos 合约地址, ropsten 测试地址为: '0x7284C823ea3AD29bEDfd09Ede1107981E9519896'
        throw new Error("Method not implemented.");
    }
    getComunionStartBlockHeight() {
        // TODO: 返回Daos发布时高度 或者 第一个组织发布时高度，将从这个高度开始同步
        throw new Error("Method not implemented.");
    }
    getLastBlockHeight() {
        // TODO: 返回最新同步完成区块高度
        throw new Error("Method not implemented.");
    }
    isOrganization(contractAddress) {
        // TODO: 返回 contractAddress 是否为 平台内组织的合约地址
        throw new Error("Method not implemented.");
    }
    isOrgTokenAndOwner(tokenContract, account) {
        // TODO: 返回 tokenContract 是否为 平台内组织Token的合约地址并且 account 为组织Token 的Owner (2.0版本 组织与组织Token的Owner为同一个地址)
        throw new Error("Method not implemented.");
    }
    /**
     * 当发现新的区块包含comunion业务数据时回调，
     * 同时要保存 blockHeight 为 lastBlockHeight 到数据库， 当调用 getLastBlockHeight 方法时，返回此lastBlockHeight.
     *
     * 这个方法内存储数据时必须是事务性的，要么都成功，要么都失败,
     * 并且一定要是阻塞式，或者是返回Promise类型，保证数据保存完成才回调.
     * 并且 data.datas 需要按顺序保存
     * @param data
     */
    saveBlockData(data) {
        // TODO: 事务开始
        try {
            data.datas.forEach(d => {
                switch (d.type) {
                    case 'NewOrgData': {
                        let data = d;
                        // TODO: 新组织注册
                        break;
                    }
                    case 'SetTokenData': {
                        let data = d;
                        // TODO: 给组织设置Token
                        break;
                    }
                    case 'SetMemberData': {
                        let data = d;
                        // TODO: 组织添加或者设置成员角色
                        break;
                    }
                    case 'RemoveMemberData': {
                        let data = d;
                        // TODO: 删除组织成员
                        break;
                    }
                    case 'SetSubAccountData': {
                        let data = d;
                        // TODO: 给组织设添加或者置子账号描述
                        break;
                    }
                    case 'RemoveSubAccountData': {
                        let data = d;
                        // TODO: 删除组织子账号
                        break;
                    }
                    case 'ApprovalData': {
                        let data = d;
                        // TODO: Owner更新某账号授权额度
                        break;
                    }
                    case 'TransferData': {
                        let data = d;
                        // TODO: Owner账号转出记录
                        break;
                    }
                }
            });
            // TODO: 保存最后同步完成的区块 data.blockHeight
            // TODO: 事务提交
        }
        catch (e) {
            // TODO: 事务回滚
            // 需要抛出异常，让service知道失败了
            throw e;
        }
    }
}
let service = new sync_service_1.default(new SyncTask());
service.start();
