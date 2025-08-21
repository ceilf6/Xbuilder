/**
 * 社交平台配置
 */
type BasicInfo = {
    /** 平台标识符名称 */
    name: string
    /** 本地化显示标签 */
    label: { en: string; zh: string }
    /** 平台品牌颜色 */
    color: string
    /** 平台跳转链接 */
    platformUrl: string
}

/**
 * 支持分享方式接口
 */
type ShareType = {
    /** 分享项目页面 */
    supportProject: boolean
    /** 分享海报 */
    supportPoster: boolean
    /** 分享视频 */
    supportVideo: boolean
}
/**
 * 分享方法接口 - 定义三种分享方式
 */
interface ShareFunction {
    /** 分享项目页面方法 */
    shareProject: (projectUrl: string) => Promise<string>
    /** 分享海报方法 */
    sharePoster: (image: File, projectUrl: string) => Promise<string>
    /** 分享视频方法 */
    shareVideo: (video: File, projectUrl: string) => Promise<string>
}
/**
 * 平台接口
 */
export interface Platform {
    basicInfo: BasicInfo
    shareType: ShareType
    shareFunction: ShareFunction
}

/**
 * 平台接口 - 继承BasicInfo和ShareType
 * 不同平台可以根据各自属性实现ShareType中的一个或多个方法
 */
class QQPlatform implements Platform {
    basicInfo = {
        name: 'qq',
        label: { en: 'QQ', zh: 'QQ' },
        color: '#FF6B35',
        platformUrl: 'https://im.qq.com'
    }
    shareType = {
        supportProject: true,
        supportPoster: true,
        supportVideo: true
    }
    shareFunction = {
        shareProject: async (projectUrl: string) => {
            return `projectUrl:${projectUrl}`
        },
        sharePoster: async (image: File) => {
            return `platformUrl:${this.basicInfo.platformUrl},image:${image}`
        },
        shareVideo: async (video: File) => {
            return `platformUrl:${this.basicInfo.platformUrl},video:${video}`
        }
    }
}

//class WeChatPlatform implements Platform { ... }
//class DouyinPlatform implements Platform { ... }

/**
 * 社交平台组件属性
 */
export type Props = {
    /** 当前选中的平台 (v-model) */
    modelValue?: string
    /** 是否显示分组标签 */
    showLabel?: boolean
}

/**
 * 社交平台组件事件
 */
export type SharePlatformEmits = {
    /** 平台选择变化 (v-model) */
    'update:modelValue': [value: string]
    /** 平台选择变化事件 */
    'change': [platform: Platform]
}

// 默认社交平台配置
export const SocialPlatforms: Platform[] = [
    new QQPlatform(),
    // new WeChatPlatform(),
    // new DouyinPlatform(),
]

// 依赖 Platform Service 的外部代码示例
// function SomeComponent() {
//     // 理想情况下具体的业务逻辑/组件不需要关心具体有哪些平台，每个平台分别是什么，而只需要按照 `Platform` 这个接口（basicInfo & share 等）去消费它就好
//     const platforms = defaultSocialPlatforms
//     return platforms.map(p => (
//         // <li key={p.name} onClick={() => p.share(project)}>{p.label.zh}</li>
//     ))
// }
/**
 * 直接分享
 * @param platform 平台
 * @param projectUrl 项目链接
 * @returns 分享数据
 */
async function directShare(platform: Platform, projectUrl: string) {
    if (platform.shareType.supportProject) {
        const data = await platform.shareFunction.shareProject(projectUrl)
    }
}
