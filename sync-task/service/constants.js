"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const web3 = new web3_1.default(null);
class Constants {
}
/**
 * 获取链上日志时，一次性获取区块个数
 */
Constants.LOADER_BATCH_SIZE = 10;
/**
 * 需要处理的 topics
 */
Constants.TOPICS = [
    web3.utils.sha3('RegDao(address,string)'),
    web3.utils.sha3('OwnershipTransferred(address,address)'),
    web3.utils.sha3('SetToken(address)'),
    web3.utils.sha3('SetMemberRole(address,bytes32)'),
    web3.utils.sha3('RemoveMember(address)'),
    web3.utils.sha3('Approval(address,address,uint256)'),
    web3.utils.sha3('Transfer(address,address,uint256)')
];
exports.default = Constants;
