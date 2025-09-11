# 微信分享后端服务

这个目录包含了微信分享功能的Go后端实现，用于替代前端的复杂逻辑。

## 文件说明

### wechat_token.go
- 处理微信access_token和jsapi_ticket的获取
- 包含token和ticket的缓存机制
- 提供基础的微信API调用功能

### wechat_signature.go
- 主要的微信签名生成服务
- 整合了token获取、ticket获取和签名生成
- 提供HTTP API接口供前端调用

## 使用方法

### 启动服务
```bash
# 启动微信签名服务
go run wechat_signature.go
```

服务将在 `:8080` 端口启动。

### API接口

#### POST /api/wechat-signature
获取微信JS-SDK签名参数

**请求参数:**
```json
{
  "appId": "wx5f7ad87518d77bf3",
  "url": "https://example.com" // 可选，不提供时使用Referer
}
```

**响应参数:**
```json
{
  "timestamp": 1234567890,
  "nonceStr": "randomstring",
  "signature": "sha1signature",
  "errcode": 0,
  "errmsg": "ok"
}
```

#### GET /api/wechat-signature
也可以通过GET请求获取签名参数

**查询参数:**
- `appId`: 微信应用ID
- `url`: 当前页面URL（可选）

## 前端集成

前端只需要发送POST请求到 `/api/wechat-signature`，传入 `appId`，即可获得后端返回的 `timestamp`、`nonceStr` 和 `signature` 三个参数，用于配置微信JS-SDK。

## 配置说明

- `WECHAT_APP_ID`: 微信应用ID
- `WECHAT_APP_SECRET`: 微信应用密钥

这些配置在代码中硬编码，生产环境建议使用环境变量或配置文件。

## 特性

- 自动缓存access_token和jsapi_ticket
- 自动处理token和ticket过期
- 支持CORS跨域请求
- 完整的错误处理
- 支持GET和POST两种请求方式
