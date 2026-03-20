import * as fs from 'fs'
import * as path from 'path'

const coverSrc = fs.readFileSync(path.resolve(__dirname, '../cover-upload-modal.tsx'), 'utf-8')
const goSrc = fs.readFileSync(path.resolve(__dirname, '../../../../../../../../orch-ref/app/handlers/community_handler.go'), 'utf-8')
const modelSrc = fs.readFileSync(path.resolve(__dirname, '../../../../../../../../orch-ref/app/models/sync.go'), 'utf-8')
const authSrc = fs.readFileSync(path.resolve(__dirname, '../../../../../../../../orch-ref/app/handlers/auth_handler.go'), 'utf-8')
const routeSrc = fs.readFileSync(path.resolve(__dirname, '../../../../../../../../orch-ref/app/handlers/community_routes.go'), 'utf-8')
const storeSrc = fs.readFileSync(path.resolve(__dirname, '../../../store/auth.ts'), 'utf-8')

let passed = 0
let failed = 0

function assert(name: string, condition: boolean) {
  if (condition) { console.log('PASS:', name); passed++ }
  else { console.error('FAIL:', name); failed++ }
}

// Frontend component
assert('exports CoverUploadModal', /export default function CoverUploadModal/.test(coverSrc))
assert('open prop', coverSrc.includes('open: boolean'))
assert('onClose prop', coverSrc.includes('onClose'))
assert('currentCover prop', coverSrc.includes('currentCover'))
assert('file input', coverSrc.includes('type="file"'))
assert('zoom controls', coverSrc.includes('zoom'))
assert('rotation controls', coverSrc.includes('rotation'))
assert('drag support', /onPointerDown|onMouseDown/i.test(coverSrc))
assert('canvas crop', coverSrc.includes('canvas'))
assert('upload to /cover', coverSrc.includes('/api/users/profile/cover'))
assert('FormData', coverSrc.includes('FormData'))

// Go handler
assert('Go: uploadCover handler', goSrc.includes('func uploadCover'))
assert('Go: cover form field', goSrc.includes('FormFile("cover")'))
assert('Go: cover_url update', goSrc.includes('Update("cover_url"'))
assert('Go: uploads/covers dir', goSrc.includes('uploads/covers'))

// Data model
assert('Model: CoverURL field', modelSrc.includes('CoverURL'))
assert('Auth: cover_url in resource', authSrc.includes('"cover_url"'))
assert('Route: /cover registered', routeSrc.includes('"/cover"'))
assert('Store: cover_url field', storeSrc.includes('cover_url'))

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) process.exit(1)
