"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_service_1 = __importDefault(require("./service/sync-service"));

async function updateOrgMember(isAdd, data) {
    let tx = await dao.get(db, "tx", {txHash: data.txHash});
    let org = await dao.get(db, "org", {contract: data.orgAddress.toLocaleLowerCase()});
    let members = org.members || [];
    let found = false;
    for (let key in members) {
        let member = members[key];
        if (member.address === data.member) {
            if (!isAdd) {
                members.splice(key, 1);
            } else {
                member.role = data.role;
                member.txHash = data.txHash;
                found = true;
            }
            if (tx != null) {
                _.extend(member, tx.data);
            }
            break;
        }
    }
    if (isAdd && !found) {
        let user = await dao.get(db, "user", {"wallet.address": data.member.toLocaleLowerCase()});
        if (user != null) {
            let member = {
                userId: user._id,
                address: data.member.toLocaleLowerCase(),
                role: data.role,
                txHash: data.txHash
            };
            if (tx != null) {
                _.extend(member, tx.data);
            }
            members.push(member);
        }
    }

    await dao.findAndUpdate(db, "org", {contract: data.orgAddress.toLocaleLowerCase()}, {$set: {members: members}});
}

class SyncTask {

    async getHttpsRpcUrl() {
        // 返回 eth json rpc 地址, 如 infura 的 ropsten为: 'https://ropsten.infura.io/v3/<appid>'
        return setting.web3Address;
    }
    async getWSUrl() {
        // 返回 infura websocket 地址, 如 ropsten 为: 'wss://ropsten.infura.io/ws/v3/<appid>'
        return 'wss://ropsten.infura.io/ws/v3/' + setting.infura_appid;
    }
    async getDaosAddress() {
        // 返回 Daos 合约地址, ropsten 测试地址为: '0x7284C823ea3AD29bEDfd09Ede1107981E9519896'
        return '0x7284C823ea3AD29bEDfd09Ede1107981E9519896'
    }
    async getComunionStartBlockHeight() {
        // 返回Daos发布时高度 或者 第一个组织发布时高度，将从这个高度开始同步
        return 6769890
    }
    async getLastBlockHeight() {
        // 返回最新同步完成区块高度
        let sync = await dao.one(db, "sync", {});
        // console.log("last sync:",sync)
        if (sync) {
            return sync.last;
        } else {
            let height = await this.getComunionStartBlockHeight();
            await dao.findAndUpdate(db, "sync", {}, {$set: {start:height, last: height}});
            return height;
        }
    }
    async isOrganization(contractAddress) {
        // 返回 contractAddress 是否为 平台内组织的合约地址
        let org = await dao.get(db, "org", {contract: contractAddress.toLocaleLowerCase()});
        return org != null;
    }
    async isOrgTokenAndOwner(tokenContract, account) {
        // 返回 tokenContract 是否为 平台内组织Token的合约地址并且 account 为组织Token 的Owner (2.0版本 组织与组织Token的Owner为同一个地址)
        let org = await dao.get(db, "org", {"asset.contract": tokenContract});
        if (org != null) {
            return org.owner === account.toLocaleLowerCase();
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
    async saveBlockData(data) {
        // TODO: 事务开始
        try {
            for (let idx = 0; idx < data.datas.length; idx++) {
                let d = data.datas[idx];
                console.log("sync data:", data.blockHeight, d);
                switch (d.type) {
                    case 'NewOrgData': {
                        let data = d;
                        // 新组织注册
                        let tx = await dao.get(db, "tx", {txHash: data.txHash});
                        let raw = {
                            owner: data.owner.toLocaleLowerCase(), 
                            contract: data.address.toLocaleLowerCase(), 
                            txHash: data.txHash
                        };
                        if (tx != null) {
                            _.extend(raw, tx.data);
                        }
                        // await dao.findAndUpdate(db, "org", {name: data.name}, {$set: raw});
                        await dao.save(db, "org", raw)
                        break;
                    }
                    case 'SetTokenData': {
                        let data = d;
                        // 给组织设置Token
                        let tx = await dao.get(db, "tx", {txHash: data.txHash});
                        let raw = {
                            asset: {
                                contract: data.tokenAddress.toLocaleLowerCase(),
                                txHash: data.txHash
                            }
                        };
                        if (tx != null) {
                            _.extend(raw, tx.data);
                        }
                        await dao.findAndUpdate(db, "org", {contract: data.orgAddress.toLocaleLowerCase()}, {$set: raw});
                        break;
                    }
                    case 'SetMemberData': {
                        let data = d;
                        // 组织添加或者设置成员角色
                        await updateOrgMember(true, data);
                        break;
                    }
                    case 'RemoveMemberData': {
                        let data = d;
                        // 删除组织成员
                        await updateOrgMember(false, data);
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
                        let tx = await dao.get(db, "tx", {txHash: data.txHash});
                        let org = await dao.get(db, "org", {"asset.contract": data.tokenAddress.toLocaleLowerCase()});
                        let finance = org.finance || [];
                        let update = false;
                        for (let key in finance) {
                            let item = finance[key]
                            if (item.txHash === data.txHash) {
                                if (item.value === "0") {
                                    finance.splice(key, 1);
                                } else {
                                    item.budget = data.value;
                                    item.address = data.spender.toLocaleLowerCase();
                                }
                                if (tx != null) {
                                    _.extend(item, tx.data);
                                }
                                update = true;
                                break;
                            }
                        }
                        if (!update) {
                            let item = {
                                tokenAddress: data.tokenAddress.toLocaleLowerCase(),
                                address: data.spender,
                                budget: data.value,
                                txHash: data.txHash
                            }
                            if (tx != null) {
                                _.extend(item, tx.data);
                            }
                            finance.push(item);
                        }
                        await dao.findAndUpdate(db, "org", {_id: org._id}, {$set:{finance: finance}});
                        break;
                    }
                    case 'TransferData': {
                        let data = d;
                        // Owner账号转出记录
                        let tx = await dao.get(db, "tx", {txHash: data.txHash});
                        let org = await dao.get(db, "org", {"asset.contract": data.tokenAddress.toLocaleLowerCase()});
                        let record = {
                            org_id: org._id,
                            sender: data.from.toLocaleLowerCase(),
                            receiver: data.to.toLocaleLowerCase(),
                            txHash: data.txHash,
                            token: org.asset.symbol,
                            amount: data.value
                        }
                        if (tx != null) {
                            _.extend(record, tx.data);
                        }
                        await dao.save(db, "record", record);
                        break;
                    }
                }
                await dao.findAndUpdate(db, "tx", {txHash: d.txHash}, {$set: {status: 1}});
            }

            // 保存最后同步完成的区块 data.blockHeight
            let height = data.blockHeight;
            await dao.findAndUpdate(db, "sync", {}, {$set: {last: height}});
            // console.log("sync height:", height);

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
    service: function () {
        let service = new sync_service_1.default(new SyncTask());
        return service;
    }
};
