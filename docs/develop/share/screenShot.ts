import { Project } from '@/models/project'
import { createPoster, downloadPoster, posterProps } from "./poster"
import { getPlatformByName } from './sharePlatform'

/* 直接复用 posterProps
interface screenShotProps {
    img: File,
    project: Project
}
*/

/* 本模块只负责UI弹窗拼接？
下面的逻辑都应该转到project中？！

window.pauseGame()

const screenShotBlob = window.getScreenshot()

const sreenShotFile = createPoster(...)

<div 调用二维码第三方库，嵌入分享平台模块，组成弹窗>

window.resumeGame()
*/