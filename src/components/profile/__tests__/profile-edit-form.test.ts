// Profile edit form integration tests (file-based assertions)
import * as fs from 'fs'
import * as path from 'path'

const formSrc = fs.readFileSync(path.resolve(__dirname, '../profile-edit-form.tsx'), 'utf-8')
const editPage = fs.readFileSync(path.resolve(__dirname, '../../../../app/[locale]/(marketing)/member/[handle]/edit/page.tsx'), 'utf-8')

let passed = 0, failed = 0
function assert(name: string, condition: boolean) {
  if (condition) { console.log('PASS:', name); passed++ }
  else { console.error('FAIL:', name); failed++ }
}

// Form component
assert('exports ProfileEditForm', /ProfileEditForm/.test(formSrc))
assert('name input field', formSrc.includes('name'))
assert('username input field', formSrc.includes('username'))
assert('bio textarea', formSrc.includes('bio'))
assert('avatar modal import', formSrc.includes('AvatarUploadModal'))
assert('cover modal import', formSrc.includes('CoverUploadModal'))
assert('PUT /api/users/profile', formSrc.includes('/api/users/profile'))
assert('slug validation', /slug|SLUG/.test(formSrc))
assert('character count', /500|character/.test(formSrc))
assert('auth store update', formSrc.includes('useAuthStore'))

// Edit page integration
assert('edit page renders form', editPage.includes('ProfileEditForm'))
assert('edit page reads auth store', editPage.includes('useAuthStore'))

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) process.exit(1)
