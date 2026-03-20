import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pagePath = resolve(__dirname, '../page.tsx')
const storePath = resolve(__dirname, '../../../../../../store/community.ts')

describe('Activity timeline', () => {
  const page = readFileSync(pagePath, 'utf-8')
  const store = readFileSync(storePath, 'utf-8')

  it('store has ActivityItem interface', () => {
    expect(store).toContain('export interface ActivityItem')
    expect(store).toContain("type: string")
  })

  it('store has fetchActivity method', () => {
    expect(store).toContain('fetchActivity')
    expect(store).toContain('/api/public/community/members/')
    expect(store).toContain('/activity')
  })

  it('page has Posts/Activity view toggle', () => {
    expect(page).toContain("feedView")
    expect(page).toContain("'posts'")
    expect(page).toContain("'activity'")
  })

  it('page groups activity by date', () => {
    expect(page).toContain('Today')
    expect(page).toContain('Yesterday')
    expect(page).toContain('This Week')
  })

  it('page has activity type icons for post, comment, shared items', () => {
    expect(page).toContain('ACTIVITY_ICONS')
    expect(page).toContain("post:")
    expect(page).toContain("comment:")
    expect(page).toContain("shared_note:")
  })

  it('activity items link to relevant pages', () => {
    expect(page).toContain('/@${handle}/post/')
    expect(page).toContain('/@${handle}/shared/')
  })
})
