## Database 设计

---

org: 组织对象

|key|desc|value|
|-|-|-|
|name|组织名 **unique**|"Comunion"|
|type|组织类型|"Personal"|
|logo|组织logo|"http://comunion-avatar.sgp1.digitaloceanspaces.com/xxx"|
|website|组织官网|"comunion.io"|
|mission|组织使命|"Make Yourself Better"|
|vision|组织愿景|"Enjoy the World"|
|description|组织介绍|"blablabla..."|
|social|组织社交账号|[{"name": "facebook", "value": "facebook.com/xxx"}, ...]|
|members|组织成员 DBRef|[user_id, user_id, ...]|
|email|创建者邮箱|"xxx@comunion.io"|
|wallet|创建者钱包 **在v2.0仅支持账户钱包一一绑定**|[{"name":"eth", "value":"0xd7f22d785913db334f9adad38cf0a5538ad423e9"}]|
|icon|代币icon|""http://comunion-avatar.sgp1.digitaloceanspaces.com/xxx""|
|asset|代币信息|{"contract:": "0xd7f22d785913db334f9adad38cf0a5538ad423e9", "name": "Comunion Token", "symbol": "UVU", "decimal": 8, "supply": 100000000}|
|finance|财务子钱包|[{"name": "eth", "address": "0xd7f22d785913db334f9adad38cf0a5538ad423e9", "budget": 1000000, "usage": "salary"}, ...]|
|contract|组织合约地址|"0xd7f22d785913db334f9adad38cf0a5538ad423e9"|
|lastUpdated|组织上次更新时间|1570972336432|
|dateCreated|组织创建时间|1570972336432|

---

user: 成员对象

|key|desc|value|
|-|-|-|
|email|账户邮箱 **unique**|"xxx@comunion.io"|
|name|用户昵称|"oops"|
|logo|用户头像|"http://comunion-avatar.sgp1.digitaloceanspaces.com/xxx"|
|social|用户社交账号|[{"name": "facebook", "value": "facebook.com/xxx"}, ...]|
|skills|用户技能|["ui", "dev", ...]|
|wallet|用户钱包 **在v2.0仅支持账户钱包一一绑定**|[{"name":"eth","address":"0xd7f22d785913db334f9adad38cf0a5538ad423e9", "usage": "default"}]|
|orgs|用户所在组织 DBRef|[org_id, org_id, ...]|

---

record: 转账记录对象

|key|desc|value|
|-|-|-|
|org_id|所属组织|"5da322b0b9f968051ee3578b"|
|sender|发送者|"0xd7f22d785913db334f9adad38cf0a5538ad423e9"|
|receiver|接收者|"0xd7f22d785913db334f9adad38cf0a5538ad423e9"|
|txHash|交易哈希|"0xfe686161e8aa95f6a4c42dec49dd2581cfc4984f3803a336ebada604c46415fd"|
|token|代币类型|"ETH"|
|amount|数量|1000000000000000000|
|remark|备注|"完成v1.0原型设计稿"|

---

sync: 同步高度记录

|key|desc|value|
|-|-|-|
|start|起始高度|6769890|
|last|同步高度|6830000|

---

tx: 链上交易记录

|key|desc|value|
|-|-|-|
|txHash|交易哈希|"0xfe686161e8aa95f6a4c42dec49dd2581cfc4984f3803a336ebada604c46415fd"|
|userId|交易发起人ID|"5db13593b9f968051ee3578d"|
|type|操作类型|NewOrgData,SetTokenData,SetMemberData,RemoveMemberData,ApprovalData,TransferData|
|data|非上链更新数据|数据类型参见user,org,record结构。|
|status|交易状态|0失败，1成功,2pending(前端初始化状态为2)|

**不同type的data数据说明：**

- NewOrgData

数据为组织信息

```js
{
    "name":"test",
    "type":"Business",
    "logo":"",
    "email":"test@test.com"
    ...
}
```
- SetTokenData

数据为org的asset信息

```js
{
    "asset":{
	    "name":"HelloWorld",
	    "symbol":"HW",
	    "supply":"102400",
		"txHash":"0x628bef01616704edd7432ab9d6307628b269543f34a79f33c3edf3c50e97d7b3"
	}
}
```
- SetMemberData|RemoveMemberData

数据为成员信息

```js
{
    "userId":"5da322b0b9f968051ee3578c",
    "role":"member",
	"txHash":"0x628bef01616704edd7432ab9d6307628b269543f34a79f33c3edf3c50e97d7b3"
}
```

- ApprovalData

数据为财务子账号信息

```js
{
    "tokenAddress":"0x32Ae6D72bEfb5d306F2b0d9f1b626334B2136bb8",
    "budget":"10000000",
	"txHash":"0x628bef01616704edd7432ab9d6307628b269543f34a79f33c3edf3c50e97d7b3"
}
```
- TransferData

数据为转账记录详情

```js
{
    "tokenAddress":"0x32Ae6D72bEfb5d306F2b0d9f1b626334B2136bb8",
    "value":"10000000",
	"txHash":"0x628bef01616704edd7432ab9d6307628b269543f34a79f33c3edf3c50e97d7b3"
}
```