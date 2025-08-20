import { Project } from '@/models/project'
import html2canvas from 'html2canvas'

interface posterProps {
    img?: File
    project?: Project
}

async function posterResult(props: posterProps): Promise<File | null> {
    const posterElement = document.createElement('div')
    // 在这里通过调用处理这个DOM节点 posterElement.className = 'poster-container'、填入props信息、二维码等等
    const canvas = await html2canvas(posterElement,{
        width: 600, // 减少可操控换来精细化
        height: 800
    })
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b),'image/png') // 返回转换后的二进制
    )
    const posterFile = new File([blob], `${props.project.name}-poster.png`, { type: 'image/png'})
    return posterFile
}

export { posterResult }

export type { posterProps }

