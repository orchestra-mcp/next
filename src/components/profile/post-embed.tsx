'use client'

import { useMemo, useEffect, useRef, useState, useCallback } from 'react'

interface PostEmbedProps {
  url: string
}

type EmbedType = 'youtube' | 'vimeo' | 'dailymotion' | 'twitch' | 'tiktok' | 'loom' | 'wistia' | 'rumble' | 'twitter' | 'instagram' | 'facebook' | 'image' | 'link'

interface EmbedMatch {
  type: EmbedType
  id?: string
}

function detectEmbed(url: string): EmbedMatch {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] }

  // Dailymotion
  const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/)
  if (dmMatch) return { type: 'dailymotion', id: dmMatch[1] }

  // Twitch (channel or video)
  const twitchVideo = url.match(/twitch\.tv\/videos\/(\d+)/)
  const twitchChannel = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)\/?$/)
  if (twitchVideo) return { type: 'twitch', id: `video=${twitchVideo[1]}` }
  if (twitchChannel) return { type: 'twitch', id: `channel=${twitchChannel[1]}` }

  // TikTok
  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/)
  if (tiktokMatch) return { type: 'tiktok', id: tiktokMatch[1] }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (loomMatch) return { type: 'loom', id: loomMatch[1] }

  // Wistia
  const wistiaMatch = url.match(/(?:wistia\.com\/medias|wi\.st\/medias)\/([a-zA-Z0-9]+)/)
  if (wistiaMatch) return { type: 'wistia', id: wistiaMatch[1] }

  // Rumble
  const rumbleMatch = url.match(/rumble\.com\/embed\/([a-zA-Z0-9]+)/)
  if (rumbleMatch) return { type: 'rumble', id: rumbleMatch[1] }
  const rumbleSlugMatch = url.match(/rumble\.com\/([a-zA-Z0-9]+-[^/]+)\.html/)
  if (rumbleSlugMatch) return { type: 'rumble', id: rumbleSlugMatch[1] }

  // Twitter / X
  if (/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/.test(url)) return { type: 'twitter' }

  // Instagram
  if (/instagram\.com\/(?:p|reel)\/[\w-]+/.test(url)) return { type: 'instagram' }

  // Facebook (posts, videos, photos, watch, reels)
  if (/facebook\.com\/(?:.+\/)?(?:posts|videos|photos|watch|reel)\b/.test(url) || /fb\.watch\//.test(url)) return { type: 'facebook' }

  // Images — file extension
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?|#|$)/i.test(url)) return { type: 'image' }

  // Images — known hosting domains without file extensions
  if (/(?:i\.imgur\.com|imgur\.com\/\w{5,})/.test(url)) return { type: 'image' }
  if (/images\.unsplash\.com\/photo-/.test(url)) return { type: 'image' }
  if (/res\.cloudinary\.com\/.+\/image\//.test(url)) return { type: 'image' }
  if (/pbs\.twimg\.com\/media\//.test(url)) return { type: 'image' }
  if (/media\.giphy\.com\/media\//.test(url)) return { type: 'image' }
  if (/upload\.wikimedia\.org\/wikipedia\//.test(url) && /\.(jpg|jpeg|png|gif|svg|webp)/i.test(url)) return { type: 'image' }

  return { type: 'link' }
}

const iframeSt: React.CSSProperties = {
  width: '100%', height: '100%', border: 'none',
}

const videoWrap: React.CSSProperties = {
  width: '100%', maxWidth: 480, borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9',
}

// ── Script loader (deduplicates across multiple embeds) ──

const loadedScripts = new Set<string>()
const pendingScripts = new Map<string, Promise<void>>()

function loadScript(src: string): Promise<void> {
  if (loadedScripts.has(src)) return Promise.resolve()
  if (pendingScripts.has(src)) return pendingScripts.get(src)!
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.onload = () => { loadedScripts.add(src); pendingScripts.delete(src); resolve() }
    el.onerror = () => { pendingScripts.delete(src); reject() }
    document.body.appendChild(el)
  })
  pendingScripts.set(src, p)
  return p
}

// ── Twitter/X native embed ──

function TwitterEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const render = async () => {
      await loadScript('https://platform.twitter.com/widgets.js')
      const twttr = (window as any).twttr
      if (twttr?.widgets?.createTweet) {
        const match = url.match(/status\/(\d+)/)
        if (match) {
          el.innerHTML = ''
          await twttr.widgets.createTweet(match[1], el, {
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            dnt: true,
            conversation: 'none',
          })
          setLoaded(true)
        }
      }
    }

    render()
  }, [url])

  return (
    <div ref={ref} style={{ width: '100%', maxWidth: 480, minHeight: loaded ? undefined : 200 }}>
      {!loaded && <EmbedSkeleton icon="bxl-twitter" color="#1da1f2" label="Loading tweet..." />}
    </div>
  )
}

// ── Instagram native embed ──

function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  // Normalize URL to embed-friendly format
  const embedUrl = useMemo(() => {
    const clean = url.split('?')[0].replace(/\/$/, '')
    return `${clean}/embed/captioned/`
  }, [url])

  const onLoad = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    // Try to process via instgrm.Embeds if script is already loaded
    const ig = (window as any).instgrm
    if (ig?.Embeds?.process) ig.Embeds.process()
    else loadScript('https://www.instagram.com/embed.js').then(() => {
      const ig2 = (window as any).instgrm
      if (ig2?.Embeds?.process) ig2.Embeds.process()
    })
  }, [url])

  return (
    <div ref={ref} style={{ width: '100%', maxWidth: 480, minHeight: loaded ? undefined : 400 }}>
      {!loaded && <EmbedSkeleton icon="bxl-instagram" color="#e4405f" label="Loading post..." />}
      <iframe
        src={embedUrl}
        style={{ ...iframeSt, minHeight: 400, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
        allowFullScreen
        loading="lazy"
        title="Instagram post"
        onLoad={onLoad}
      />
    </div>
  )
}

// ── Facebook native embed ──

function FacebookEmbed({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false)

  // Determine if this is a video URL
  const isVideo = /\/videos\/|\/watch|\/reel|fb\.watch/.test(url)

  const encodedUrl = encodeURIComponent(url)
  const embedSrc = isVideo
    ? `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=480`
    : `https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=480`

  const onLoad = useCallback(() => setLoaded(true), [])

  return (
    <div style={{ width: '100%', maxWidth: 480, minHeight: loaded ? undefined : (isVideo ? 270 : 300) }}>
      {!loaded && <EmbedSkeleton icon="bxl-facebook" color="#1877f2" label={isVideo ? 'Loading video...' : 'Loading post...'} />}
      <iframe
        src={embedSrc}
        style={{
          ...iframeSt,
          minHeight: isVideo ? 270 : 300,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        title="Facebook post"
        onLoad={onLoad}
      />
    </div>
  )
}

// ── Loading skeleton ──

function EmbedSkeleton({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg"
      style={{
        position: 'absolute', inset: 0,
        background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
        border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
      }}
    >
      <i className={`bx ${icon} text-2xl`} style={{ color, opacity: 0.6 }} />
      <span className="text-xs" style={{ color: 'var(--color-fg-dim)', opacity: 0.6 }}>{label}</span>
    </div>
  )
}

// ── Rich Link Preview ──

interface OgData {
  url: string
  title?: string
  description?: string
  image?: string
  site_name?: string
  favicon?: string
}

function LinkPreview({ url }: { url: string }) {
  const [og, setOg] = useState<OgData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/og-preview?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then((data: OgData) => { if (!cancelled) setOg(data) })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [url])

  // Fallback: simple link while loading or on error
  if (!og || failed) {
    let hostname = ''
    try { hostname = new URL(url).hostname } catch {}
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg no-underline"
        style={{
          background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          color: 'var(--color-fg-muted)',
        }}
      >
        <img
          src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
          alt="" width={16} height={16}
          className="rounded-sm shrink-0" style={{ opacity: 0.8 }}
        />
        <span className="text-xs truncate flex-1">{url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
        <i className="bx bx-link-external text-sm shrink-0" style={{ color: 'var(--color-fg-dim)' }} />
      </a>
    )
  }

  // Rich card with OG data
  const hasImage = og.image && og.image.startsWith('http')

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex rounded-lg overflow-hidden no-underline transition-colors"
      style={{
        width: '100%', maxWidth: 480,
        background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
        border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
        color: 'var(--color-fg-muted)',
      }}
    >
      {hasImage && (
        <img
          src={og.image!}
          alt=""
          style={{ width: 120, minHeight: 80, objectFit: 'cover', flexShrink: 0 }}
          loading="lazy"
        />
      )}
      <div className="flex flex-col justify-center gap-1 px-3 py-2.5 min-w-0 flex-1">
        {og.site_name && (
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-fg-dim)' }}>
            {og.site_name}
          </span>
        )}
        <span className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: 'var(--color-fg)' }}>
          {og.title || url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </span>
        {og.description && (
          <span className="text-[11px] leading-snug line-clamp-2" style={{ color: 'var(--color-fg-dim)' }}>
            {og.description}
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: 'var(--color-fg-dim)', opacity: 0.7 }}>
          <img
            src={og.favicon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`}
            alt="" width={12} height={12} className="rounded-sm"
          />
          {url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
        </span>
      </div>
    </a>
  )
}

// ── Smart Image (with onError fallback to link preview) ──

function SmartImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) return <LinkPreview url={url} />

  return (
    <img
      src={url}
      alt=""
      className="rounded-lg max-w-full"
      style={{ maxHeight: 300, objectFit: 'cover' }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

// ── Main component ──

export default function PostEmbed({ url }: PostEmbedProps) {
  const embed = useMemo(() => detectEmbed(url), [url])

  switch (embed.type) {
    case 'youtube':
      return (
        <div style={videoWrap}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${embed.id}`}
            style={iframeSt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="YouTube video"
          />
        </div>
      )

    case 'vimeo':
      return (
        <div style={videoWrap}>
          <iframe
            src={`https://player.vimeo.com/video/${embed.id}?dnt=1`}
            style={iframeSt}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="Vimeo video"
          />
        </div>
      )

    case 'dailymotion':
      return (
        <div style={videoWrap}>
          <iframe
            src={`https://www.dailymotion.com/embed/video/${embed.id}`}
            style={iframeSt}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            title="Dailymotion video"
          />
        </div>
      )

    case 'twitch':
      return (
        <div style={videoWrap}>
          <iframe
            src={`https://player.twitch.tv/?${embed.id}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
            style={iframeSt}
            allowFullScreen
            loading="lazy"
            title="Twitch stream"
          />
        </div>
      )

    case 'tiktok':
      return (
        <div style={{ width: '100%', maxWidth: 325, borderRadius: 8, overflow: 'hidden', aspectRatio: '9/16', maxHeight: 580 }}>
          <iframe
            src={`https://www.tiktok.com/embed/v2/${embed.id}`}
            style={iframeSt}
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
            title="TikTok video"
          />
        </div>
      )

    case 'loom':
      return (
        <div style={videoWrap}>
          <iframe
            src={`https://www.loom.com/embed/${embed.id}`}
            style={iframeSt}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            title="Loom video"
          />
        </div>
      )

    case 'wistia':
      return (
        <div style={videoWrap}>
          <iframe
            src={`https://fast.wistia.net/embed/iframe/${embed.id}`}
            style={iframeSt}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            title="Wistia video"
          />
        </div>
      )

    case 'rumble':
      return (
        <div style={videoWrap}>
          <iframe
            src={`https://rumble.com/embed/${embed.id}/`}
            style={iframeSt}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            title="Rumble video"
          />
        </div>
      )

    case 'twitter':
      return <TwitterEmbed url={url} />

    case 'instagram':
      return <InstagramEmbed url={url} />

    case 'facebook':
      return <FacebookEmbed url={url} />

    case 'image':
      return <SmartImage url={url} />

    case 'link':
    default:
      return <LinkPreview url={url} />
  }
}

export { detectEmbed }
export type { EmbedMatch, EmbedType }
