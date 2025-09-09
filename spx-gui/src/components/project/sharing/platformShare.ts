import img from '@/assets/logo.svg'


/**
 * 社交平台配置
 */
export type BasicInfo = {
    /** 平台标识符名称 */
    name: string
    /** 本地化显示标签 */
    label: { en: string; zh: string }
    /** 平台品牌颜色 */
    color: string
}

/**
 * 支持分享方式接口
 */
export type ShareType = {
    /** 分享项目页面 */
    supportURL: boolean
    /** 分享海报 */
    supportImage: boolean
    /** 分享视频 */
    supportVideo: boolean
}

/**
 * 分享方法接口 - 定义三种分享方式，所有方法都是可选的
 */
export interface ShareFunction {
    /** 分享项目页面方法 */
    shareURL?: (url: string) => Promise<string>
    /** 分享海报方法 */
    shareImage?: (image: File) => Promise<string>
    /** 分享视频方法 */
    shareVideo?: (video: File) => Promise<string>
}

/**
 * 平台配置接口 - 包含平台的基本信息和分享功能
 */
export interface PlatformConfig {
    shareType: ShareType
    basicInfo: BasicInfo
    shareFunction: ShareFunction
    initShareInfo: Function
}
/**
 * 平台跳转链接的示例，方便后续接口使用
 */
const platformUrl = 'https://example.com'

declare global {
    interface Window {
        mqq: any
        wx: any
        sha1: any
    }
}

/**
 * QQ平台实现
 */
class QQPlatform implements PlatformConfig {
    basicInfo = {
        name: 'qq',
        label: { en: 'QQ', zh: 'QQ' },
        color: '#68a5e1'
    }
    
    shareType = {
        supportURL: true,
        supportImage: true,
        supportVideo: true
    }
    
    shareFunction = {
        shareURL: async (url: string) => {
            return `url:${url}`
        },
        shareImage: async (image: File) => {
            return `platformUrl:${platformUrl},image:${image}`
        },
        shareVideo: async (video: File) => {
            return `platformUrl:${platformUrl},video:${video}`
        }
    }

    initShareInfo = async (url: string, title?: string, desc?: string) => {
        console.log('shareURL: QQ platform:' + url);
        // 查看logo图片在服务器上的URL
        console.log('Logo图片URL (import):', img)
        console.log('测试图片URL:', 'https://xbuilder-sharing-test.gopluscdn.com/test.png')
        // 检查是否在 QQ 环境中
        if (typeof window !== 'undefined' && window.mqq && window.mqq.invoke) {
            window.mqq.invoke("data","setShareInfo", {
                share_url: url,
                title: title || 'XBuilder',
                desc: desc || 'XBuilder分享你的创意作品',
                image_url: 'https://xbuilder-sharing-test.gopluscdn.com/logo.png'
            });
        } else {
            console.warn('QQ API not available in current environment');
        }
    }
}

/**
 * 微信平台实现 - 只支持项目分享和海报分享
 */
class WeChatPlatform implements PlatformConfig {
    basicInfo = {
        name: 'wechat',
        label: { en: 'WeChat', zh: '微信' },
        color: '#28c445'
    }
    
    shareType = {
        supportURL: true,
        supportImage: true,
        supportVideo: false
    }
    
    shareFunction = {
        shareURL: async (url: string) => {
            return `url:${url}`
        },

        shareImage: async (image: File) => {
            return `platformUrl:${platformUrl},image:${image}`
        }
        // 不实现 shareVideo，因为不支持
    }

    initShareInfo = async (url: string, title?: string, desc?: string) => {
        console.log('shareURL: WeChat platform:' + url);
        let currentAccessToken = '';
        let currentTicket = '';
        if (typeof window !== 'undefined' && window.wx && window.wx.config) {
            
            // 获取微信Access Token的函数
            const getWechatToken = async () => {
                const appId = 'wx5f7ad87518d77bf3';
                const appSecret = '0f62d3a8e4aec9eee4d02365d6ae0dda';
                
                console.log('getWechatToken：请求中');
                
                try {
                // 使用后端代理API
                const proxyUrl = `/api/wechat-token?appid=${appId}&secret=${appSecret}`;
                const response = await fetch(proxyUrl);
                const data = await response.json();
                
                if (data.access_token) {
                    console.log('getWechatToken：请求成功' + data.access_token);
                    // 存储access_token供后续使用
                    currentAccessToken = data.access_token;
                } else {
                    console.log('getWechatToken：请求失败' + data.errmsg);
                }
                } catch (error: any) {
                    console.log('getWechatToken：请求失败' + error.message);
                }
            }

                            // 获取微信JSAPI Ticket的函数
            const getJsapiTicket = async () => {
                // if (!currentAccessToken) {
                //     alert('请先获取Access Token！');
                //     return;
                // }
                
                const accessToken = currentAccessToken;
                
                console.log('getJsapiTicket：请求中');

                try {
                // 使用后端代理API
                const proxyUrl = `/api/wechat-ticket?access_token=${accessToken}&type=jsapi`;
                const response = await fetch(proxyUrl);
                const data = await response.json();
                
                if (data.ticket) {
                    console.log('getJsapiTicket：请求成功' + data.ticket);
                    // 存储ticket供后续使用
                    currentTicket = data.ticket;
                } else {
                    console.log('getJsapiTicket：请求失败' + data.errmsg);
                }
                } catch (error: any) {
                    console.log('getJsapiTicket：请求失败' + error.message);
                }
            }

                    // 生成微信JS接口签名的函数
            const generateSignature = async () => {
                // if (!currentTicket) {
                //     alert('请先获取JSAPI Ticket！');
                //     return;
                // }
                
                const ticket = currentTicket;
                const nonceStr = Math.random().toString(36).substr(2, 16); // 生成16位随机字符串
                const timestamp = Math.floor(Date.now() / 1000);
                const url = window.location.href.split('#')[0]; // 当前页面URL，去掉哈希部分

                const string1 = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
                const signature = window.sha1(string1);

                console.log('generateSignature：签名生成成功！' + signature)
                // 自动更新wx.config中的签名参数
                updateWxConfig(timestamp, nonceStr, signature);
            }

            // 更新微信配置的函数
            const updateWxConfig = (timestamp: number, nonceStr: string, signature: string) => {
                // 更新wx.config中的签名参数
                window.wx.config({
                debug: true,
                appId: 'wx5f7ad87518d77bf3',
                timestamp: timestamp,
                nonceStr: nonceStr,
                signature: signature,
                jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
                });
                
                // 配置成功后，设置分享数据
                window.wx.ready(function() {
                    console.log('微信JS-SDK配置成功！');
                
                // 更新配置状态显示
                //updateWxConfigStatus('已配置', timestamp, nonceStr, signature);
                
                    // 设置分享给朋友的数据
                    window.wx.updateAppMessageShareData({
                        title: 'XBuilder',
                        desc: 'XBuilder分享你的创意作品',
                        // link: window.location.href.split('#')[0],
                        link: url,
                        imgUrl: img,
                        success: function() {
                        console.log('分享给朋友设置成功');
                        }
                    });
                
                    // 设置分享到朋友圈的数据
                    window.wx.updateTimelineShareData({
                        title: 'XBuilder',
                        desc: 'XBuilder分享你的创意作品',
                        link: url,
                        imgUrl: img,
                        success: function() {
                        console.log('分享到朋友圈设置成功');
                        }
                    });
                });

                // 配置失败的处理
                window.wx.error(function(res: any) {
                    console.error('微信JS-SDK配置失败:', res);
                    alert('微信JS-SDK配置失败: ' + JSON.stringify(res));
                });
            }

            await getWechatToken();
            await getJsapiTicket();
            await generateSignature();
        }
        else{
            console.warn('WeChat API not available in current environment');
        }
    }
}
class DouyinPlatform implements PlatformConfig {
    basicInfo = {
        name: 'douyin',
        label: { en: 'Douyin', zh: '抖音' },
        color: '#170b1a'
    }
    
    shareType = {
        supportURL: false,
        supportImage: true,
        supportVideo: true
    }
    
    shareFunction = {
        shareImage: async (image: File) => {
            return `platformUrl:${platformUrl},image:${image}`
        },
        shareVideo: async (video: File) => {
            return `platformUrl:${platformUrl},video:${video}`
        }
    }

    initShareInfo = () => {
        
    }
}

class XiaohongshuPlatform implements PlatformConfig {
    basicInfo = {
        name: 'xiaohongshu',
        label: { en: 'Xiaohongshu', zh: '小红书' },
        color: '#ff0035'
    }
    
    shareType = {
        supportURL: false,
        supportImage: true,
        supportVideo: false
    }
    
    shareFunction = {
        shareImage: async (image: File) => {
            return `platformUrl:${platformUrl},image:${image}`
        }
    }

    initShareInfo = () => {
        
    }
}  

class BilibiliPlatform implements PlatformConfig {
    basicInfo = {
        name: 'bilibili',
        label: { en: 'Bilibili', zh: 'Bilibili' },
        color: '#d4237a'
    }
    
    shareType = {
        supportURL: false,
        supportImage: false,
        supportVideo: true
    }
    
    shareFunction = {
        shareVideo: async (video: File) => {
            return `platformUrl:${platformUrl},video:${video}`
        }
    }

    initShareInfo = () => {
        
    }
}

// 导出平台配置数组 - 包含完整的平台信息
export const SocialPlatformConfigs: PlatformConfig[] = [
    new QQPlatform(),
    new WeChatPlatform(),
    new DouyinPlatform(),
    new XiaohongshuPlatform(), 
    new BilibiliPlatform(),
]

export const initializeShareConfig = (url: string, title?: string, desc?: string) => {
    new QQPlatform().initShareInfo(url, title, desc)
    new WeChatPlatform().initShareInfo(url, title, desc)
  }
