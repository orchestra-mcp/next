export type AIProviderID =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'deepseek'
  | 'perplexity'
  | 'grok'
  | 'kimi'
  | 'qwen'
  | 'fireworks'
  | 'openrouter'
  | 'ollama'
  | 'lmstudio'
  | 'custom';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderID;
  providerName?: string;
  description?: string;
  icon?: string;
  /** false for local providers like Ollama / LM Studio */
  requiresKey?: boolean;
  /** whether the provider is configured (has API key or is local) */
  configured?: boolean;
  isLocal?: boolean;
}

export type ChatMode = 'auto' | 'plan' | 'manual';

export const CHAT_MODES: { id: ChatMode; label: string; description: string }[] = [
  { id: 'auto', label: 'Auto', description: 'AI decides when to plan or act' },
  { id: 'plan', label: 'Plan', description: 'AI creates a plan before acting' },
  { id: 'manual', label: 'Manual', description: 'You control each step' },
];

/** Default Anthropic-only models shown before the backend responds. */
export const DEFAULT_MODELS: AIModel[] = [
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'anthropic' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'anthropic' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic' },
];

/** All known models across every provider — used as reference / type registry. */
export const ALL_KNOWN_MODELS: AIModel[] = [
  // Anthropic
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'anthropic' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'anthropic' },
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic' },
  // OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', requiresKey: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'openai', requiresKey: true },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', requiresKey: true },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini', provider: 'openai', requiresKey: true },
  { id: 'o3', name: 'o3', provider: 'openai', requiresKey: true },
  { id: 'o4-mini', name: 'o4-mini', provider: 'openai', requiresKey: true },
  // Google
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', requiresKey: true },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', requiresKey: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', requiresKey: true },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', provider: 'google', requiresKey: true },
  // DeepSeek
  { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)', provider: 'deepseek', requiresKey: true },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek', requiresKey: true },
  // Perplexity
  { id: 'sonar-pro', name: 'Sonar Pro', provider: 'perplexity', requiresKey: true },
  { id: 'sonar', name: 'Sonar', provider: 'perplexity', requiresKey: true },
  { id: 'sonar-reasoning-pro', name: 'Sonar Reasoning Pro', provider: 'perplexity', requiresKey: true },
  // Grok (xAI)
  { id: 'grok-3', name: 'Grok 3', provider: 'grok', requiresKey: true },
  { id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'grok', requiresKey: true },
  { id: 'grok-2', name: 'Grok 2', provider: 'grok', requiresKey: true },
  // Kimi (Moonshot AI)
  { id: 'moonshot-v1-128k', name: 'Kimi 128k', provider: 'kimi', requiresKey: true },
  { id: 'moonshot-v1-32k', name: 'Kimi 32k', provider: 'kimi', requiresKey: true },
  { id: 'moonshot-v1-8k', name: 'Kimi 8k', provider: 'kimi', requiresKey: true },
  // Qwen (Alibaba)
  { id: 'qwen-turbo', name: 'Qwen Turbo', provider: 'qwen', requiresKey: true },
  { id: 'qwen-plus', name: 'Qwen Plus', provider: 'qwen', requiresKey: true },
  { id: 'qwen-max', name: 'Qwen Max', provider: 'qwen', requiresKey: true },
  { id: 'qwq-32b', name: 'QwQ 32B (Reasoning)', provider: 'qwen', requiresKey: true },
  // Fireworks AI
  { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', name: 'Llama 3.3 70B', provider: 'fireworks', requiresKey: true },
  { id: 'accounts/fireworks/models/deepseek-r1', name: 'DeepSeek R1 (Fireworks)', provider: 'fireworks', requiresKey: true },
  { id: 'accounts/fireworks/models/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', provider: 'fireworks', requiresKey: true },
  // OpenRouter
  { id: 'openrouter/auto', name: 'Auto (OpenRouter)', provider: 'openrouter', requiresKey: true },
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4 (via OR)', provider: 'openrouter', requiresKey: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o (via OR)', provider: 'openrouter', requiresKey: true },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro (via OR)', provider: 'openrouter', requiresKey: true },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (via OR)', provider: 'openrouter', requiresKey: true },
  // Ollama (local)
  { id: 'ollama/llama3.2', name: 'Llama 3.2 (local)', provider: 'ollama', requiresKey: false, isLocal: true },
  { id: 'ollama/llama3.1', name: 'Llama 3.1 (local)', provider: 'ollama', requiresKey: false, isLocal: true },
  { id: 'ollama/deepseek-r1', name: 'DeepSeek R1 (local)', provider: 'ollama', requiresKey: false, isLocal: true },
  { id: 'ollama/qwen2.5', name: 'Qwen 2.5 (local)', provider: 'ollama', requiresKey: false, isLocal: true },
  { id: 'ollama/phi4', name: 'Phi-4 (local)', provider: 'ollama', requiresKey: false, isLocal: true },
  { id: 'ollama/mistral', name: 'Mistral (local)', provider: 'ollama', requiresKey: false, isLocal: true },
  // LM Studio (local)
  { id: 'lmstudio/local', name: 'Current model in LM Studio', provider: 'lmstudio', requiresKey: false, isLocal: true },
];
