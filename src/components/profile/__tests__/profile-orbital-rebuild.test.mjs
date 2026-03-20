/**
 * Tests for profile modal fixes (FEAT-CBN round 3).
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..', '..', '..')
function readSrc(p) { return readFileSync(join(ROOT, 'src', p), 'utf8') }

let pass = 0, fail = 0
function assert(name, cond) { if (cond) { console.log(`  ✓ ${name}`); pass++ } else { console.log(`  ✗ ${name}`); fail++ } }

console.log('Modal Fixes — FEAT-CBN Round 3\n')

console.log('avatar-upload-modal.tsx:')
const av = readSrc('components/profile/avatar-upload-modal.tsx')
assert('uses /api/settings/avatar', av.includes("/api/settings/avatar"))
assert('does NOT use /api/users/profile/avatar', !av.includes("/api/users/profile/avatar"))
assert('has bg-black/60 overlay', av.includes('bg-black/60'))
assert('uses createPortal', av.includes('ReactDOM.createPortal'))

console.log('\ncover-upload-modal.tsx:')
const cv = readSrc('components/profile/cover-upload-modal.tsx')
assert('uses /api/settings/cover', cv.includes("/api/settings/cover"))
assert('does NOT use /api/users/profile/cover', !cv.includes("/api/users/profile/cover"))
assert('has bg-black/60 overlay', cv.includes('bg-black/60'))
assert('uses createPortal', cv.includes('ReactDOM.createPortal'))

console.log(`\n${pass + fail} assertions: ${pass} passed, ${fail} failed`)
process.exit(fail > 0 ? 1 : 0)
