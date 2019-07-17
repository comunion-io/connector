## API 规范
Rest API:

###资源: /r/资源名/参数

####动作：
post: save
put: edit
delete: del
patch: edit
get: list

####返回格式

单个资源
{entity:{},msg:''}

列表资源
{entities:{}, count: '', msg:''}

分页请求

get请求添加参数：offset(偏移量), max(一页显示个数)



###事件: /a/事件/参数

####动作
主要是以post为主

####实例

用户注册

POST /a/auth/register

返回
{user:{},msg:''}


###错误请求

返回JSON中包含：
{err:1,msg:''}



## API 实例
### 注册
POST http://localhost:3000/a/auth/register
Cache-Control: no-cache
Content-Type: application/json
`
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
`


### 登录

POST http://localhost:3000/a/auth/login
Cache-Control: no-cache
Content-Type: application/json
`
{
  "username": "alex",
  "password": "psd1"
}
`

### 用户查询
GET http://localhost:3000/r/org
GET http://localhost:3000/r/user?offset=0&max=2

### 添加组织

POST http://localhost:3000/r/org
Accept: */*
Cache-Control: no-cache
Content-Type: application/json

`
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
`

### 修改组织

PUT http://localhost:3000/r/org/5d2e9e38722d9b223ee09b0e
Accept: */*
Cache-Control: no-cache
Content-Type: application/json
`
{
  "logo" : "http://10.23.122.11/awk1.jpg"
}
`

### 查询组织

GET http://localhost:3000/r/org
GET http://localhost:3000/r/org?offset=0&max=2

`
{"entities":[{"_id":"5d2e9e38722d9b223ee09b0e","name":"manstein","email":"​liulei@163.com​","wallet":[{"eth":"0x1efekuej8fhfhkf3iud8djdjj"}],"website":"​www.manstein.com​","mission":"manstein","description":"manstein","logo":"http://10.23.122.11/awk1.jpg","social":[{"linkedin":"http://www.linkedin.com/manstein"},{"twitter":"http://twitter.com/manstein"}],"members":[{"wallet":{"address":"1qsw3e4rcfftgy6hgtgy6","network":"ETH"},"email":"​liulei@163.com​","description":"he is really good","role":"CTO"}],"dateCreated":1563336248867,"lastUpdated":1563336715881,"_e":"org"}],"count":1}
`

### 删除组织

DELETE http://localhost:3000/r/org/5d2e9e38722d9b223ee09b0e


