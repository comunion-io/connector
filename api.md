## Restful API 规范

---

### 资源型接口

```增删改查对象```

#### 基本操作
|method|action|
|---|---|
|post|save|
|put|edit|
|delete|del|
|patch|edit|
|get|list|

#### 请求格式

```/r/资源名/参数```

- 分页请求

```get /r/资源名/参数/?offset=xxx&max=xxx```

其中，offset为偏移量, max为一页显示个数

#### 返回格式

> **[TODO] 需要修改代码中的返回格式，添加code，约定错误码形式**

```{code: 0, msg: '', data: {...} }```

- 单个资源

```{code: 0, msg: '', data: { entity: {...} } }```


- 列表资源

```{code: 0, msg: '', data: { entities: {...}, count: 10}}```

#### API 实例

v1.0

> **Notice: 缺少:entity列表，需要补充数据库信息**

- 获取实例列表信息

```get /r/:entity```

- 获取实例总个事

```get /r/count/:entity```

- 获取单个实例信息

```get /r/:entity/:id```

- 根据实例的某个key的值查询信息

```get /r/:entity/:key/:val```

- 创建实例

```post /r/:entity```

- 修改单个实例信息
  
```put /r/:entity/:id```

- 删除单个实例

```delete /r/:entity/:id```

- 聚合查询

```/r/agg/:entity``` 

---

> **Notice: 如下接口是否有必要**

```delete /r/:entity``` 直接删库？
```get /r/org/info/members/:id``` 通过如上接口无法实现？
```patch /r/:entity/:id``` 和前面put接口是否重复？
```post /a/update/:entity``` editSub是什么行为，和patch的edit有何区别?
```/r/comp``` comp是做什么的？
```/r/userRank/:entity/:key/:val/:prop``` userRank是做什么的？
接口权限如何界定？

---

### 操作型接口

```特殊行为接口```

#### 基本操作

|method|action|
|---|---|
|post|doAction|

#### 请求格式

```/a/事件/参数```

#### 返回格式

> **[TODO] 需要修改代码中的返回格式，添加code**

```{code: 0, msg: '', data: {...} }```


#### 实例

v1.0

- 验证码

```post /a/verfiyCode```

- 注册

```post /a/auth/register```

- 登录

```post /a/auth/login```

- 登出

```post /a/auth/logout```

- 修改密码

```post /a/auth/resetPsd```


> **Notice: 如下接口是否有必要**

```post /a/auth/check/now``` 做什么用？
```post /a/auth/checkPsd``` 何时需要单独验证密码？

---

### Demo

#### 注册

```
post http://localhost:3000/a/auth/login

Cache-Control: no-cache
Content-Type: application/json

{
  "username": "alex",
  “email”: “​liulei@163.com​”,
  "password": "psd",
  "skillset": [“c++”, “java”], 
  "social": [
      {"linkedin":"http://www.linkedin.com/manstein"},
      {"twitter":"http://twitter.com/manstein"} 
  ]
} 
```


#### 登录

```
post http://localhost:3000/a/auth/login

Cache-Control: no-cache
Content-Type: application/json

{
  "username": "alex",
  "password": "psd1"
}
```

#### 发送邮件验证码

```
post /a/verifyCode

{
  "email": "email@123.com",
  "username(可选)": "username"
}
```

> **Notice: 再次提交？注意：再次提交数据时，请加入下面两个属性**

```
{
  "_cCode": "上面返回的cCode",
  "_vCode": "查看邮件里的验证码"
}
```

如果验证不通过，返回err与msg

     
#### 重置密码

```
post /a/auth/resetPsd

{
  "email": "xxx@xxx.xxx"
  "password": "xxxxxxx"
}
```

> **Notice: 如果给用户发送邮件，请添加：afterSave: 'sendPsdEmail'?**


#### 用户查询

```
GET /r/org
GET /r/user?offset=0&max=2
```

#### 添加组织

```
post /r/org

Accept: */*
Cache-Control: no-cache
Content-Type: application/json

{
  "name": "manstein",
  "email": "​liulei@163.com​",
  "password": "123456",
  "wallet": [
    {
      "eth": "0x1efekuej8fhfhkf3iud8djdjj"
    }
  ],
  "website": "​www.manstein.com​",
  "mission": "manstein",
  "description": "manstein",
  "logo": "http://10.23.122.11/awk.jpg",
  "social": [
    {
      "linkedin": "http://www.linkedin.com/manstein"
    },
    {
      "twitter": "http://twitter.com/manstein"
    }
  ],
  "members": [
    {
      "wallet": {
        "address": "1qsw3e4rcfftgy6hgtgy6",
        "network": "ETH"
      },
      "email": "​liulei@163.com​",
      "description": "he is really good",
      "role": "CTO"
    }
  ]
}
```

#### 修改组织

```
put /r/org/5d2e9e38722d9b223ee09b0e

Accept: */*
Cache-Control: no-cache
Content-Type: application/json

{
  "logo" : "http://10.23.122.11/awk1.jpg"
}
```

#### 组织成员修改

> **Notice: 如何理解这个成员修改？**

```
post /a/update/org

{
  q: {
    _id: 'org Id',
    'members.email': '邮箱地址'
  },
  op: {
    'members.$.role': 'role',
    'members.$.description': 'description'
  }
}
```

#### 查询组织

```
get /r/org

get /r/org?offset=0&max=2
```

```
get /r/org?q[name]=sdfs&q[mission]=wer

多属性查询，直接使用jquery的$.get方法，将参数按字面量方式传入，会自动编码为上面格式

$.get(
    url,
    {q:{name:'sdf',mission:'wer'}}
)

{"entities":[{"_id":"5d2e9e38722d9b223ee09b0e","name":"manstein","email":"​liulei@163.com​","wallet":[{"eth":"0x1efekuej8fhfhkf3iud8djdjj"}],"website":"​www.manstein.com​","mission":"manstein","description":"manstein","logo":"http://10.23.122.11/awk1.jpg","social":[{"linkedin":"http://www.linkedin.com/manstein"},{"twitter":"http://twitter.com/manstein"}],"members":[{"wallet":{"address":"1qsw3e4rcfftgy6hgtgy6","network":"ETH"},"email":"​liulei@163.com​","description":"he is really good","role":"CTO"}],"dateCreated":1563336248867,"lastUpdated":1563336715881,"_e":"org"}],"count":1}
```

#### 查询单个

```
get /r/org/5d3830aeddfc12303e0b283b

get /r/org/name/sdfs

{"entity": {
     "_id": "5d3830aeddfc12303e0b283b",
     "name": "sdfs",
     "type": 3,
     "logo": "",
     "email": "rt@ee.com",
     "wallet": [
       {
         "name": "eth",
         "value": ""
       }
     ],
     "website": "tyr",
     "mission": "wer",
     "vision": "ry",
     "description": "r",
     "social": [],
     "members": [],
     "dateCreated": 1563963566107,
     "lastUpdated": 1563963566107,
     "_e": "org"
   },
   "msg": null
   }
```

#### 删除组织

```
delete /r/org/5d2e9e38722d9b223ee09b0e
```

### 查询组织用户详情

```
get /r/org/info/members/orgId
```