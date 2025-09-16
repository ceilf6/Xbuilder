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

    initShareInfo = async (title?: string, desc?: string) => {
        console.log('shareURL: QQ platform:' + (typeof location !== 'undefined' ? location.href : ''));
        // 查看logo图片在服务器上的URL
        console.log('Logo图片URL (import):', location.origin + '/logo.png')
        console.log('测试图片URL:', 'https://xbuilder-sharing-test.gopluscdn.com/test.png')
        // 检查是否在 QQ 环境中
        if (typeof window !== 'undefined' && window.mqq && window.mqq.invoke) {
            window.mqq.invoke("data","setShareInfo", {
                share_url: typeof location !== 'undefined' ? location.href : '',
                title: title || 'XBuilder',
                desc: desc || 'XBuilder分享你的创意作品',
                image_url: location.origin + '/logo.png',
            });
            console.log(location.origin + '/logo.png')
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

    initShareInfo = async (title?: string, desc?: string) => {
        console.log('shareURL: WeChat platform:' + (typeof location !== 'undefined' ? location.href : ''));
        
        if (typeof window !== 'undefined' && window.wx && window.wx.config) {
            try {
                // 发送appId到后端获取签名参数
                const appId = 'wx5f7ad87518d77bf3';
                const currentUrl = typeof location !== 'undefined' ? location.href.split('#')[0] : '';
                
                console.log('请求微信签名参数...');
                
                const response = await fetch('/api/wechat-signature', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        appId: appId,
                        url: currentUrl
                    })
                });
                
                const data = await response.json();
                
                if (data.errcode && data.errcode !== 0) {
                    console.error('获取微信签名失败:', data.errmsg);
                    return;
                }
                
                console.log('微信签名参数获取成功:', data);
                
                // 使用后端返回的签名参数配置微信JS-SDK
                this.updateWxConfig(data.timestamp, data.nonceStr, data.signature, title, desc);
                
            } catch (error: any) {
                console.error('请求微信签名失败:', error.message);
            }
        } else {
            console.warn('WeChat API not available in current environment');
        }
    }

    // 更新微信配置的函数
    private updateWxConfig = (timestamp: number, nonceStr: string, signature: string, title?: string, desc?: string) => {
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
        window.wx.ready(() => {
            console.log('微信JS-SDK配置成功！');
            
            // 设置分享给朋友的数据
            window.wx.updateAppMessageShareData({
                title: title || 'XBuilder',
                desc: desc || 'XBuilder分享你的创意作品',
                link: typeof location !== 'undefined' ? location.href : '',
                imgUrl: img,
                success: function() {
                    console.log('分享给朋友设置成功');
                }
            });
        
            // 设置分享到朋友圈的数据
            window.wx.updateTimelineShareData({
                title: title || 'XBuilder',
                desc: desc || 'XBuilder分享你的创意作品',
                link: typeof location !== 'undefined' ? location.href : '',
                imgUrl: img,
                success: function() {
                    console.log('分享到朋友圈设置成功');
                }
            });
        });

        // 配置失败的处理
        window.wx.error((res: any) => {
            console.error('微信JS-SDK配置失败:', res);
            alert('微信JS-SDK配置失败: ' + JSON.stringify(res));
        });
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

export type Disposer = () => void

export const initializeShareConfig = (url?: string, title?: string, desc?: string): Disposer => {

    const qq = new QQPlatform()
    const wechat = new WeChatPlatform()

    qq.initShareInfo(title, desc)
    wechat.initShareInfo(title, desc)

    return () => {
        // Reset to a generic default for the current page to avoid stale project URL
        qq.initShareInfo()
        wechat.initShareInfo()
    }
}
