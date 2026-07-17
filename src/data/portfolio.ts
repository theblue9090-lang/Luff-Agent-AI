export interface Holding {
  id: string
  symbol: string
  name: string
  glyph: string
  gradient: string
  amount: number
  avgPrice: number
  price: number
  change24h: number
}

// Demo holdings — live-updating prices simulate a real-time portfolio.
export const holdingsSeed: Holding[] = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    glyph: '◎',
    gradient: 'linear-gradient(135deg,#9945FF,#14F195)',
    amount: 12.5,
    avgPrice: 142.3,
    price: 168.42,
    change24h: 4.2,
  },
  {
    id: 'luff',
    symbol: 'LUFF',
    name: 'Luff Core',
    glyph: '🔴',
    gradient: 'linear-gradient(135deg,#FF2E3E,#FF6A3D)',
    amount: 820,
    avgPrice: 2.9,
    price: 3.48,
    change24h: 14.6,
  },
  {
    id: 'luffy',
    symbol: 'LUFFY',
    name: 'Luffy Coin',
    glyph: '🏴‍☠️',
    gradient: 'linear-gradient(135deg,#FF6A3D,#FFB03A)',
    amount: 41000,
    avgPrice: 0.021,
    price: 0.0267,
    change24h: 61.2,
  },
  {
    id: 'ember',
    symbol: 'EMBER',
    name: 'EmberQuant',
    glyph: '📈',
    gradient: 'linear-gradient(135deg,#FF3B6B,#FF2E3E)',
    amount: 640,
    avgPrice: 1.4,
    price: 1.204,
    change24h: -3.1,
  },
  {
    id: 'pydoge',
    symbol: 'PYDOGE',
    name: 'Pyre Doge',
    glyph: '🐕',
    gradient: 'linear-gradient(135deg,#C81E3A,#FF3B6B)',
    amount: 2_100_000,
    avgPrice: 0.0031,
    price: 0.004212,
    change24h: 42.7,
  },
]
