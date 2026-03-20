import { describe, it, expect } from 'vitest'
import { detectEmbed } from '../post-embed'

describe('PostEmbed detectEmbed', () => {
  // YouTube
  it('detects YouTube watch URL', () => {
    expect(detectEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' })
  })

  it('detects youtu.be short URL', () => {
    expect(detectEmbed('https://youtu.be/dQw4w9WgXcQ')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' })
  })

  it('detects YouTube embed URL', () => {
    expect(detectEmbed('https://youtube.com/embed/dQw4w9WgXcQ')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' })
  })

  // Vimeo
  it('detects Vimeo URL', () => {
    expect(detectEmbed('https://vimeo.com/123456789')).toEqual({ type: 'vimeo', id: '123456789' })
  })

  // Dailymotion
  it('detects Dailymotion URL', () => {
    expect(detectEmbed('https://www.dailymotion.com/video/x8abc12')).toEqual({ type: 'dailymotion', id: 'x8abc12' })
  })

  // Twitch
  it('detects Twitch channel URL', () => {
    expect(detectEmbed('https://www.twitch.tv/shroud')).toEqual({ type: 'twitch', id: 'channel=shroud' })
  })

  it('detects Twitch video URL', () => {
    expect(detectEmbed('https://www.twitch.tv/videos/123456')).toEqual({ type: 'twitch', id: 'video=123456' })
  })

  // Twitter / X
  it('detects Twitter status URL', () => {
    expect(detectEmbed('https://twitter.com/elonmusk/status/123456789').type).toBe('twitter')
  })

  it('detects x.com status URL', () => {
    expect(detectEmbed('https://x.com/user/status/123456789').type).toBe('twitter')
  })

  // Instagram
  it('detects Instagram post URL', () => {
    expect(detectEmbed('https://www.instagram.com/p/CxYz123/').type).toBe('instagram')
  })

  it('detects Instagram reel URL', () => {
    expect(detectEmbed('https://www.instagram.com/reel/CxYz123/').type).toBe('instagram')
  })

  // Facebook
  it('detects Facebook post URL', () => {
    expect(detectEmbed('https://www.facebook.com/user/posts/123456').type).toBe('facebook')
  })

  it('detects Facebook video URL', () => {
    expect(detectEmbed('https://www.facebook.com/user/videos/123456').type).toBe('facebook')
  })

  it('detects Facebook watch URL', () => {
    expect(detectEmbed('https://www.facebook.com/watch/?v=123456').type).toBe('facebook')
  })

  it('detects Facebook reel URL', () => {
    expect(detectEmbed('https://www.facebook.com/reel/123456').type).toBe('facebook')
  })

  it('detects fb.watch short URL', () => {
    expect(detectEmbed('https://fb.watch/abc123/').type).toBe('facebook')
  })

  it('detects Facebook photo URL', () => {
    expect(detectEmbed('https://www.facebook.com/photo/photos/123').type).toBe('facebook')
  })

  // TikTok
  it('detects TikTok video URL', () => {
    const result = detectEmbed('https://www.tiktok.com/@user/video/7234567890123456789')
    expect(result).toEqual({ type: 'tiktok', id: '7234567890123456789' })
  })

  // Loom
  it('detects Loom share URL', () => {
    const result = detectEmbed('https://www.loom.com/share/abc123def456')
    expect(result).toEqual({ type: 'loom', id: 'abc123def456' })
  })

  // Wistia
  it('detects Wistia media URL', () => {
    const result = detectEmbed('https://fast.wistia.com/medias/abc123')
    expect(result).toEqual({ type: 'wistia', id: 'abc123' })
  })

  it('detects wi.st short URL', () => {
    const result = detectEmbed('https://wi.st/medias/abc123')
    expect(result).toEqual({ type: 'wistia', id: 'abc123' })
  })

  // Rumble
  it('detects Rumble embed URL', () => {
    const result = detectEmbed('https://rumble.com/embed/v1abc23/')
    expect(result).toEqual({ type: 'rumble', id: 'v1abc23' })
  })

  it('detects Rumble slug URL', () => {
    const result = detectEmbed('https://rumble.com/v1abc23-some-video-title.html')
    expect(result).toEqual({ type: 'rumble', id: 'v1abc23-some-video-title' })
  })

  // Images
  it('detects .jpg image', () => {
    expect(detectEmbed('https://example.com/photo.jpg').type).toBe('image')
  })

  it('detects .png image', () => {
    expect(detectEmbed('https://example.com/photo.png').type).toBe('image')
  })

  it('detects .webp image', () => {
    expect(detectEmbed('https://example.com/photo.webp').type).toBe('image')
  })

  it('detects .gif image', () => {
    expect(detectEmbed('https://example.com/photo.gif').type).toBe('image')
  })

  it('detects .svg image', () => {
    expect(detectEmbed('https://example.com/icon.svg').type).toBe('image')
  })

  it('detects .avif image', () => {
    expect(detectEmbed('https://example.com/photo.avif').type).toBe('image')
  })

  it('detects image with query params', () => {
    expect(detectEmbed('https://example.com/photo.jpg?w=800').type).toBe('image')
  })

  // Smart image detection (known hosting domains without extensions)
  it('detects Imgur direct image URL', () => {
    expect(detectEmbed('https://i.imgur.com/abc1234').type).toBe('image')
  })

  it('detects Imgur album-style URL', () => {
    expect(detectEmbed('https://imgur.com/abc1234').type).toBe('image')
  })

  it('detects Unsplash photo URL', () => {
    expect(detectEmbed('https://images.unsplash.com/photo-1234567890').type).toBe('image')
  })

  it('detects Cloudinary image URL', () => {
    expect(detectEmbed('https://res.cloudinary.com/demo/image/upload/sample').type).toBe('image')
  })

  it('detects Twitter media image URL', () => {
    expect(detectEmbed('https://pbs.twimg.com/media/abc123').type).toBe('image')
  })

  it('detects Giphy media URL', () => {
    expect(detectEmbed('https://media.giphy.com/media/abc123/giphy.gif').type).toBe('image')
  })

  // Fallback
  it('returns link for unknown URL', () => {
    expect(detectEmbed('https://docs.orchestra-mcp.dev/getting-started').type).toBe('link')
  })

  it('returns link for bare domain', () => {
    expect(detectEmbed('https://github.com/orchestra-mcp').type).toBe('link')
  })
})
