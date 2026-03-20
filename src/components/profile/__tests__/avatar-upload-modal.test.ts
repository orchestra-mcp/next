import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const src = fs.readFileSync(
  path.resolve(__dirname, '../avatar-upload-modal.tsx'),
  'utf-8'
)

describe('AvatarUploadModal component', () => {
  it('exports a default component', () => {
    expect(src).toMatch(/export default function AvatarUploadModal/)
  })

  it('accepts the required props interface', () => {
    expect(src).toContain('open: boolean')
    expect(src).toContain('onClose: () => void')
    expect(src).toContain('currentAvatar')
    expect(src).toContain('onUploaded')
  })

  it('uses a hidden file input for image selection', () => {
    expect(src).toContain('type="file"')
    expect(src).toMatch(/accept.*image/)
  })

  it('validates file type and size', () => {
    // Should check for image types
    expect(src).toMatch(/image\/(png|jpeg|gif|webp)/)
    // Should enforce a max file size
    expect(src).toMatch(/size.*>|fileSize|MB/)
  })

  it('has zoom controls', () => {
    expect(src).toContain('zoom')
    // Slider for zoom
    expect(src).toMatch(/type.*range|slider/i)
  })

  it('has rotate controls', () => {
    expect(src).toContain('rotation')
    expect(src).toMatch(/rotate|Rotate/i)
  })

  it('supports drag to reposition', () => {
    expect(src).toMatch(/onPointerDown|onMouseDown|drag/i)
  })

  it('uses a canvas for crop rendering', () => {
    expect(src).toContain('canvas')
    expect(src).toMatch(/toBlob|toDataURL/)
  })

  it('uploads to /api/users/profile/avatar', () => {
    expect(src).toContain('/api/users/profile/avatar')
    expect(src).toContain('FormData')
  })

  it('updates auth store avatar after upload', () => {
    expect(src).toContain('updateAvatarUrl')
  })

  it('has backdrop click to dismiss', () => {
    expect(src).toContain('onClose')
  })

  it('renders circular crop viewport', () => {
    expect(src).toMatch(/borderRadius.*50%|border-radius.*50%/)
  })
})
