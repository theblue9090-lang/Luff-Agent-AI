import type { Coin } from '../lib/marketApi'

// Shown only when the live DexScreener feed can't be reached (e.g. offline or
// inside a sandboxed preview). In a real browser this is replaced by live data.
const now = Date.now()
const H = 3_600_000

export const FALLBACK_COINS: Coin[] = [
  m('sol-1', 'solana', 'raydium', 'Pyre Doge', 'PYDOGE', 0.004212, 3.1, 18.4, 42.7, 4_820_000, 320_000, 6_200_000, now - 6 * H, true),
  m('sol-2', 'solana', 'pumpswap', 'Scarlet Inu', 'SCINU', 0.000091, -1.2, 9.8, 128.5, 2_140_000, 180_000, 1_900_000, now - 2 * H, true),
  m('sol-3', 'solana', 'raydium', 'Red Pepe', 'RPEPE', 0.01284, 5.6, -4.2, 22.9, 6_310_000, 540_000, 12_800_000, now - 30 * H, true),
  m('sol-4', 'solana', 'meteora', 'Ember Cat', 'EMCAT', 0.000337, 12.4, 44.1, 210.3, 3_770_000, 210_000, 3_100_000, now - 1 * H, false),
  m('sol-5', 'solana', 'pumpswap', 'Luffy Coin', 'LUFFY', 0.02671, 2.2, 7.7, 61.2, 9_400_000, 820_000, 26_400_000, now - 96 * H, true),
  m('sol-6', 'solana', 'raydium', 'Blaze Frog', 'BLZFRG', 0.000058, -8.9, -22.5, -38.1, 1_120_000, 90_000, 780_000, now - 5 * H, false),
  m('sol-9', 'solana', 'meteora', 'Crimson Sol', 'CRSOL', 0.1183, 1.4, 3.9, 14.6, 2_960_000, 410_000, 8_700_000, now - 54 * H, false),
  m('sol-10', 'solana', 'raydium', 'Vermilion', 'VRM', 0.5562, 0.8, -2.1, 6.4, 5_200_000, 1_100_000, 44_100_000, now - 168 * H, false),
  m('sol-7', 'solana', 'pumpswap', 'Magma Shiba', 'MSHIB', 0.000012, 22.7, 61.0, 340.8, 1_880_000, 120_000, 640_000, now - 0.4 * H, false),
  m('sol-8', 'solana', 'raydium', 'Ronin Fox', 'RONFOX', 0.00744, -3.3, 1.2, -12.4, 2_410_000, 260_000, 4_500_000, now - 12 * H, false),
]

function m(
  key: string,
  chainId: string,
  dexId: string,
  name: string,
  symbol: string,
  priceUsd: number,
  change1h: number,
  change6h: number,
  change24h: number,
  volume24h: number,
  liquidity: number,
  marketCap: number,
  pairCreatedAt: number,
  trending: boolean,
): Coin {
  return {
    key,
    chainId,
    dexId,
    name,
    symbol,
    priceUsd,
    change1h,
    change6h,
    change24h,
    volume24h,
    liquidity,
    marketCap,
    pairCreatedAt,
    trending,
    url: 'https://dexscreener.com',
    icon: null,
    buys24h: 0,
    sells24h: 0,
  }
}
