export interface Wallet {
  name: string
  glyph: string
  desc: string
}

export interface Network {
  id: string
  name: string
  glyph: string
  color: string
  gradient: string
  symbol: string
  addressType: 'sol' | 'evm'
  wallets: Wallet[]
}

const SOLANA_WALLETS: Wallet[] = [
  { name: 'Phantom', glyph: '👻', desc: 'Most popular Solana wallet' },
  { name: 'Solflare', glyph: '🔆', desc: 'Solana-native, web & mobile' },
  { name: 'Backpack', glyph: '🎒', desc: 'xNFT-ready Solana wallet' },
  { name: 'Glow', glyph: '🌟', desc: 'Simple, fast Solana wallet' },
]

const EVM_WALLETS: Wallet[] = [
  { name: 'MetaMask', glyph: '🦊', desc: 'Most popular EVM wallet' },
  { name: 'Coinbase Wallet', glyph: '🔵', desc: 'Connect with Coinbase' },
  { name: 'WalletConnect', glyph: '🔗', desc: 'Scan with any mobile wallet' },
  { name: 'Rabby', glyph: '🐰', desc: 'Multi-chain DeFi wallet' },
]

export const networks: Network[] = [
  {
    id: 'solana',
    name: 'Solana',
    glyph: '◎',
    color: '#14F195',
    gradient: 'linear-gradient(135deg,#9945FF,#14F195)',
    symbol: 'SOL',
    addressType: 'sol',
    wallets: SOLANA_WALLETS,
  },
  {
    id: 'base',
    name: 'Base',
    glyph: 'B',
    color: '#0052FF',
    gradient: 'linear-gradient(135deg,#0052FF,#2D7BFF)',
    symbol: 'ETH',
    addressType: 'evm',
    wallets: EVM_WALLETS,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    glyph: 'Ξ',
    color: '#8A92B2',
    gradient: 'linear-gradient(135deg,#627EEA,#A0AEC0)',
    symbol: 'ETH',
    addressType: 'evm',
    wallets: EVM_WALLETS,
  },
]

export const defaultNetwork = networks[0] // Solana
