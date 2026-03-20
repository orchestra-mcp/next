import type { Metadata } from 'next'
import BadgeCelebrationClient from './BadgeCelebrationClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

const BADGES: Record<string, { name: string; desc: string; icon: string; color: string; category: string }> = {
  'early-adopter': { name: 'Early Adopter', desc: 'Joined during the beta phase.', icon: 'bx-rocket', color: '#00e5ff', category: 'special' },
  'first-post': { name: 'First Post', desc: 'Published your first community post.', icon: 'bx-edit', color: '#22c55e', category: 'achievement' },
  'contributor': { name: 'Contributor', desc: 'Shared 5+ skills, agents, or workflows.', icon: 'bx-code-alt', color: '#a900ff', category: 'achievement' },
  'streak-7': { name: '7-Day Streak', desc: 'Logged health data for 7 consecutive days.', icon: 'bx-flame', color: '#f59e0b', category: 'streak' },
  'streak-30': { name: '30-Day Streak', desc: 'Logged health data for 30 consecutive days.', icon: 'bx-trophy', color: '#ef4444', category: 'streak' },
  'hydration-master': { name: 'Hydration Master', desc: 'Hit your water goal 30 days in a row.', icon: 'bx-droplet', color: '#3b82f6', category: 'achievement' },
  'caffeine-clean': { name: 'Caffeine Clean', desc: '30 days of 100% clean caffeine intake.', icon: 'bx-leaf', color: '#22c55e', category: 'achievement' },
  'team-player': { name: 'Team Player', desc: 'Active member of 3+ teams.', icon: 'bx-group', color: '#8b5cf6', category: 'achievement' },
  'points-1000': { name: '1K Points', desc: 'Earned 1,000 community points.', icon: 'bx-star', color: '#f59e0b', category: 'points' },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const badge = BADGES[slug]
  if (!badge) return { title: 'Badge Not Found' }
  return {
    title: `${badge.name} Badge Earned!`,
    description: badge.desc,
    openGraph: {
      title: `I earned the ${badge.name} badge on Orchestra!`,
      description: badge.desc,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `I earned the ${badge.name} badge on Orchestra!`,
      description: badge.desc,
    },
  }
}

export default async function BadgeCelebratePage({ params }: PageProps) {
  const { slug } = await params
  const badge = BADGES[slug] ?? null
  return <BadgeCelebrationClient slug={slug} badge={badge} />
}
