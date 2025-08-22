import { PlatformShare, SocialPlatforms } from "./sharePlatform"
import { createPoster } from "./poster"
/**
 * 模拟qrcode返回的DataURL
 */
const qrcode = {
    toDataURL(url: string) {
        return `data:image/png;base64,${url}`
    }
}
// 默认项目链接
const projectUrl = 'https://www.qiniu.com'
// 默认选择第一个平台
const selectPlatform = SocialPlatforms[0]
// 二维码地址 - 默认空字符串
let DataURL: string = ''


// 模拟poster返回的图片
const poster = await createPoster({
    //相应参数
})
// 模拟平台切换
async function handPlatformChange(platform: PlatformShare) {
    if (platform.shareType.supportProject && platform.shareFunction.shareProject) {
        DataURL = qrcode.toDataURL(await platform.shareFunction.shareProject(projectUrl))
    }
    else if (platform.shareType.supportPoster && platform.shareFunction.sharePoster) {
        DataURL = qrcode.toDataURL(await platform.shareFunction.sharePoster(poster, projectUrl))
    }
    else {
        DataURL = ''
    }
}
// 初始化时运行一次
handPlatformChange(selectPlatform)

