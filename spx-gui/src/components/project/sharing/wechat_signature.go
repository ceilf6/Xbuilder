package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"time"
)

// WechatSignatureRequest 微信签名请求结构
type WechatSignatureRequest struct {
	AppID string `json:"appId"`
	URL   string `json:"url,omitempty"`
}

// WechatSignatureResponse 微信签名响应结构
type WechatSignatureResponse struct {
	Timestamp int    `json:"timestamp"`
	NonceStr  string `json:"nonceStr"`
	Signature string `json:"signature"`
	ErrCode   int    `json:"errcode"`
	ErrMsg    string `json:"errmsg"`
}

// WechatTokenResponse 微信token响应结构
type WechatTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	ErrCode     int    `json:"errcode"`
	ErrMsg      string `json:"errmsg"`
}

// WechatTicketResponse 微信ticket响应结构
type WechatTicketResponse struct {
	Ticket    string `json:"ticket"`
	ExpiresIn int    `json:"expires_in"`
	ErrCode   int    `json:"errcode"`
	ErrMsg    string `json:"errmsg"`
}

// 全局变量存储token和ticket
var (
	accessToken    string
	ticket         string
	tokenExpireAt  time.Time
	ticketExpireAt time.Time
)

// 微信配置
const (
	WECHAT_APP_ID     = "wx5f7ad87518d77bf3"
	WECHAT_APP_SECRET = "0f62d3a8e4aec9eee4d02365d6ae0dda"
)

// getWechatToken 获取微信access_token
func getWechatToken(appID, appSecret string) (*WechatTokenResponse, error) {
	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s", appID, appSecret)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var tokenResp WechatTokenResponse
	err = json.Unmarshal(body, &tokenResp)
	if err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

// getWechatTicket 获取微信jsapi_ticket
func getWechatTicket(accessToken string) (*WechatTicketResponse, error) {
	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi", accessToken)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var ticketResp WechatTicketResponse
	err = json.Unmarshal(body, &ticketResp)
	if err != nil {
		return nil, err
	}

	return &ticketResp, nil
}

// generateNonceStr 生成随机字符串
func generateNonceStr() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 16)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// generateSignature 生成微信JS接口签名
func generateSignature(ticket, nonceStr string, timestamp int, url string) string {
	// 按照微信文档要求的格式拼接字符串
	string1 := fmt.Sprintf("jsapi_ticket=%s&noncestr=%s&timestamp=%d&url=%s", ticket, nonceStr, timestamp, url)

	// 使用SHA1加密
	h := sha1.New()
	h.Write([]byte(string1))
	return hex.EncodeToString(h.Sum(nil))
}

// getWechatSignature 获取微信签名（主要接口）
func getWechatSignature(appID, url string) (*WechatSignatureResponse, error) {
	// 检查appID是否匹配
	if appID != WECHAT_APP_ID {
		return &WechatSignatureResponse{
			ErrCode: 40001,
			ErrMsg:  "Invalid appId",
		}, nil
	}

	// 检查token是否过期
	now := time.Now()
	if accessToken == "" || now.After(tokenExpireAt) {
		tokenResp, err := getWechatToken(WECHAT_APP_ID, WECHAT_APP_SECRET)
		if err != nil {
			return nil, err
		}
		if tokenResp.ErrCode != 0 {
			return &WechatSignatureResponse{
				ErrCode: tokenResp.ErrCode,
				ErrMsg:  tokenResp.ErrMsg,
			}, nil
		}
		accessToken = tokenResp.AccessToken
		tokenExpireAt = now.Add(time.Duration(tokenResp.ExpiresIn-60) * time.Second) // 提前60秒过期
	}

	// 检查ticket是否过期
	if ticket == "" || now.After(ticketExpireAt) {
		ticketResp, err := getWechatTicket(accessToken)
		if err != nil {
			return nil, err
		}
		if ticketResp.ErrCode != 0 {
			return &WechatSignatureResponse{
				ErrCode: ticketResp.ErrCode,
				ErrMsg:  ticketResp.ErrMsg,
			}, nil
		}
		ticket = ticketResp.Ticket
		ticketExpireAt = now.Add(time.Duration(ticketResp.ExpiresIn-60) * time.Second) // 提前60秒过期
	}

	// 生成签名参数
	timestamp := int(now.Unix())
	nonceStr := generateNonceStr()
	signature := generateSignature(ticket, nonceStr, timestamp, url)

	return &WechatSignatureResponse{
		Timestamp: timestamp,
		NonceStr:  nonceStr,
		Signature: signature,
	}, nil
}

// 处理CORS的中间件
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// 微信签名API处理器
func wechatSignatureHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// GET请求处理
		appID := r.URL.Query().Get("appId")
		url := r.URL.Query().Get("url")

		if appID == "" {
			http.Error(w, "Missing appId parameter", http.StatusBadRequest)
			return
		}

		if url == "" {
			url = r.Header.Get("Referer") // 如果没有提供url，使用Referer
		}

		signatureResp, err := getWechatSignature(appID, url)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(signatureResp)
	} else if r.Method == "POST" {
		// POST请求处理
		var req WechatSignatureRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if req.AppID == "" {
			http.Error(w, "Missing appId in request body", http.StatusBadRequest)
			return
		}

		if req.URL == "" {
			req.URL = r.Header.Get("Referer")
		}

		signatureResp, err := getWechatSignature(req.AppID, req.URL)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(signatureResp)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// 主函数
func main() {
	// 初始化随机数种子
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/api/wechat-signature", corsMiddleware(wechatSignatureHandler))

	fmt.Println("微信签名服务启动在 :8080")
	fmt.Println("API端点: /api/wechat-signature")
	fmt.Println("支持GET和POST请求")
	fmt.Println("GET参数: appId, url(可选)")
	fmt.Println("POST参数: {\"appId\": \"wx5f7ad87518d77bf3\", \"url\": \"https://example.com\"}")

	http.ListenAndServe(":8080", nil)
}
