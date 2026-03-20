import type { Metadata } from 'next'
import PluginDetailClient from './PluginDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface PluginDef {
  display_name: string
  desc: string
  tools: number
  language: string
  repo: string
  color: string
  readme: string
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const plugin = PLUGINS[slug]
  if (!plugin) return { title: 'Plugin Not Found' }
  const title = `${plugin.display_name} Plugin`
  const desc = plugin.desc
  return {
    title,
    description: desc,
    openGraph: { title: `${title} | Orchestra Marketplace`, description: desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${title} | Orchestra Marketplace`, description: desc },
  }
}

async function fetchReadme(repo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/README.md`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) return await res.text()
  } catch {}
  return null
}

const PLUGINS: Record<string, PluginDef> = {
  'tools-features': {
    display_name: 'Feature Workflow', desc: 'Gated feature lifecycle, plans, requests, git tools.', tools: 70, language: 'Go', repo: 'orchestra-mcp/plugin-tools-features', color: '#00e5ff',
    readme: `# tools.features\n\nThe core workflow plugin for Orchestra MCP. Provides **70 MCP tools** for gated feature lifecycle management.\n\n## Tools\n\n### Feature Lifecycle\n- \`create_feature\` — Create a feature with kind (feature/bug/hotfix/chore)\n- \`advance_feature\` — Pass gates with evidence to move to next phase\n- \`submit_review\` — Complete review with user approval\n- \`set_current_feature\` — Start work (acquires session lock)\n\n### Plans\n- \`create_plan\` / \`approve_plan\` / \`breakdown_plan\` / \`complete_plan\`\n\n### Request Queue\n- \`create_request\` / \`get_next_request\` / \`convert_request\`\n\n### Git\n- \`git_quick_commit\` / \`git_push\` / \`git_pull\` / \`git_create_branch\`\n\n## Installation\n\n\`\`\`bash\norchestra plugin install tools-features\n\`\`\`\n\nBundled as a core plugin — installed by default.`,
  },
  'tools-marketplace': {
    display_name: 'Marketplace', desc: 'Pack management, stack detection, content queries.', tools: 15, language: 'Go', repo: 'orchestra-mcp/plugin-tools-marketplace', color: '#a900ff',
    readme: `# tools.marketplace\n\nPack management and stack detection plugin. Provides **15 MCP tools + 5 prompts**.\n\n## Tools\n\n- \`pack_install\` / \`pack_remove\` / \`pack_update\` / \`pack_list\` / \`pack_search\`\n- \`detect_stacks\` / \`recommend_packs\`\n- \`list_skills\` / \`list_agents\` / \`list_hooks\`\n- \`create_skill\` / \`update_skill\` / \`delete_skill\`\n- \`create_agent\` / \`update_agent\` / \`delete_agent\`\n\n## Prompts\n\n- \`setup-project\` / \`recommend-packs\` / \`audit-packs\` / \`search-marketplace\` / \`onboard-project\`\n\n## Installation\n\nBundled as a core plugin — installed by default.`,
  },
  'engine-rag': {
    display_name: 'RAG Engine', desc: 'Tree-sitter parsing, Tantivy search, SQLite memory.', tools: 22, language: 'Rust', repo: 'orchestra-mcp/plugin-engine-rag', color: '#dea584',
    readme: `# engine.rag\n\nRust-powered RAG engine with **22 MCP tools** for code parsing, full-text search, and semantic memory.\n\n## Services\n\n### Parse (Tree-sitter)\n- \`parse_file\` / \`get_symbols\` / \`get_imports\`\n- 14 language grammars: Go, Rust, TypeScript, Python, Java, and more\n\n### Search (Tantivy)\n- \`index_file\` / \`index_directory\` / \`search\` / \`search_symbols\`\n- .gitignore-aware bulk indexing\n\n### Memory (SQLite + Embeddings)\n- \`save_memory\` / \`search_memory\` / \`get_context\`\n- Cosine similarity vector search\n- Session-scoped observations\n\n## Performance\n\n| Operation | Speed |\n|-----------|-------|\n| Parse file | < 5ms |\n| Index 2,000 files | ~3s |\n| Full-text search | < 10ms |\n| Memory search (1K vectors) | < 50ms |\n\n## Installation\n\n\`\`\`bash\norchestra plugin install engine-rag\n\`\`\``,
  },
  'bridge-claude': {
    display_name: 'Claude Bridge', desc: 'Anthropic Claude integration with streaming support.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-claude', color: '#d97757',
    readme: `# bridge.claude\n\nAnthropic Claude integration with **5 MCP tools + streaming**.\n\n## Tools\n\n- \`ai_prompt\` — Send prompts to Claude (Opus, Sonnet, Haiku)\n- \`spawn_session\` — Start a Claude Code subprocess\n- \`kill_session\` / \`session_status\` / \`list_active\`\n\n## Spawn Modes\n\n- **Sync** — blocking, waits for result\n- **Async** — returns handle, poll via session_status\n- **Background** — fire and forget\n\n## Installation\n\n\`\`\`bash\norchestra plugin install bridge-claude\n\`\`\``,
  },
  'bridge-openai': {
    display_name: 'OpenAI Bridge', desc: 'GPT-4o + OpenAI-compatible providers.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-openai', color: '#10a37f',
    readme: `# bridge.openai\n\nOpenAI and compatible provider bridge with **5 MCP tools**.\n\n## Tools\n\n- \`ai_prompt\` / \`spawn_session\` / \`kill_session\` / \`session_status\` / \`list_active\`\n\n## Supported Providers\n\nAny OpenAI-compatible API:\n- **OpenAI** — GPT-4o, GPT-4o-mini\n- **DeepSeek** — via custom base URL\n- **Grok** — via custom base URL\n- **Qwen** — via custom base URL\n- **Perplexity** — via custom base URL\n\n## Installation\n\n\`\`\`bash\norchestra plugin install bridge-openai\n\`\`\``,
  },
  'bridge-gemini': {
    display_name: 'Gemini Bridge', desc: 'Google Gemini Pro and Flash models.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-gemini', color: '#4285f4',
    readme: `# bridge.gemini\n\nGoogle Gemini integration with **5 MCP tools**.\n\n## Models\n\n- Gemini Pro\n- Gemini Flash\n\n## Installation\n\n\`\`\`bash\norchestra plugin install bridge-gemini\n\`\`\``,
  },
  'bridge-ollama': {
    display_name: 'Ollama Bridge', desc: 'Local models — Llama, Mistral, CodeLlama.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-ollama', color: '#f8f8f8',
    readme: `# bridge.ollama\n\nLocal model bridge via Ollama with **5 MCP tools**.\n\n## Models\n\n- Llama 3, Mistral, CodeLlama, Phi, and any Ollama-supported model\n\n## Requirements\n\n- Ollama installed and running locally\n\n## Installation\n\n\`\`\`bash\norchestra plugin install bridge-ollama\n\`\`\``,
  },
  'bridge-firecrawl': {
    display_name: 'Firecrawl Bridge', desc: 'Web scraping and structured data extraction.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-firecrawl', color: '#ff6b35',
    readme: `# bridge.firecrawl\n\nFirecrawl web scraping bridge with **5 MCP tools**.\n\n## Capabilities\n\n- Scrape web pages to clean markdown\n- Extract structured data from pages\n- Crawl entire sites with depth control\n\n## Installation\n\n\`\`\`bash\norchestra plugin install bridge-firecrawl\n\`\`\``,
  },
  'agent-orchestrator': {
    display_name: 'Agent Orchestrator', desc: 'Multi-agent workflows, testing, provider comparison.', tools: 20, language: 'Go', repo: 'orchestra-mcp/plugin-agent-orchestrator', color: '#22c55e',
    readme: `# agent.orchestrator\n\nMulti-agent orchestration plugin with **20 MCP tools**.\n\n## Tools\n\n### Agent CRUD\n- \`define_agent\` / \`get_agent\` / \`list_agents\` / \`delete_agent\`\n\n### Workflow CRUD\n- \`define_workflow\` / \`get_workflow\` / \`list_workflows\` / \`delete_workflow\`\n\n### Execution\n- \`run_agent\` / \`run_workflow\` / \`get_run_status\` / \`list_runs\` / \`cancel_run\`\n\n### Testing\n- \`create_test_suite\` / \`run_test_suite\` / \`evaluate_response\` / \`compare_providers\`\n\n### Discovery\n- \`list_available_models\`\n\n## Installation\n\n\`\`\`bash\norchestra plugin install agent-orchestrator\n\`\`\``,
  },
  'tools-agentops': {
    display_name: 'AgentOps', desc: 'AI provider accounts, budgets, and usage tracking.', tools: 8, language: 'Go', repo: 'orchestra-mcp/plugin-tools-agentops', color: '#f59e0b',
    readme: `# tools.agentops\n\nAI provider account management with **8 MCP tools**.\n\n## Tools\n\n- \`create_account\` / \`list_accounts\` / \`get_account\` / \`remove_account\`\n- \`set_budget\` / \`check_budget\` / \`report_usage\` / \`get_account_env\`\n\n## Supported Providers\n\nClaude, OpenAI, Gemini, Ollama, Grok, Perplexity, DeepSeek, Qwen, Kimi, Firecrawl\n\n## Installation\n\n\`\`\`bash\norchestra plugin install tools-agentops\n\`\`\``,
  },
  'tools-sessions': {
    display_name: 'Sessions', desc: 'AI chat sessions with cross-provider dispatch.', tools: 6, language: 'Go', repo: 'orchestra-mcp/plugin-tools-sessions', color: '#8b5cf6',
    readme: `# tools.sessions\n\nAI chat session management with **6 MCP tools**.\n\n## Tools\n\n- \`create_session\` / \`list_sessions\` / \`get_session\` / \`delete_session\`\n- \`pause_session\` / \`send_message\`\n\n## send_message Flow\n\n1. Read session → 2. Get account env → 3. Check budget → 4. Spawn AI session → 5. Store turn → 6. Report usage → 7. Return\n\n## Installation\n\n\`\`\`bash\norchestra plugin install tools-sessions\n\`\`\``,
  },
  'tools-workspace': {
    display_name: 'Workspace', desc: 'Multi-workspace management with folder switching.', tools: 8, language: 'Go', repo: 'orchestra-mcp/plugin-tools-workspace', color: '#06b6d4',
    readme: `# tools.workspace\n\nWorkspace management with **8 MCP tools**.\n\n## Tools\n\n- \`list_workspaces\` / \`create_workspace\` / \`get_workspace\` / \`update_workspace\` / \`delete_workspace\`\n- \`switch_workspace\` / \`add_folder\` / \`remove_folder\`\n\n## Workspace Model\n\n- ID (WS-XXXX), name, folders[], primaryFolder\n- Stored globally at \`~/.orchestra/workspaces.json\`\n\n## Installation\n\n\`\`\`bash\norchestra plugin install tools-workspace\n\`\`\``,
  },
  'storage-markdown': {
    display_name: 'Markdown Storage', desc: 'YAML frontmatter + markdown persistence layer.', tools: 0, language: 'Go', repo: 'orchestra-mcp/plugin-storage-markdown', color: '#64748b',
    readme: `# storage.markdown\n\nThe storage backend for Orchestra. Persists all data as **Markdown files with YAML frontmatter**.\n\n## Features\n\n- Human-readable files in \`.projects/\`\n- YAML frontmatter for structured metadata\n- Git-native — all data is version-controlled\n- Portable — copy between machines\n\n## Storage Paths\n\n- \`.projects/<slug>/features/\` — FEAT-XXX.md\n- \`.projects/<slug>/plans/\` — PLAN-XXX.md\n- \`.projects/<slug>/requests/\` — REQ-XXX.md\n- \`.projects/.packs/registry.json\`\n\nBundled as a core plugin — installed by default.`,
  },
  'transport-stdio': {
    display_name: 'stdio Transport', desc: 'MCP stdio server for IDE communication.', tools: 0, language: 'Go', repo: 'orchestra-mcp/plugin-transport-stdio', color: '#64748b',
    readme: `# transport.stdio\n\nThe MCP stdio transport that connects Orchestra to your IDE.\n\n## How It Works\n\n- Reads JSON-RPC messages from stdin\n- Writes responses to stdout\n- Auto-detected by Claude Code, Cursor, VS Code, and 6 more IDEs\n- Configuration in \`.mcp.json\` (created by \`orchestra init\`)\n\n## Supported IDEs\n\nClaude Code, Cursor, VS Code, Cline, Windsurf, Codex, Gemini, Zed, Continue.dev\n\nBundled as a core plugin — installed by default.`,
  },
}

export default async function PluginDetailPage({ params }: PageProps) {
  const { slug } = await params
  const plugin = PLUGINS[slug]
  if (!plugin) {
    return <PluginDetailClient slug={slug} plugin={null} readme="" />
  }

  // Try GitHub first, fall back to seed README
  const githubReadme = await fetchReadme(plugin.repo)
  const readme = githubReadme ?? plugin.readme
  const isSeedReadme = githubReadme === null

  return (
    <PluginDetailClient
      slug={slug}
      plugin={plugin}
      readme={readme}
      isSeedReadme={isSeedReadme}
    />
  )
}
