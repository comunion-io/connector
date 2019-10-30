/**
 * 新组织数据
 */
class NewOrgData {
    type = "NewOrgData"
    owner: string
    name: string
    address: string
    txHash: string
}

/**
 * 新组织Token 或者 设置组织Token数据
 */
class SetTokenData {
    type = "SetTokenData"
    orgAddress: string
    tokenAddress: string
    txHash: string
}

/**
 * 添加或者设置成员角色数据
 */
class SetMemberData {
    type = "SetMemberData"
    orgAddress: string
    member: string
    role: string
    txHash: string
}

/**
 * 删除成员数据
 */
class RemoveMemberData {
    type = "RemoveMemberData"
    orgAddress: string
    member: string
    txHash: string
}

/**
 * 添加或者设置子账号数据
 */
class SetSubAccountData {
    type = "SetSubAccountData"
    orgAddress: string
    account: string
    desc: string
    txHash: string
}

/**
 * 删除子账号数据
 */
class RemoveSubAccountData {
    type = "RemoveSubAccountData"
    orgAddress: string
    account: string
    txHash: string
}

/**
 * 授权额度数据(只记录组织Token Owner的授权情况, 用于记录主账号对子账号授权额度)
 */
class ApprovalData {
    type = "ApprovalData"
    tokenAddress: string
    owner: string
    spender: string
    value: string
    txHash: string
}

/**
 * 转账数据(只记录组织Token Owner的转出数据)
 */
class TransferData {
    type = "TransferData"
    tokenAddress: string
    from: string
    to: string
    value: string
    txHash: string
}

/**
 * 区块数据
 */
class BlockData {
    blockHash: string
    blockHeight: number
    datas: (NewOrgData | SetTokenData | SetMemberData | RemoveMemberData | SetSubAccountData | RemoveSubAccountData | ApprovalData | TransferData)[] = []
}

/**
 * 同步服务依赖接口
 */
interface SyncServiceListener {

    /**
     * 获取 http rpc 地址
     */
    getHttpsRpcUrl(): string | Promise<string>

    /**
     * 获取 infra ws 地址
     */
    getWSUrl(): string | Promise<string>

    /**
     * 获取 comunion Daos合约地址
     */
    getDaosAddress(): string | Promise<string>

    /**
     * 获取 comunion Daos合约发布的高度 或者 第一个组织创建时的高度
     */
    getComunionStartBlockHeight(): number | Promise<number>

    /**
     * 获取数据同步的最新高度, 如果还未同步过，返回null
     */
    getLastBlockHeight(): number | Promise<number>

    /**
     * 返回是否为comunion平台的组织地址
     * @param contractAddress 
     */
    isOrganization(contractAddress: string): boolean | Promise<boolean>

    /**
     * 当 tokenContract 为系统内的组织的Token地址, 
     * 并且account 为 tokenContract 的 owner 时才返回true 否则false (当前2.0版本 token与organization的owner为同一个人)
     * @param tokenContract 
     * @param account 
     */
    isOrgTokenAndOwner(tokenContract: string, account: string): boolean | Promise<boolean>

    /**
     * 当发现新的区块包含comunion业务数据时回调，
     * 同时要保存 blockHeight 为 lastBlockHeight 到数据库， 当调用 getLastBlockHeight 方法时，返回此lastBlockHeight.
     * 
     * 这个方法内存储数据时必须是事务性的，要么都成功，要么都失败,
     * 并且一定要是阻塞式，或者是返回Promise类型，保证数据保存完成才回调.
     * @param data 
     */
    saveBlockData(data: BlockData): any | Promise<any>
}


export { SyncServiceListener, NewOrgData, SetTokenData, SetMemberData, RemoveMemberData, SetSubAccountData, RemoveSubAccountData, ApprovalData, TransferData, BlockData }
