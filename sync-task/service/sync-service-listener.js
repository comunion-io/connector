"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 新组织数据
 */
class NewOrgData {
    constructor() {
        this.type = "NewOrgData";
    }
}
exports.NewOrgData = NewOrgData;
/**
 * 新组织Token 或者 设置组织Token数据
 */
class SetTokenData {
    constructor() {
        this.type = "SetTokenData";
    }
}
exports.SetTokenData = SetTokenData;
/**
 * 添加或者设置成员角色数据
 */
class SetMemberData {
    constructor() {
        this.type = "SetMemberData";
    }
}
exports.SetMemberData = SetMemberData;
/**
 * 删除成员数据
 */
class RemoveMemberData {
    constructor() {
        this.type = "RemoveMemberData";
    }
}
exports.RemoveMemberData = RemoveMemberData;
/**
 * 添加或者设置子账号数据
 */
class SetSubAccountData {
    constructor() {
        this.type = "SetSubAccountData";
    }
}
exports.SetSubAccountData = SetSubAccountData;
/**
 * 删除子账号数据
 */
class RemoveSubAccountData {
    constructor() {
        this.type = "RemoveSubAccountData";
    }
}
exports.RemoveSubAccountData = RemoveSubAccountData;
/**
 * 授权额度数据(只记录组织Token Owner的授权情况, 用于记录主账号对子账号授权额度)
 */
class ApprovalData {
    constructor() {
        this.type = "ApprovalData";
    }
}
exports.ApprovalData = ApprovalData;
/**
 * 转账数据(只记录组织Token Owner的转出数据)
 */
class TransferData {
    constructor() {
        this.type = "TransferData";
    }
}
exports.TransferData = TransferData;
/**
 * 区块数据
 */
class BlockData {
    constructor() {
        this.datas = [];
    }
}
exports.BlockData = BlockData;
