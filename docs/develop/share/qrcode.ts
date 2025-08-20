/**
 * QR码模块接口定义
 * 
 * 此文件定义了QR码模块的接口和类型。
 * 它指定了QR码模块应该提供什么功能，
 * 但不包含实现细节。
 */

// ============================================================================
// 核心数据类型
// ============================================================================

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
 * QR码生成选项
 */
export type QRCodeOptions = {
    /** QR码宽度（像素） */
    width?: number
    /** QR码高度（像素） */
    height?: number
    /** QR码边距（像素） */
    margin?: number
    /** 
     * 颜色配置
     * 优先使用color；如果未提供且提供了platform，则根据平台映射生成
     */
    color?: {
        /** 深色（前景色） */
        dark?: string
        /** 浅色（背景色） */
        light?: string
    }
    /** 社交平台配置，用于自动生成颜色 */
    platform?: SocialPlatform
    /** 错误纠正级别 */
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

// ============================================================================
// 核心接口
// ============================================================================

/**
 * QR码生成器接口
 * 提供QR码生成的核心功能
 */
export interface QRCodeGenerator {
    /**
     * 生成QR码DataURL
     * @param text - 要编码的文本或链接
     * @param options - QR码生成选项
     * @returns Promise<string> - 生成的QR码DataURL字符串
     */
    generateDataURL(text: string, options?: QRCodeOptions): Promise<string>
    
    /**
     * 生成Canvas元素
     * @param text - 要编码的文本或链接
     * @param options - QR码生成选项
     * @returns Promise<HTMLCanvasElement> - 包含QR码的Canvas元素
     */
    generateCanvas(text: string, options?: QRCodeOptions): Promise<HTMLCanvasElement>
}

/**
 * QR码工具接口
 * 提供QR码相关的辅助功能
 */
export interface QRCodeUtils {
    /**
     * 根据平台名称获取QR码颜色配置
     * @param platform - 平台名称
     * @returns 包含深色和浅色的颜色配置对象
     */
    getPlatformQrColor(platform?: string): { dark: string; light: string }
    
    /**
     * 验证QR码选项的有效性
     * @param options - 要验证的QR码选项
     * @returns 如果选项有效则返回true
     */
    validateOptions(options: QRCodeOptions): boolean
}

/**
 * 主QR码模块接口
 * 组合所有QR码功能
 */
export interface QRCode {
    // QRCodeGenerator 方法
    generateDataURL: QRCodeGenerator['generateDataURL']
    generateCanvas: QRCodeGenerator['generateCanvas']
    
    // QRCodeUtils 方法
    getPlatformQrColor: QRCodeUtils['getPlatformQrColor']
    validateOptions: QRCodeUtils['validateOptions']
    
    // 服务获取器
    getGenerator(): QRCodeGenerator
    getUtils(): QRCodeUtils
}

// ============================================================================
// 便捷函数接口
// ============================================================================

/**
 * 便捷函数：生成QR码DataURL
 * @param text - 要编码的文本或链接
 * @param options - QR码生成选项
 * @returns Promise<string> - 生成的QR码DataURL字符串
 */
export declare function generateQRCode(text: string, options?: QRCodeOptions): Promise<string>

/**
 * 便捷函数：根据平台名称获取QR码颜色
 * @param platform - 平台名称
 * @returns 包含深色和浅色的颜色配置对象
 */
export declare function getPlatformQrColor(platform?: string): { dark: string; light: string }
