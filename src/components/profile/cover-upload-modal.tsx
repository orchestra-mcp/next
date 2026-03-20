'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/store/auth'
import { apiFetch, uploadUrl } from '@/lib/api'
import { useProfileTheme } from './use-profile-theme'

// -- Types ----------------------------------------------------

interface CoverUploadModalProps {
  open: boolean
  onClose: () => void
  currentCover?: string | null
  onUploaded: (newCoverUrl: string) => void
}

interface CropState {
  /** Offset of image relative to crop center, in CSS px */
  x: number
  y: number
  /** 1x to 3x */
  scale: number
  /** 0, 90, 180, 270 */
  rotation: number
}

interface DragState {
  active: boolean
  startX: number
  startY: number
  originX: number
  originY: number
}

// -- Constants ------------------------------------------------

/** Desktop crop viewport width in CSS px */
const CROP_WIDTH = 820
/** Desktop crop viewport height in CSS px */
const CROP_HEIGHT = 200
/** Output width at 2x retina */
const OUTPUT_WIDTH = 1640
/** Output height at 2x retina */
const OUTPUT_HEIGHT = 400
const MIN_SCALE = 1
const MAX_SCALE = 3
const SCALE_STEP = 0.01

// -- Component ------------------------------------------------

export default function CoverUploadModal({
  open,
  onClose,
  currentCover,
  onUploaded,
}: CoverUploadModalProps) {
  const { isDark, colors } = useProfileTheme()

  // -- State --------------------------------------------------

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1, rotation: 0 })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewportWidth, setViewportWidth] = useState(CROP_WIDTH)

  const dragRef = useRef<DragState>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cropAreaRef = useRef<HTMLDivElement>(null)

  // -- Responsive crop viewport width -------------------------

  useEffect(() => {
    function updateWidth() {
      // Modal has 28px padding each side + 20px outer padding each side = 96px total
      // Cap at CROP_WIDTH for desktop
      const available = window.innerWidth - 96
      setViewportWidth(Math.min(CROP_WIDTH, Math.max(280, available)))
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  /** Crop viewport height scales proportionally to maintain aspect ratio */
  const cropW = viewportWidth
  const cropH = Math.round(viewportWidth * (CROP_HEIGHT / CROP_WIDTH))

  // -- Reset on open/close ------------------------------------

  useEffect(() => {
    if (!open) {
      setImageSrc(null)
      setImageEl(null)
      setCrop({ x: 0, y: 0, scale: 1, rotation: 0 })
      setUploading(false)
      setError(null)
    }
  }, [open])

  // -- File selection -----------------------------------------

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF, WebP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10 MB.')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImageSrc(dataUrl)

      const img = new Image()
      img.onload = () => {
        setImageEl(img)
        setCrop({ x: 0, y: 0, scale: 1, rotation: 0 })
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)

    // Reset input so the same file can be re-selected
    e.target.value = ''
  }, [])

  // -- Drag to reposition -------------------------------------

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: crop.x,
      originY: crop.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [crop.x, crop.y])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setCrop((prev) => ({
      ...prev,
      x: dragRef.current.originX + dx,
      y: dragRef.current.originY + dy,
    }))
  }, [])

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false
  }, [])

  // -- Zoom ---------------------------------------------------

  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCrop((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
  }, [])

  // -- Scroll wheel zoom --------------------------------------

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setCrop((prev) => {
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta))
      return { ...prev, scale: next }
    })
  }, [])

  // -- Rotate -------------------------------------------------

  const rotateLeft = useCallback(() => {
    setCrop((prev) => ({ ...prev, rotation: (prev.rotation - 90 + 360) % 360 }))
  }, [])

  const rotateRight = useCallback(() => {
    setCrop((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
  }, [])

  // -- Canvas crop + upload -----------------------------------

  const handleSave = useCallback(async () => {
    if (!imageEl || !canvasRef.current) return

    setUploading(true)
    setError(null)

    try {
      const canvas = canvasRef.current
      canvas.width = OUTPUT_WIDTH
      canvas.height = OUTPUT_HEIGHT
      const ctx = canvas.getContext('2d')!

      // Clear to transparent
      ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)

      // Rectangular crop -- no circular clipping
      // The crop area is cropW x cropH CSS pixels.
      // The output is OUTPUT_WIDTH x OUTPUT_HEIGHT canvas pixels.
      const scaleX = OUTPUT_WIDTH / cropW
      const scaleY = OUTPUT_HEIGHT / cropH

      ctx.save()

      // Move origin to center of output canvas
      ctx.translate(OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2)

      // Apply rotation
      ctx.rotate((crop.rotation * Math.PI) / 180)

      // Apply zoom (use scaleX for uniform scaling based on width axis)
      ctx.scale(crop.scale * scaleX, crop.scale * scaleY)

      // Apply the user's pan offset (in crop-space coordinates)
      ctx.translate(crop.x / crop.scale, crop.y / crop.scale)

      // Draw image centered
      ctx.drawImage(
        imageEl,
        -imageEl.naturalWidth / 2,
        -imageEl.naturalHeight / 2,
        imageEl.naturalWidth,
        imageEl.naturalHeight,
      )

      ctx.restore()

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create image blob'))),
          'image/png',
          1,
        )
      })

      // Build form data
      const formData = new FormData()
      formData.append('cover', blob, 'cover.png')

      // Upload via API
      const result = await apiFetch<{ ok: boolean; cover_url: string }>(
        '/api/settings/cover',
        {
          method: 'POST',
          body: formData,
        },
      )

      // Update auth store
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, cover_url: result.cover_url } : null,
      }))

      // Notify parent
      onUploaded(result.cover_url)

      // Close modal
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [imageEl, crop, cropW, cropH, onUploaded, onClose])

  // -- Escape key to close ------------------------------------

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // -- Computed image transform for the crop preview ----------

  // The image inside the crop viewport needs to be:
  // - Scaled from its natural size to fit the rectangular viewport at scale=1.
  //   At scale=1 the shorter axis (relative to the viewport ratio) should fill the viewport.
  // - Then multiplied by crop.scale for zoom.
  // - Then translated by crop.x, crop.y for pan.
  // - Then rotated by crop.rotation.

  let fitScale = 1
  if (imageEl) {
    const isRotated90 = crop.rotation === 90 || crop.rotation === 270
    const effectiveW = isRotated90 ? imageEl.naturalHeight : imageEl.naturalWidth
    const effectiveH = isRotated90 ? imageEl.naturalWidth : imageEl.naturalHeight

    // Cover-fit: scale so the image covers the entire viewport
    const scaleW = cropW / effectiveW
    const scaleH = cropH / effectiveH
    fitScale = Math.max(scaleW, scaleH)
  }

  const imageTransform = imageEl
    ? `translate(${crop.x}px, ${crop.y}px) rotate(${crop.rotation}deg) scale(${fitScale * crop.scale})`
    : ''

  // -- Render -------------------------------------------------

  if (!open) return null

  return createPortal(
    <div>
      {/* Hidden canvas for rendering the cropped output */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-[10001] bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-[10002] flex items-center justify-center p-5 pointer-events-none">
        {/* Modal card */}
        <div
          className="fade-up pointer-events-auto w-full rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          style={{
            maxWidth: cropW + 56, // 28px padding each side
            background: isDark ? '#1a1a22' : '#ffffff',
            border: `1px solid ${colors.cardBorder}`,
            padding: '28px 28px 24px',
          }}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2
              className="m-0 text-[17px] font-bold tracking-tight"
              style={{ color: colors.textPrimary }}
            >
              {imageSrc ? 'Adjust Cover Image' : 'Upload Cover Image'}
            </h2>
            <button
              onClick={onClose}
              className="flex cursor-pointer border-none bg-transparent p-1 text-xl"
              style={{ color: colors.textMuted }}
              aria-label="Close"
            >
              <i className="bx bx-x" />
            </button>
          </div>

          {/* -- File picker (no image selected yet) -- */}
          {!imageSrc && (
            <div className="flex flex-col items-center gap-4">
              {/* Current cover preview */}
              {currentCover && (
                <div
                  className="mb-1 w-full overflow-hidden rounded-[10px]"
                  style={{
                    height: Math.round(cropW * 0.244), // ~4.1:1 aspect ratio preview
                    border: `2px solid ${colors.cardBorder}`,
                  }}
                >
                  <img
                    src={uploadUrl(currentCover)}
                    alt="Current cover"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Drop zone / picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full cursor-pointer rounded-xl px-5 py-9 text-center transition-[border-color] duration-150"
                style={{
                  border: `2px dashed ${colors.cardBorder}`,
                  background: colors.inputBg,
                }}
              >
                <i
                  className="bx bx-cloud-upload mb-2.5 block text-4xl"
                  style={{ color: colors.textMuted }}
                />
                <div
                  className="mb-1 text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Click to choose a cover image
                </div>
                <div className="text-xs" style={{ color: colors.textMuted }}>
                  PNG, JPG, GIF, or WebP. Max 10 MB. Recommended: 1640x400 or wider.
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* -- Crop editor (image selected) -- */}
          {imageSrc && imageEl && (
            <div className="flex flex-col items-center gap-4">
              {/* Crop viewport container -- overflow:hidden contains the box-shadow */}
              <div
                className="relative flex w-full items-center justify-center overflow-hidden rounded-xl"
                style={{
                  height: cropH + 40,
                  background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.25)',
                }}
              >
                <div
                  ref={cropAreaRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onWheel={handleWheel}
                  className="relative z-[1] select-none overflow-hidden rounded-[10px] touch-none"
                  style={{
                    width: cropW,
                    height: cropH,
                    cursor: dragRef.current.active ? 'grabbing' : 'grab',
                    border: `3px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                    boxShadow: `0 0 0 4000px ${isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)'}`,
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Crop preview"
                    draggable={false}
                    className="pointer-events-none absolute left-1/2 top-1/2 max-h-none max-w-none origin-center"
                    style={{
                      transform: `translate(-50%, -50%) ${imageTransform}`,
                      width: imageEl.naturalWidth,
                      height: imageEl.naturalHeight,
                    }}
                  />
                </div>
              </div>

              {/* Controls row */}
              <div className="flex w-full items-center gap-3">
                {/* Rotate left */}
                <button
                  onClick={rotateLeft}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg font-inherit text-base transition-opacity duration-150"
                  style={{
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.inputBg,
                    color: colors.textPrimary,
                  }}
                  title="Rotate left 90 degrees"
                  aria-label="Rotate left"
                >
                  <i className="bx bx-rotate-left" />
                </button>

                {/* Zoom slider */}
                <div className="flex flex-1 items-center gap-2">
                  <i className="bx bx-minus text-sm" style={{ color: colors.textMuted }} />
                  <input
                    type="range"
                    min={MIN_SCALE}
                    max={MAX_SCALE}
                    step={SCALE_STEP}
                    value={crop.scale}
                    onChange={handleScaleChange}
                    className="h-1 flex-1 cursor-pointer accent-[#00e5ff]"
                    aria-label="Zoom"
                  />
                  <i className="bx bx-plus text-sm" style={{ color: colors.textMuted }} />
                </div>

                {/* Rotate right */}
                <button
                  onClick={rotateRight}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg font-inherit text-base transition-opacity duration-150"
                  style={{
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.inputBg,
                    color: colors.textPrimary,
                  }}
                  title="Rotate right 90 degrees"
                  aria-label="Rotate right"
                >
                  <i className="bx bx-rotate-right" />
                </button>
              </div>

              {/* Choose different file */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-none bg-transparent p-0 font-inherit text-xs font-medium text-[#00e5ff] underline"
              >
                Choose a different image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mt-3.5 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[13px]"
              style={{ color: colors.danger }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-[18px]">
            {imageSrc && imageEl ? (
              <button
                onClick={handleSave}
                disabled={uploading}
                className="flex-1 cursor-pointer rounded-[10px] border-none px-5 py-2.5 font-inherit text-[13px] font-semibold text-white transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                }}
              >
                {uploading ? 'Uploading...' : 'Save Cover'}
              </button>
            ) : null}
            <button
              onClick={onClose}
              className={`cursor-pointer rounded-[10px] font-inherit text-[13px] font-semibold transition-opacity duration-150 ${
                imageSrc ? 'px-5 py-2.5' : 'flex-1 px-5 py-2.5'
              }`}
              style={{
                border: `1px solid ${colors.cardBorder}`,
                background: 'transparent',
                color: colors.textMuted,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  ) as React.ReactElement
}
