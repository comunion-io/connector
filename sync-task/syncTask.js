"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_service_1 = __importDefault(require("./service/sync-service"));

class SyncTask {
    getHttpsRpcUrl() {
        // 返回 eth json rpc 地址, 如 infura 的 ropsten为: 'https://ropsten.infura.io/v3/<appid>'
        return setting.web3Address;
    }
    getWSUrl() {
        // 返回 infura websocket 地址, 如 ropsten 为: 'wss://ropsten.infura.io/ws/v3/<appid>'
        return 'wss://ropsten.infura.io/ws/v3/' + setting.infura_appid;
    }
    getDaosAddress() {
        // 返回 Daos 合约地址, ropsten 测试地址为: '0x7284C823ea3AD29bEDfd09Ede1107981E9519896'
        return '0x7284C823ea3AD29bEDfd09Ede1107981E9519896'
    }
    getComunionStartBlockHeight() {
        // 返回Daos发布时高度 或者 第一个组织发布时高度，将从这个高度开始同步
        return 8877398
    }
    getLastBlockHeight() {
        // 返回最新同步完成区块高度
        let sync = await dao.get(db, "sync", {});
        if (sync) {
            return sync.last;
        } else {
            let height = this.getComunionStartBlockHeight();
            await dao.save(db, "sync", {last: height})
            return height;
        }
    }
    isOrganization(contractAddress) {
        // 返回 contractAddress 是否为 平台内组织的合约地址
        let org = await dao.get(db, "org", {contract: contractAddress});
        return org != null;
    }
    isOrgTokenAndOwner(tokenContract, account) {
        // 返回 tokenContract 是否为 平台内组织Token的合约地址并且 account 为组织Token 的Owner (2.0版本 组织与组织Token的Owner为同一个地址)
        let org = await dao.get(db, "org", {"asset.contract": tokenContract});
        if (org != null) {
            return org.email === account;
        }
        return false;
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
                        // 新组织注册
                        await dao.findAndUpdate(db, "org", {name: data.name}, {contract: data.address});
                        break;
                    }
                    case 'SetTokenData': {
                        let data = d;
                        // 给组织设置Token
                        await dao.findAndUpdate(db, "org", {contract: data.orgAddress}, {"asset.contract": data.tokenAddress});
                        break;
                    }
                    case 'SetMemberData': {
                        let data = d;
                        // 组织添加或者设置成员角色
                        let org = await dao.get(db, "org", {contract: data.orgAddress});
                        let members = new Set(org.members);
                        members.add(data.member);
                        await dao.findAndUpdate(db, "org", {contract: data.orgAddress}, {members: [...members]});
                        break;
                    }
                    case 'RemoveMemberData': {
                        let data = d;
                        // 删除组织成员
                        let org = await dao.get(db, "org", {contract: data.orgAddress});
                        let members = new Set(org.members);
                        members.delete(data.member);
                        await dao.findAndUpdate(db, "org", {contract: data.orgAddress}, {members: [...members]});
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
                        // Owner更新某账号授权额度
                        let org = await dao.get(db, "org", {contract: data.orgAddress});
                        let finance = org.finance || [];
                        let update = false;
                        for (let key in finance) {
                            let item = finance[key]
                            if (item.value === data.spender) {
                                item.budget = data.value;
                                update = true;
                                break;
                            }
                        }
                        if (!update) {
                            let item = {
                                value: data.spender,
                                budget: data.value
                            }
                            finance.push(item);
                        }
                        await dao.findAndUpdate(db, "org", {contract: data.orgAddress}, {finance: finance});
                        break;
                    }
                    case 'TransferData': {
                        let data = d;
                        // Owner账号转出记录
                        let org = await dao.get(db, "org", {"asset.contract": data.tokenAddress});
                        let record = {
                            org_id: org._id,
                            sender: data.from,
                            receiver: data.to,
                            txhash: data.txHash,
                            token: org.asset.symbol,
                            amount: data.value
                        }
                        await dao.save(db, "record", record);
                        break;
                    }
                }
            });
            // 保存最后同步完成的区块 data.blockHeight
            let height = data.blockHeight;
            await dao.findAndUpdate(db, "sync", {}, {last: height});

            // TODO: 事务提交
        }
        catch (e) {
            // TODO: 事务回滚
            // 需要抛出异常，让service知道失败了
            throw e;
        }
    }
}

module.exports = {
    start: function() {
        let service = new sync_service_1.default(new SyncTask());
        service.start();
        return service;
    }
}
