// ─── Brand: FERRO ─────────────────────────────────────────
// Local AI forged on metal. Ironclad intelligence.

// ─── Design Tokens ────────────────────────────────────────
export const COLORS = {
  void: '#0c0a09',        // warm deep charcoal bg
  surface: '#161412',      // card bg
  surfaceHover: '#1c1a17', // card hover
  border: '#2a2522',       // borders
  borderHover: '#3d3630',  // border hover
  amber: '#c9a96e',        // primary accent
  amberBright: '#e8c78a',  // bright accent
  cream: '#e8e2d9',        // primary text
  creamMuted: '#9c948a',   // secondary text
  copper: '#8b7355',       // tertiary
  green: '#7cb87c',        // success
  greenBg: '#1a2f1a',      // success bg
  red: '#c47070',          // danger
  redBg: '#2f1a1a',        // danger bg
  gold: '#d4a853',         // highlight
};

// ─── Hardware Config ──────────────────────────────────────

export interface ChipOption {
  id: string;
  name: string;
  cpuCores: number;
  cpuCoresUpgraded: number;
  gpuCores: number;
  gpuCoresUpgraded: number;
  neuralCores: number;
  neuralCoresUpgraded: number;
  memoryBandwidth: string;
  memoryBandwidthUpgraded: string;
  basePrice: number;
  cpuUpgradePrice: number;
  baseMemoryGB: number;
  maxMemoryGB: number;
  memoryOptions: number[];
  memoryUpgradePrices: Record<number, number>;
  baseStorageGB: number;
  maxStorageGB: number;
  storageOptions: number[];
  storageUpgradePrices: Record<number, number>;
}

export const CHIPS: ChipOption[] = [
  {
    id: 'm4-max',
    name: 'Apple M4 Max',
    cpuCores: 14, cpuCoresUpgraded: 16,
    gpuCores: 32, gpuCoresUpgraded: 40,
    neuralCores: 16, neuralCoresUpgraded: 16,
    memoryBandwidth: '410 GB/s', memoryBandwidthUpgraded: '546 GB/s',
    basePrice: 1999, cpuUpgradePrice: 200,
    baseMemoryGB: 36, maxMemoryGB: 128,
    memoryOptions: [36, 48, 64, 128],
    memoryUpgradePrices: { 36: 0, 48: 0, 64: 200, 128: 1000 },
    baseStorageGB: 512, maxStorageGB: 8192,
    storageOptions: [512, 1024, 2048, 4096, 8192],
    storageUpgradePrices: { 512: 0, 1024: 200, 2048: 600, 4096: 1200, 8192: 2400 },
  },
  {
    id: 'm3-ultra',
    name: 'Apple M3 Ultra',
    cpuCores: 28, cpuCoresUpgraded: 32,
    gpuCores: 60, gpuCoresUpgraded: 80,
    neuralCores: 32, neuralCoresUpgraded: 32,
    memoryBandwidth: '819 GB/s', memoryBandwidthUpgraded: '819 GB/s',
    basePrice: 3999, cpuUpgradePrice: 1600,
    baseMemoryGB: 96, maxMemoryGB: 512,
    memoryOptions: [96, 256, 512],
    memoryUpgradePrices: { 96: 0, 256: 1600, 512: 3200 },
    baseStorageGB: 1024, maxStorageGB: 16384,
    storageOptions: [1024, 2048, 4096, 8192, 16384],
    storageUpgradePrices: { 1024: 0, 2048: 200, 4096: 600, 8192: 1400, 16384: 3400 },
  },
];

// ─── AI Models ────────────────────────────────────────────

export type ModelCategory = 'all' | 'coding' | 'thinking' | 'chat';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  params: number;
  vramRequired: number;
  category: ModelCategory[];
  description: string;
  source: 'huggingface' | 'ollama';
  url: string;
  tags: string[];
  contextWindow: number;
  inferenceSpeedFactor: number;
}

export function estimateTokensPerSecond(
  modelParams: number,
  memoryBandwidthGBps: number,
  gpuCores: number
): number {
  const baseSpeed = (memoryBandwidthGBps / 410) * 30 * (gpuCores / 32);
  const scalingFactor = Math.sqrt(7 / modelParams);
  return Math.round(baseSpeed * scalingFactor * 10) / 10;
}

export function getInferenceTiming(tps: number): { label: string; color: string } {
  if (tps >= 20) return { label: `${tps} tok/s — Instant`, color: '#7cb87c' };
  if (tps >= 10) return { label: `${tps} tok/s — Fast`, color: '#a3d4a3' };
  if (tps >= 5) return { label: `${tps} tok/s — Good`, color: '#d4a853' };
  if (tps >= 2) return { label: `${tps} tok/s — Moderate`, color: '#c9a96e' };
  return { label: `${tps} tok/s — Slow`, color: '#c47070' };
}

// ─── ALL MODELS: 7B to 1T params ──────────────────────────

export const ALL_MODELS: AIModel[] = [
  // ===== SMALL: 7-20B / 6-20GB VRAM =====
  {
    id: 'phi4-14b', name: 'Phi-4 14B', provider: 'Microsoft',
    params: 14, vramRequired: 10, category: ['chat', 'coding'],
    description: 'Small but mighty with exceptional reasoning per parameter.',
    source: 'ollama', url: 'https://ollama.com/library/phi4:14b',
    tags: ['efficient', 'reasoning'], contextWindow: 16384, inferenceSpeedFactor: 0.71,
  },
  {
    id: 'gemma2-27b', name: 'Gemma 2 27B', provider: 'Google',
    params: 27, vramRequired: 18, category: ['chat'],
    description: 'Open model with strong general task performance.',
    source: 'ollama', url: 'https://ollama.com/library/gemma2:27b',
    tags: ['open', 'multilingual'], contextWindow: 8192, inferenceSpeedFactor: 0.51,
  },
  {
    id: 'qwen2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba',
    params: 32, vramRequired: 20, category: ['coding'],
    description: 'Matches GPT-4o on coding. 92 languages. The local coding champion.',
    source: 'ollama', url: 'https://ollama.com/library/qwen2.5-coder:32b',
    tags: ['code', 'gpt-4o-class'], contextWindow: 128000, inferenceSpeedFactor: 0.47,
  },
  {
    id: 'qwq-32b', name: 'QwQ 32B', provider: 'Alibaba',
    params: 32, vramRequired: 20, category: ['thinking'],
    description: 'Deep chain-of-thought reasoning for complex problem solving.',
    source: 'ollama', url: 'https://ollama.com/library/qwq',
    tags: ['reasoning', 'cot'], contextWindow: 32768, inferenceSpeedFactor: 0.47,
  },

  // ===== MEDIUM: 34-80B / 22-80GB VRAM =====
  {
    id: 'yi-34b', name: 'Yi 34B', provider: '01.AI',
    params: 34, vramRequired: 22, category: ['chat'],
    description: 'Strong bilingual Chinese and English capabilities.',
    source: 'ollama', url: 'https://ollama.com/library/yi:34b',
    tags: ['bilingual', 'chinese'], contextWindow: 32000, inferenceSpeedFactor: 0.45,
  },
  {
    id: 'qwen2.5-72b', name: 'Qwen 2.5 72B', provider: 'Alibaba',
    params: 72, vramRequired: 48, category: ['thinking', 'chat'],
    description: 'Advanced LLM with strong reasoning, mathematics, multilingual.',
    source: 'ollama', url: 'https://ollama.com/library/qwen2.5:72b',
    tags: ['reasoning', 'multilingual', 'math'], contextWindow: 128000, inferenceSpeedFactor: 0.31,
  },
  {
    id: 'llama3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta',
    params: 70, vramRequired: 44, category: ['chat', 'thinking'],
    description: "Meta's most capable open model, multilingual and reasoning.",
    source: 'ollama', url: 'https://ollama.com/library/llama3.3:70b',
    tags: ['multilingual', 'general'], contextWindow: 128000, inferenceSpeedFactor: 0.32,
  },
  {
    id: 'codellama-70b', name: 'CodeLlama 70B', provider: 'Meta',
    params: 70, vramRequired: 44, category: ['coding'],
    description: 'Specialized code model for generation and completion.',
    source: 'ollama', url: 'https://ollama.com/library/codellama:70b',
    tags: ['code', 'infilling'], contextWindow: 16384, inferenceSpeedFactor: 0.32,
  },
  {
    id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'DeepSeek',
    params: 236, vramRequired: 80, category: ['coding'],
    description: '236B MoE code model. Exceptional at coding, 338+ languages.',
    source: 'ollama', url: 'https://ollama.com/library/deepseek-coder-v2:236b',
    tags: ['moe', 'code', 'frontier'], contextWindow: 128000, inferenceSpeedFactor: 0.17,
  },

  // ===== LARGE: 80-180B / 64-160GB VRAM =====
  {
    id: 'command-r-104b', name: 'Command R+ 104B', provider: 'Cohere',
    params: 104, vramRequired: 80, category: ['thinking', 'chat'],
    description: 'Enterprise model with tool use and retrieval capabilities.',
    source: 'ollama', url: 'https://ollama.com/library/command-r-plus:104b',
    tags: ['enterprise', 'rag', 'tools'], contextWindow: 128000, inferenceSpeedFactor: 0.26,
  },
  {
    id: 'mistral-large-123b', name: 'Mistral Large 2', provider: 'Mistral AI',
    params: 123, vramRequired: 100, category: ['thinking', 'chat'],
    description: 'Flagship model with top-tier reasoning and code generation.',
    source: 'ollama', url: 'https://ollama.com/library/mistral-large:123b',
    tags: ['reasoning', 'code', 'agents'], contextWindow: 128000, inferenceSpeedFactor: 0.22,
  },
  {
    id: 'mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'Mistral AI',
    params: 176, vramRequired: 120, category: ['thinking', 'chat'],
    description: 'Sparse MoE with strong reasoning and efficiency.',
    source: 'ollama', url: 'https://ollama.com/library/mixtral:8x22b',
    tags: ['moe', 'efficient'], contextWindow: 64000, inferenceSpeedFactor: 0.15,
  },
  {
    id: 'falcon-180b', name: 'Falcon 180B', provider: 'TII',
    params: 180, vramRequired: 140, category: ['chat', 'thinking'],
    description: 'One of the largest dense open models, powerful general reasoning.',
    source: 'huggingface', url: 'https://huggingface.co/tiiuae/falcon-180B',
    tags: ['frontier', 'dense'], contextWindow: 8192, inferenceSpeedFactor: 0.12,
  },

  // ===== FRONTIER: 320-900GB VRAM =====
  {
    id: 'llama3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta',
    params: 405, vramRequired: 320, category: ['thinking', 'chat'],
    description: "Meta's largest open model — frontier-class reasoning and knowledge.",
    source: 'ollama', url: 'https://ollama.com/library/llama3.1:405b',
    tags: ['frontier', 'open', 'knowledge'], contextWindow: 128000, inferenceSpeedFactor: 0.06,
  },
  {
    id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek',
    params: 671, vramRequired: 360, category: ['thinking', 'chat', 'coding'],
    description: '671B MoE frontier model. Rivaling GPT-4 and Claude 3 Opus.',
    source: 'ollama', url: 'https://ollama.com/library/deepseek-v3',
    tags: ['frontier', 'moe', 'gpt-4-class'], contextWindow: 64000, inferenceSpeedFactor: 0.05,
  },
  {
    id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek',
    params: 671, vramRequired: 380, category: ['thinking'],
    description: '671B reasoning model. Chain-of-thought rivaling o1. 131GB quantized.',
    source: 'ollama', url: 'https://ollama.com/library/deepseek-r1',
    tags: ['frontier', 'reasoning', 'o1-class'], contextWindow: 128000, inferenceSpeedFactor: 0.04,
  },
  {
    id: 'kimi-k2.6', name: 'Kimi K2.6', provider: 'Moonshot AI',
    params: 1000, vramRequired: 584, category: ['thinking', 'chat', 'coding'],
    description: '1T MoE, 32B active, 256K ctx. INT4 QAT native. SOTA coding + agentic swarm. The frontier.',
    source: 'huggingface', url: 'https://huggingface.co/moonshotai/Kimi-K2.6',
    tags: ['frontier', '1t', 'sota', 'agentic'], contextWindow: 256000, inferenceSpeedFactor: 0.03,
  },
  {
    id: 'glm-5.1', name: 'GLM-5.1', provider: 'Zhipu AI',
    params: 72, vramRequired: 48, category: ['coding', 'thinking'],
    description: 'Benchmarks higher than Claude Sonnet for code generation. Top local coding pick.',
    source: 'huggingface', url: 'https://huggingface.co/THUDM/glm-5-32b',
    tags: ['code', 'sonnet-class', 'reasoning'], contextWindow: 128000, inferenceSpeedFactor: 0.31,
  },
  {
    id: 'qwen3.5-27b', name: 'Qwen 3.5-27B', provider: 'Alibaba',
    params: 27, vramRequired: 18, category: ['coding', 'chat'],
    description: 'Sweet spot for local use. Multi-file refactors, production-quality code on consumer hardware.',
    source: 'ollama', url: 'https://ollama.com/library/qwen3.5:27b',
    tags: ['code', 'efficient', 'consumer-friendly'], contextWindow: 128000, inferenceSpeedFactor: 0.51,
  },
];

// ─── Dynamic Cloud Equivalents ────────────────────────────

export interface CloudTier {
  maxVram: number;
  cloudName: string;
  cloudProvider: string;
  cloudPriceMonthly: number;
  description: string;
}

const CLOUD_TIERS: CloudTier[] = [
  { maxVram: 20, cloudName: 'GPT-4o-mini / Gemini Flash', cloudProvider: 'OpenAI / Google', cloudPriceMonthly: 20, description: 'Compact cloud models' },
  { maxVram: 48, cloudName: 'GPT-4o / Claude 3.5 Sonnet', cloudProvider: 'OpenAI / Anthropic', cloudPriceMonthly: 50, description: 'Standard cloud models' },
  { maxVram: 80, cloudName: 'Claude 3.5 Sonnet / GPT-4 Turbo', cloudProvider: 'Anthropic / OpenAI', cloudPriceMonthly: 100, description: 'Advanced cloud models' },
  { maxVram: 128, cloudName: 'Claude 3 Opus / GPT-4 Turbo', cloudProvider: 'Anthropic / OpenAI', cloudPriceMonthly: 200, description: 'Premium cloud models' },
  { maxVram: 256, cloudName: 'o1-preview / Claude 3 Opus', cloudProvider: 'OpenAI / Anthropic', cloudPriceMonthly: 400, description: 'Frontier reasoning models' },
  { maxVram: 480, cloudName: 'o1 / GPT-4 Enterprise', cloudProvider: 'OpenAI', cloudPriceMonthly: 800, description: 'Enterprise frontier' },
  { maxVram: Infinity, cloudName: 'Full GPT-4 Enterprise + Claude 3 Opus + o1', cloudProvider: 'Microsoft / OpenAI / Anthropic', cloudPriceMonthly: 2000, description: 'Full enterprise deployment' },
];

export function getCloudTierForVram(vramGB: number): CloudTier {
  for (const tier of CLOUD_TIERS) {
    if (vramGB <= tier.maxVram) return tier;
  }
  return CLOUD_TIERS[CLOUD_TIERS.length - 1];
}

export function getModelCloudEquivalent(model: AIModel): { name: string; provider: string; price: string } {
  const tier = getCloudTierForVram(model.vramRequired);

  // Coding-specific overrides
  if (model.id.includes('coder')) {
    if (model.params >= 200) return { name: 'Copilot Enterprise + GPT-4', provider: 'GitHub / OpenAI', price: '$60/mo' };
    if (model.params >= 60) return { name: 'Copilot Pro / Cursor Pro', provider: 'GitHub / Cursor', price: '$40/mo' };
    return { name: 'GitHub Copilot', provider: 'GitHub', price: '$20/mo' };
  }
  // Reasoning overrides
  if (model.category.includes('thinking')) {
    if (model.params >= 600) return { name: 'o1 Pro / Claude 3 Opus', provider: 'OpenAI / Anthropic', price: '$400/mo' };
    if (model.params >= 400) return { name: 'o1 / Claude 3 Opus', provider: 'OpenAI / Anthropic', price: '$200/mo' };
    if (model.params >= 100) return { name: 'o1-preview / Claude 3 Opus', provider: 'OpenAI / Anthropic', price: '$200/mo' };
    return { name: 'o1-mini / Claude 3.5', provider: 'OpenAI / Anthropic', price: '$50/mo' };
  }
  // Enterprise
  if (model.id.includes('command')) {
    return { name: 'Azure OpenAI Enterprise', provider: 'Microsoft', price: '$500/mo' };
  }
  // Kimi K2.6 — frontier
  if (model.id.includes('kimi')) {
    return { name: 'o1 Pro + Claude 3 Opus + GPT-4 Enterprise', provider: 'OpenAI / Anthropic', price: '$800/mo' };
  }

  return { name: tier.cloudName, provider: tier.cloudProvider, price: `$${tier.cloudPriceMonthly}/mo` };
}

export function getClusterCloudReplacement(totalVram: number): {
  tier: CloudTier;
  replaces: string;
  monthlySavings: number;
  modelsUnlocked: number;
} {
  const tier = getCloudTierForVram(totalVram);
  const compatibleCount = ALL_MODELS.filter((m) => m.vramRequired <= totalVram).length;

  let replaces: string;
  if (totalVram >= 480) {
    replaces = 'Claude 3 Opus + GPT-4 Enterprise + o1 Pro — Full frontier suite';
  } else if (totalVram >= 360) {
    replaces = 'GPT-4 Enterprise + Claude 3 Opus + o1';
  } else if (totalVram >= 256) {
    replaces = 'o1-preview + Claude 3 Opus + GPT-4';
  } else if (totalVram >= 128) {
    replaces = 'GPT-4 + Claude 3 Opus';
  } else if (totalVram >= 80) {
    replaces = 'Claude 3.5 Sonnet + GPT-4o';
  } else if (totalVram >= 48) {
    replaces = 'GPT-4o / Claude 3.5 Sonnet';
  } else {
    replaces = 'GPT-4o-mini / Gemini Flash';
  }

  return { tier, replaces, monthlySavings: tier.cloudPriceMonthly, modelsUnlocked: compatibleCount };
}

// ─── Helpers ──────────────────────────────────────────────

export function formatPrice(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function formatStorage(n: number): string {
  return n >= 1024 ? `${n / 1024}TB` : `${n}GB`;
}

export function formatMemory(n: number): string {
  if (n >= 1024) {
    const tb = n / 1024;
    return `${Math.round(tb * 10) / 10}TB`;
  }
  return `${n}GB`;
}

export function parseBandwidth(bandwidthStr: string): number {
  return parseFloat(bandwidthStr);
}

export function getCurrentCores(chip: ChipOption, cpuUpgraded: boolean): { cpu: number; gpu: number; neural: number } {
  return {
    cpu: cpuUpgraded ? chip.cpuCoresUpgraded : chip.cpuCores,
    gpu: cpuUpgraded ? chip.gpuCoresUpgraded : chip.gpuCores,
    neural: cpuUpgraded ? chip.neuralCoresUpgraded : chip.neuralCores,
  };
}

export function calculateAvailableVRAM(memoryGB: number): number {
  return Math.floor(memoryGB * 0.88);
}

export function calculateTotalPrice(
  chip: ChipOption,
  cpuUpgraded: boolean,
  memoryGB: number,
  storageGB: number,
  unitCount: number
): number {
  const cpuUpgradeCost = cpuUpgraded ? chip.cpuUpgradePrice : 0;
  const memoryUpgradeCost = chip.memoryUpgradePrices[memoryGB] ?? 0;
  const storageUpgradeCost = chip.storageUpgradePrices[storageGB] ?? 0;
  const unitPrice = chip.basePrice + cpuUpgradeCost + memoryUpgradeCost + storageUpgradeCost;
  return unitPrice * unitCount;
}
