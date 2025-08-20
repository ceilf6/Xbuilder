/**
 * 社交平台配置
 */
export type SocialPlatform = {
    /** 平台标识符名称 */
    name: string
    /** 本地化显示标签 */
    label: { en: string; zh: string }
    /** 平台品牌颜色 */
    color: string
}

/**
 * 社交平台组件属性
 */
export type SharePlatformProps = {
    /** 当前选中的平台 (v-model) */
    modelValue?: string
    /** 是否显示分组标签 */
    showLabel?: boolean
    /** 自定义平台配置 */
    platforms?: SocialPlatform[]
}

/**
 * 社交平台组件事件
 */
export type SharePlatformEmits = {
    /** 平台选择变化 (v-model) */
    'update:modelValue': [value: string]
    /** 平台选择变化事件 */
    'change': [platform: SocialPlatform]
}

/**
 * 社交平台管理接口
 * 提供平台选择和配置功能
 */
export interface SharePlatformService {
    /**
     * 获取可用社交平台
     * @param customPlatforms - 可选的自定义平台配置
     * @returns 社交平台配置数组
     */
    getSocialPlatforms(customPlatforms?: SocialPlatform[]): SocialPlatform[]
    
    /**
     * 按名称获取平台
     * @param name - 平台标识符
     * @param customPlatforms - 可选的自定义平台配置
     * @returns 平台配置或未找到时返回undefined
     */
    getPlatformByName(name: string, customPlatforms?: SocialPlatform[]): SocialPlatform | undefined
    
    /**
     * 验证平台名称
     * @param name - 要验证的平台标识符
     * @param customPlatforms - 可选的自定义平台配置
     * @returns 如果平台名称有效则返回true
     */
    isValidPlatformName(name: string, customPlatforms?: SocialPlatform[]): boolean
}

/**
 * 社交平台工具接口
 * 提供平台操作的辅助函数
 */
export interface SharePlatformUtils {
    /**
     * 按名称获取平台图标路径
     * @param name - 平台标识符
     * @returns 平台图标路径
     */
    getPlatformIcon(name: string): string
    
    /**
     * 按名称获取平台颜色
     * @param name - 平台标识符
     * @param customPlatforms - 可选的自定义平台配置
     * @returns 平台品牌颜色
     */
    getPlatformColor(name: string, customPlatforms?: SocialPlatform[]): string
    
    /**
     * 获取本地化平台标签
     * @param name - 平台标识符
     * @param locale - 语言区域 ('en' | 'zh')
     * @param customPlatforms - 可选的自定义平台配置
     * @returns 本地化平台标签
     */
    getPlatformLabel(name: string, locale: 'en' | 'zh', customPlatforms?: SocialPlatform[]): string
}

/**
 * 社交平台主模块接口
 * 组合所有社交平台功能
 */
export interface SharePlatform {
    // SharePlatformService 方法
    getSocialPlatforms: SharePlatformService['getSocialPlatforms']
    getPlatformByName: SharePlatformService['getPlatformByName']
    isValidPlatformName: SharePlatformService['isValidPlatformName']
    
    // SharePlatformUtils 方法
    getPlatformIcon: SharePlatformUtils['getPlatformIcon']
    getPlatformColor: SharePlatformUtils['getPlatformColor']
    getPlatformLabel: SharePlatformUtils['getPlatformLabel']
    
    // 服务获取器
    getSharePlatformService(): SharePlatformService
    getUtils(): SharePlatformUtils
}
