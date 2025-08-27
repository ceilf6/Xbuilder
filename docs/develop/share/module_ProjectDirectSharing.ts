/**
 * 直接分享组件
*/
// 导入必要的类型和函数
import { PlatformConfig, SocialPlatformConfigs} from "./module_platformShare"
import { getProjectPageRoute } from "@/router"
import { createPoster } from "./module_poster"
import { defineProps, defineEmits, ref} from "vue"
/**
 * 定义组件的props
 */
const props = defineProps<{
    projectData: {
        // 项目数据
        // 项目唯一标识
        owner: string
        name: string
        // 项目缩略图
        thumbnail: string
    }
}>()

// 以下是伪代码
/**
 * 模拟qrcode返回的DataURL
 */
// 默认选择第一个平台
const selectPlatform =  ref<PlatformConfig>(SocialPlatformConfigs[0])

const qrcode = {
    toDataURL(url: string) {
        return `data:image/png;base64,${url}`
    }
}
// 二维码地址 - 默认空字符串
const DataURL = ref<string>('')


// 模拟poster返回的图片
const posterData = await createPoster()

// 模拟平台切换
async function handPlatformChange(platform: PlatformConfig) {
    
    selectPlatform.value =  platform
    
    if (platform.shareType.supportURL && platform.shareFunction.shareURL) {
        DataURL.value = qrcode.toDataURL(await platform.shareFunction.shareURL(getProjectPageRoute(props.projectData.owner, props.projectData.name)))
    }
    else if (platform.shareType.supportImage && platform.shareFunction.shareImage) {
        DataURL.value = qrcode.toDataURL(await platform.shareFunction.shareImage(posterData))
    }
    else {
        DataURL.value = ''
    }
}

