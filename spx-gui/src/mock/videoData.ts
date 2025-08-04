import type { VideoData } from '@/apis/video'
import { Visibility } from '@/apis/video'

// Mock video data for demonstration
export function getMockRecords(owner: string = 'demo_user'): VideoData[] {
  return [
    {
      id: '1',
      createdAt: '2025-07-30T10:00:00Z',
      updatedAt: '2025-07-30T10:00:00Z',
      owner,
      name: 'intro-tutorial',
      title: '项目制作入门教程',
      description: '学习如何在Go+ Builder中创建你的第一个项目',
      videoUrl: 'https://example.com/records/intro-tutorial.mp4',
      thumbnail: 'https://picsum.photos/232/130?random=1',
      duration: 300, // 5 minutes
      visibility: Visibility.Public,
      viewCount: 1250,
      likeCount: 89
    },
    {
      id: '2',
      createdAt: '2025-07-29T14:30:00Z',
      updatedAt: '2025-07-29T14:30:00Z',
      owner,
      name: 'sprite-animation',
      title: 'Sprite 动画制作技巧',
      description: '深入了解如何为你的Sprite创建流畅的动画效果',
      videoUrl: 'https://example.com/records/sprite-animation.mp4',
      thumbnail: 'https://picsum.photos/232/130?random=2',
      duration: 720, // 12 minutes
      visibility: Visibility.Public,
      viewCount: 890,
      likeCount: 67
    },
    {
      id: '3',
      createdAt: '2025-07-28T09:15:00Z',
      updatedAt: '2025-07-28T09:15:00Z',
      owner,
      name: 'game-logic',
      title: '游戏逻辑设计指南',
      description: '学习如何设计有趣的游戏机制和交互逻辑',
      videoUrl: 'https://example.com/records/game-logic.mp4',
      thumbnail: 'https://picsum.photos/232/130?random=3',
      duration: 480, // 8 minutes
      visibility: Visibility.Public,
      viewCount: 2100,
      likeCount: 156
    },
    {
      id: '4',
      createdAt: '2025-07-27T16:45:00Z',
      updatedAt: '2025-07-27T16:45:00Z',
      owner,
      name: 'sharing-tips',
      title: '项目分享与发布技巧',
      description: '了解如何有效地分享和推广你的创作项目',
      videoUrl: 'https://example.com/records/sharing-tips.mp4',
      thumbnail: 'https://picsum.photos/232/130?random=4',
      duration: 360, // 6 minutes
      visibility: Visibility.Public,
      viewCount: 756,
      likeCount: 43
    }
  ]
}
