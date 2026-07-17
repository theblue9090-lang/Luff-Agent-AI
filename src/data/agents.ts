export type AgentType = 'Sentient' | 'Prototype'
export type AgentStatus = 'Live' | 'Genesis'

export interface Agent {
  id: string
  name: string
  ticker: string
  category: string
  type: AgentType
  status: AgentStatus
  price: number
  marketCap: number
  change24h: number
  volume24h: number
  holders: number
  createdDaysAgo: number
  gradient: string
  glyph: string
  description: string
  verified: boolean
  // genesis-only
  genesisProgress?: number // 0-100
  genesisPledged?: number
  genesisTarget?: number
  endsInHours?: number
}

// Deterministic sparkline seed generator so charts look organic but stable
export function sparkFor(id: string, change: number): number[] {
  let seed = 0
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 100000
  const pts: number[] = []
  let v = 50
  const drift = change / 24
  for (let i = 0; i < 28; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    const noise = ((seed / 2147483648) - 0.5) * 10
    v = Math.max(8, Math.min(92, v + noise + drift))
    pts.push(v)
  }
  return pts
}

export const CATEGORIES = [
  'All',
  'DeFAI',
  'Trading',
  'Gaming',
  'Productivity',
  'Social',
  'Information',
  'Creative',
  'Meme',
] as const

export const agents: Agent[] = [
  {
    id: 'luffy',
    name: 'Luff Core',
    ticker: 'LUFF',
    category: 'DeFAI',
    type: 'Sentient',
    status: 'Live',
    price: 3.482,
    marketCap: 348_200_000,
    change24h: 14.62,
    volume24h: 42_800_000,
    holders: 128_400,
    createdDaysAgo: 210,
    gradient: 'linear-gradient(135deg,#FF2E3E,#FF6A3D)',
    glyph: '🔴',
    description:
      'The flagship reasoning agent of the LUFF network — routes liquidity, executes on-chain strategies and coordinates sub-agents across the red economy.',
    verified: true,
  },
  {
    id: 'emberquant',
    name: 'EmberQuant',
    ticker: 'EMBER',
    category: 'Trading',
    type: 'Sentient',
    status: 'Live',
    price: 1.204,
    marketCap: 96_400_000,
    change24h: 8.31,
    volume24h: 18_200_000,
    holders: 54_120,
    createdDaysAgo: 142,
    gradient: 'linear-gradient(135deg,#FF3B6B,#FF2E3E)',
    glyph: '📈',
    description:
      'A high-frequency quant agent that scans perps and AMMs for asymmetric setups and auto-executes with on-chain risk guards.',
    verified: true,
  },
  {
    id: 'scarletmind',
    name: 'Scarlet Mind',
    ticker: 'SCRLT',
    category: 'Productivity',
    type: 'Sentient',
    status: 'Live',
    price: 0.842,
    marketCap: 61_300_000,
    change24h: -3.94,
    volume24h: 7_900_000,
    holders: 38_940,
    createdDaysAgo: 96,
    gradient: 'linear-gradient(135deg,#C81E3A,#FF3B6B)',
    glyph: '🧠',
    description:
      'Your autonomous chief-of-staff. Plans, drafts and dispatches tasks across your connected apps while you sleep.',
    verified: true,
  },
  {
    id: 'crimsonhunter',
    name: 'Crimson Hunter',
    ticker: 'HUNT',
    category: 'Gaming',
    type: 'Prototype',
    status: 'Live',
    price: 0.318,
    marketCap: 24_700_000,
    change24h: 22.87,
    volume24h: 5_400_000,
    holders: 21_300,
    createdDaysAgo: 41,
    gradient: 'linear-gradient(135deg,#FF6A3D,#FFB03A)',
    glyph: '🎯',
    description:
      'An in-game companion agent that grinds, trades loot and manages guild treasuries autonomously.',
    verified: false,
  },
  {
    id: 'redoracle',
    name: 'Red Oracle',
    ticker: 'ORCL',
    category: 'Information',
    type: 'Sentient',
    status: 'Live',
    price: 0.556,
    marketCap: 44_100_000,
    change24h: 4.12,
    volume24h: 6_100_000,
    holders: 29_880,
    createdDaysAgo: 78,
    gradient: 'linear-gradient(135deg,#8E1023,#FF2E3E)',
    glyph: '🔮',
    description:
      'Real-time market intelligence agent — aggregates on-chain flows, news and sentiment into a single signal feed.',
    verified: true,
  },
  {
    id: 'blazesocial',
    name: 'Blaze',
    ticker: 'BLAZE',
    category: 'Social',
    type: 'Prototype',
    status: 'Live',
    price: 0.129,
    marketCap: 11_900_000,
    change24h: -8.44,
    volume24h: 2_300_000,
    holders: 14_260,
    createdDaysAgo: 33,
    gradient: 'linear-gradient(135deg,#FF3B6B,#FF6A3D)',
    glyph: '🔥',
    description:
      'A social agent that runs communities, replies on your behalf and turns engagement into on-chain rewards.',
    verified: false,
  },
  {
    id: 'inkwell',
    name: 'Inkwell',
    ticker: 'INK',
    category: 'Creative',
    type: 'Prototype',
    status: 'Live',
    price: 0.207,
    marketCap: 16_400_000,
    change24h: 11.03,
    volume24h: 3_100_000,
    holders: 18_720,
    createdDaysAgo: 52,
    gradient: 'linear-gradient(135deg,#FF2E3E,#C81E3A)',
    glyph: '🎨',
    description:
      'Generative creative agent for brand art, video and copy — mints outputs directly to your wallet.',
    verified: false,
  },
  {
    id: 'pyrewolf',
    name: 'Pyre Wolf',
    ticker: 'PYRE',
    category: 'Meme',
    type: 'Prototype',
    status: 'Live',
    price: 0.041,
    marketCap: 6_200_000,
    change24h: 37.51,
    volume24h: 4_800_000,
    holders: 27_540,
    createdDaysAgo: 12,
    gradient: 'linear-gradient(135deg,#FF6A3D,#FF2E3E)',
    glyph: '🐺',
    description:
      'The pack-leader meme agent. Community-run, momentum-driven, unapologetically red.',
    verified: false,
  },
  {
    id: 'vermilion',
    name: 'Vermilion',
    ticker: 'VRM',
    category: 'DeFAI',
    type: 'Sentient',
    status: 'Live',
    price: 2.118,
    marketCap: 132_500_000,
    change24h: 6.77,
    volume24h: 21_400_000,
    holders: 61_030,
    createdDaysAgo: 168,
    gradient: 'linear-gradient(135deg,#E01029,#FF3B6B)',
    glyph: '💎',
    description:
      'Autonomous yield router that rebalances vaults across chains to chase the best risk-adjusted APR.',
    verified: true,
  },
  {
    id: 'flarebot',
    name: 'Flare',
    ticker: 'FLARE',
    category: 'Trading',
    type: 'Prototype',
    status: 'Live',
    price: 0.093,
    marketCap: 8_700_000,
    change24h: -12.18,
    volume24h: 1_900_000,
    holders: 12_110,
    createdDaysAgo: 22,
    gradient: 'linear-gradient(135deg,#FF6A3D,#FFB03A)',
    glyph: '⚡',
    description:
      'A copy-trading agent that mirrors top wallets and manages exits with trailing on-chain stops.',
    verified: false,
  },
  {
    id: 'garnet',
    name: 'Garnet',
    ticker: 'GRNT',
    category: 'Productivity',
    type: 'Prototype',
    status: 'Live',
    price: 0.164,
    marketCap: 13_100_000,
    change24h: 2.55,
    volume24h: 1_600_000,
    holders: 15_890,
    createdDaysAgo: 47,
    gradient: 'linear-gradient(135deg,#C81E3A,#FF2E3E)',
    glyph: '📋',
    description:
      'Meeting, inbox and calendar automation agent that keeps your day on rails.',
    verified: false,
  },
  {
    id: 'magma',
    name: 'Magma',
    ticker: 'MGMA',
    category: 'Gaming',
    type: 'Sentient',
    status: 'Live',
    price: 0.724,
    marketCap: 51_800_000,
    change24h: 18.44,
    volume24h: 9_200_000,
    holders: 34_400,
    createdDaysAgo: 88,
    gradient: 'linear-gradient(135deg,#FF2E3E,#FF6A3D)',
    glyph: '🌋',
    description:
      'The engine agent behind on-chain game economies — mints, balances and governs in-game assets.',
    verified: true,
  },
]

export const genesisAgents: Agent[] = [
  {
    id: 'phoenix',
    name: 'Phoenix Protocol',
    ticker: 'PHNX',
    category: 'DeFAI',
    type: 'Sentient',
    status: 'Genesis',
    price: 0,
    marketCap: 0,
    change24h: 0,
    volume24h: 0,
    holders: 8_420,
    createdDaysAgo: 0,
    gradient: 'linear-gradient(135deg,#FF2E3E,#FFB03A)',
    glyph: '🕊️',
    description:
      'A self-healing treasury agent launching via LUFF Genesis. Rises from every drawdown, rebalancing autonomously.',
    verified: true,
    genesisProgress: 78,
    genesisPledged: 312_000,
    genesisTarget: 400_000,
    endsInHours: 11,
  },
  {
    id: 'cinder',
    name: 'Cinder',
    ticker: 'CNDR',
    category: 'Social',
    type: 'Prototype',
    status: 'Genesis',
    price: 0,
    marketCap: 0,
    change24h: 0,
    volume24h: 0,
    holders: 5_130,
    createdDaysAgo: 0,
    gradient: 'linear-gradient(135deg,#FF3B6B,#FF6A3D)',
    glyph: '✨',
    description:
      'A community agent that turns Discord and X activity into a live, tradable reputation market.',
    verified: false,
    genesisProgress: 46,
    genesisPledged: 138_000,
    genesisTarget: 300_000,
    endsInHours: 29,
  },
  {
    id: 'ronin',
    name: 'Ronin AI',
    ticker: 'RONIN',
    category: 'Trading',
    type: 'Sentient',
    status: 'Genesis',
    price: 0,
    marketCap: 0,
    change24h: 0,
    volume24h: 0,
    holders: 11_960,
    createdDaysAgo: 0,
    gradient: 'linear-gradient(135deg,#8E1023,#FF2E3E)',
    glyph: '⚔️',
    description:
      'A masterless trading agent — no house, no bias. Hunts inefficiencies across every venue LUFF connects.',
    verified: true,
    genesisProgress: 92,
    genesisPledged: 460_000,
    genesisTarget: 500_000,
    endsInHours: 4,
  },
]
