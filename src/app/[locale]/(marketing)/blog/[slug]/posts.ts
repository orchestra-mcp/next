export const posts: Record<string, { title: string; date: string; readTime: string; tag: string; author: string; content: string[] }> = {
  'introducing-orchestra': {
    title: 'Introducing Orchestra: The AI-native IDE',
    date: 'February 27, 2026', readTime: '5 min read', tag: 'Announcement', author: 'Orchestra Team',
    content: [
      "We built Orchestra to solve a problem every AI developer faces: fragmentation. You have Claude in one window, a project tracker in another, a vector database running somewhere, and a dozen CLI tools that don't talk to each other.",
      "Orchestra is a unified plugin backbone that connects all of these together. 131 AI tools, callable via the MCP protocol from any AI client — Claude, Cursor, VS Code, Gemini, whatever you use.",
      "The core of Orchestra is a QUIC + Protobuf mesh. Every plugin — whether it's written in Go, Rust, Swift, Kotlin, or C# — connects to the orchestrator over QUIC with mTLS. Sub-millisecond latency, persistent connections, zero polling.",
      "We're launching with 16 plugins and 17 official packs. Packs let you install curated collections of skills, agents, and hooks with a single command. The marketplace will grow over time as the community builds more.",
      "Orchestra targets 5 platforms: macOS (Swift + WidgetKit), Windows (C# + WinUI 3), Linux (Vala + GTK4), Chrome Extension (Manifest V3), and mobile (iOS + Android). One backend, five native clients.",
      "Start free. Download Orchestra, run orchestra serve, and connect your AI client. We'll handle the rest.",
    ],
  },
  'rag-memory-engine': {
    title: 'How our RAG Memory Engine works',
    date: 'February 26, 2026', readTime: '8 min read', tag: 'Engineering', author: 'Orchestra Team',
    content: [
      "The engine.rag plugin is our first Rust plugin. It provides 22 MCP tools across four services: health, parse (Tree-sitter), search (Tantivy), and memory (SQLite + cosine similarity).",
      "For full-text search, we use Tantivy — a Rust search library similar to Apache Lucene. It handles our code indexing pipeline, supporting 14 language grammars via Tree-sitter for structured symbol extraction.",
      "Vector search uses SQLite with brute-force cosine similarity. For most codebases (under 10k vectors), this is fast enough and requires zero infrastructure. We plan a LanceDB upgrade for Phase 2 when scale demands it.",
      "The index_directory tool is one of our most powerful: it walks your codebase respecting .gitignore rules, batches Tantivy commits for performance, and indexes everything in seconds.",
      "Session-scoped observations let you attach structured notes to your work: understanding, decision, pattern, issue, insight. These become searchable memory that persists across agent sessions.",
      "The Rust plugin connects to the orchestrator over QUIC using the quinn crate — the same protocol all Go plugins use, just implemented in Rust. Protocol compatibility was a hard requirement from day one.",
    ],
  },
  'multi-agent-orchestration': {
    title: 'Multi-agent orchestration with Orchestra',
    date: 'February 25, 2026', readTime: '6 min read', tag: 'Tutorial', author: 'Orchestra Team',
    content: [
      "The agent.orchestrator plugin gives you 20 tools for defining agents, building workflows, and running them across any AI provider.",
      "Start by defining an agent. Give it a name, a provider (claude, openai, gemini, ollama, deepseek, etc.), and a system instruction.",
      "Workflows chain agents together. Sequential workflows pass output of each step as input to the next. Parallel workflows run all steps simultaneously.",
      "Every workflow run gets a RUN-{uuid} ID. Poll get_run_status to check progress, or pass wait=true to block until completion.",
      "The testing kit (6 tools) lets you write test suites for your agents with contains, not_contains, regex, and min_length assertions.",
      "Provider routing is automatic. Define accounts in tools.agentops with your API keys, and the orchestrator routes to the right bridge plugin.",
    ],
  },
}
