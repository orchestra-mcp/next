'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/store/auth'
import { apiFetch, uploadUrl } from '@/lib/api'
import { useProfileTheme } from './use-profile-theme'

// ── Types ────────────────────────────────────────────────

interface AvatarUploadModalProps {
  open: boolean
  onClose: () => void
  currentAvatar?: string | null
  onUploaded: (newAvatarUrl: string) => void
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

// ── Constants ────────────────────────────────────────────

const CROP_SIZE = 200
const MIN_SCALE = 1
const MAX_SCALE = 3
const SCALE_STEP = 0.01
const OUTPUT_SIZE = 400 // 2x for retina

// ── Component ────────────────────────────────────────────

export default function AvatarUploadModal({
  open,
  onClose,
  currentAvatar,
  onUploaded,
}: AvatarUploadModalProps) {
  const { isDark, colors } = useProfileTheme()
  const updateAvatarUrl = useAuthStore((s) => s.updateAvatarUrl)

  // ── State ──────────────────────────────────────────────

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1, rotation: 0 })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dragRef = useRef<DragState>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cropAreaRef = useRef<HTMLDivElement>(null)

  // ── Reset on open/close ────────────────────────────────

  useEffect(() => {
    if (!open) {
      setImageSrc(null)
      setImageEl(null)
      setCrop({ x: 0, y: 0, scale: 1, rotation: 0 })
      setUploading(false)
      setError(null)
    }
  }, [open])

  // ── File selection ─────────────────────────────────────

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

  // ── Drag to reposition ─────────────────────────────────

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

  // ── Zoom ───────────────────────────────────────────────

  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCrop((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
  }, [])

  // ── Scroll wheel zoom ─────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setCrop((prev) => {
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta))
      return { ...prev, scale: next }
    })
  }, [])

  // ── Rotate ─────────────────────────────────────────────

  const rotateLeft = useCallback(() => {
    setCrop((prev) => ({ ...prev, rotation: (prev.rotation - 90 + 360) % 360 }))
  }, [])

  const rotateRight = useCallback(() => {
    setCrop((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
  }, [])

  // ── Canvas crop + upload ───────────────────────────────

  const handleSave = useCallback(async () => {
    if (!imageEl || !canvasRef.current) return

    setUploading(true)
    setError(null)

    try {
      const canvas = canvasRef.current
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext('2d')!

      // Fill with solid background so no transparent corners
      ctx.fillStyle = '#0f0f12'
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

      // Compute fitScale (same as preview) — fits shorter edge to crop area
      const isRotated90 = crop.rotation === 90 || crop.rotation === 270
      const effectiveW = isRotated90 ? imageEl.naturalHeight : imageEl.naturalWidth
      const effectiveH = isRotated90 ? imageEl.naturalWidth : imageEl.naturalHeight
      const canvasFitScale = CROP_SIZE / Math.min(effectiveW, effectiveH)

      // The crop area is CROP_SIZE CSS pixels. The output is OUTPUT_SIZE canvas pixels.
      const outputScale = OUTPUT_SIZE / CROP_SIZE

      ctx.save()

      // Move origin to center of output canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2)

      // Apply rotation
      ctx.rotate((crop.rotation * Math.PI) / 180)

      // Apply zoom (canvasFitScale fits image to crop area, crop.scale is user zoom, outputScale converts to canvas px)
      ctx.scale(canvasFitScale * crop.scale * outputScale, canvasFitScale * crop.scale * outputScale)

      // Apply the user's pan offset (in crop-space coordinates, so divide by scale)
      // The offset is CSS px of movement in the crop viewport, scaled by the current zoom.
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
          'image/jpeg',
          0.92,
        )
      })

      // Build form data
      const formData = new FormData()
      formData.append('avatar', blob, 'avatar.jpg')

      // Upload via API
      const result = await apiFetch<{ ok: boolean; avatar_url: string }>(
        '/api/settings/avatar',
        {
          method: 'POST',
          body: formData,
        },
      )

      // Update auth store
      updateAvatarUrl(result.avatar_url)

      // Notify parent
      onUploaded(result.avatar_url)

      // Close modal
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [imageEl, crop, updateAvatarUrl, onUploaded, onClose])

  // ── Escape key to close ────────────────────────────────

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // ── Computed image transform ───────────────────────────

  // The image inside the crop viewport needs to be:
  // - Scaled from its natural size to fit the CROP_SIZE viewport at scale=1.
  //   At scale=1 the shorter edge should fill the crop square.
  // - Then multiplied by crop.scale for zoom.
  // - Then translated by crop.x, crop.y for pan.
  // - Then rotated by crop.rotation.

  let fitScale = 1
  if (imageEl) {
    // Account for rotation: at 90/270 degrees width/height swap
    const isRotated90 = crop.rotation === 90 || crop.rotation === 270
    const effectiveW = isRotated90 ? imageEl.naturalHeight : imageEl.naturalWidth
    const effectiveH = isRotated90 ? imageEl.naturalWidth : imageEl.naturalHeight
    fitScale = CROP_SIZE / Math.min(effectiveW, effectiveH)
  }

  const imageTransform = imageEl
    ? `translate(${crop.x}px, ${crop.y}px) rotate(${crop.rotation}deg) scale(${fitScale * crop.scale})`
    : ''

  // ── Render ─────────────────────────────────────────────

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
          className="fade-up pointer-events-auto w-full max-w-[420px] rounded-2xl p-7 pb-6"
          style={{
            background: isDark ? '#1a1a22' : '#ffffff',
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2
              className="m-0 text-[17px] font-bold tracking-tight"
              style={{ color: colors.textPrimary }}
            >
              {imageSrc ? 'Adjust Avatar' : 'Upload Avatar'}
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

          {/* ── File picker (no image selected yet) ─── */}
          {!imageSrc && (
            <div className="flex flex-col items-center gap-4">
              {/* Current avatar preview */}
              {currentAvatar && (
                <div
                  className="mb-1 h-24 w-24 overflow-hidden rounded-2xl"
                  style={{ border: `2px solid ${colors.cardBorder}` }}
                >
                  <img
                    src={uploadUrl(currentAvatar)}
                    alt="Current avatar"
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
                  Click to choose an image
                </div>
                <div
                  className="text-xs"
                  style={{ color: colors.textMuted }}
                >
                  PNG, JPG, GIF, or WebP. Max 10 MB.
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

          {/* ── Crop editor (image selected) ─────────── */}
          {imageSrc && imageEl && (
            <div className="flex flex-col items-center gap-4">
              {/* Crop viewport container — overflow:hidden contains the box-shadow */}
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-xl"
                style={{
                  width: CROP_SIZE + 40,
                  height: CROP_SIZE + 40,
                  background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.25)',
                }}
              >
                <div
                  ref={cropAreaRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onWheel={handleWheel}
                  className="relative z-[1] select-none overflow-hidden rounded-2xl"
                  style={{
                    width: CROP_SIZE,
                    height: CROP_SIZE,
                    cursor: dragRef.current.active ? 'grabbing' : 'grab',
                    border: `3px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                    boxShadow: `0 0 0 4000px ${isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)'}`,
                    touchAction: 'none',
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
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-base font-inherit transition-opacity duration-150"
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
                  <i
                    className="bx bx-minus text-sm"
                    style={{ color: colors.textMuted }}
                  />
                  <input
                    type="range"
                    min={MIN_SCALE}
                    max={MAX_SCALE}
                    step={SCALE_STEP}
                    value={crop.scale}
                    onChange={handleScaleChange}
                    className="h-1 flex-1 cursor-pointer"
                    style={{ accentColor: colors.accent }}
                    aria-label="Zoom"
                  />
                  <i
                    className="bx bx-plus text-sm"
                    style={{ color: colors.textMuted }}
                  />
                </div>

                {/* Rotate right */}
                <button
                  onClick={rotateRight}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-base font-inherit transition-opacity duration-150"
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
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-medium underline font-inherit"
                style={{ color: colors.accent }}
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
              className="mt-3.5 rounded-lg px-3 py-2.5 text-[13px]"
              style={{
                background: 'rgba(239, 68, 68, 0.07)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: colors.danger,
              }}
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
                className="flex-1 rounded-[10px] border-none px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity duration-150 font-inherit"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentPurple})`,
                  opacity: uploading ? 0.7 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? 'Uploading...' : 'Save Avatar'}
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="cursor-pointer rounded-[10px] bg-transparent text-[13px] font-semibold transition-opacity duration-150 font-inherit"
              style={{
                flex: imageSrc ? undefined : 1,
                padding: imageSrc ? '10px 20px' : '10px',
                border: `1px solid ${colors.cardBorder}`,
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
