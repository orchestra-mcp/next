'use client'

import { useCallback } from 'react'
import { useMCP } from '@/hooks/useMCP'

/**
 * Wraps the MCP tunnel connection to provide contextual smart actions.
 *
 * Each action maps to an MCP tool call through the active tunnel.
 * `canExecute` reflects whether the tunnel is connected and ready.
 *
 * Supports 6 action types matching the desktop SmartActionService:
 * - run_prompt: Send a prompt to the AI agent
 * - run_command: Run a shell command in the workspace
 * - sync_workspace: Trigger an immediate cloud sync
 * - run_tests: Run tests in the workspace
 * - get_status: Get workspace and sync status
 * - start_feature / advance_feature: Workflow control
 */
export function useSmartActions() {
  const { callTool, status } = useMCP()
  const canExecute = status === 'connected'

  const startFeature = useCallback(async (featureId: string) => {
    return callTool('set_current_feature', { feature_id: featureId })
  }, [callTool])

  const advanceFeature = useCallback(async (featureId: string, evidence: string) => {
    return callTool('advance_feature', { feature_id: featureId, evidence })
  }, [callTool])

  const runTests = useCallback(async (projectSlug: string, opts?: { runner?: string; pattern?: string }) => {
    let prompt = `Run tests for project ${projectSlug}`
    if (opts?.runner) prompt += ` using ${opts.runner}`
    if (opts?.pattern) prompt += ` matching ${opts.pattern}`
    return callTool('ai_prompt', { prompt, wait: true }, 120000)
  }, [callTool])

  const executePrompt = useCallback(async (prompt: string, provider?: string) => {
    const args: Record<string, unknown> = { prompt, wait: true }
    if (provider) args.provider = provider
    return callTool('ai_prompt', args, 120000)
  }, [callTool])

  const syncWorkspace = useCallback(async () => {
    return callTool('sync_now', {}, 30000)
  }, [callTool])

  const getStatus = useCallback(async () => {
    return callTool('sync_status', {}, 15000)
  }, [callTool])

  const runCommand = useCallback(async (command: string) => {
    return callTool('ai_prompt', {
      prompt: `Run this command and return the output: ${command}`,
      wait: true,
    }, 120000)
  }, [callTool])

  return {
    canExecute,
    startFeature,
    advanceFeature,
    runTests,
    executePrompt,
    syncWorkspace,
    getStatus,
    runCommand,
  }
}
