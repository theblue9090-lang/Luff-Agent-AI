import type { PrivyClientConfig } from '@privy-io/react-auth'

// Set VITE_PRIVY_APP_ID (from dashboard.privy.io) to enable managed wallets.
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined
export const PRIVY_ENABLED = !!PRIVY_APP_ID

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
    accentColor: '#FF2E3E',
    logo: `${import.meta.env.BASE_URL}logo.svg`,
    walletChainType: 'solana-only',
  },
  loginMethods: ['google', 'twitter'],
  embeddedWallets: {
    // give every user a Solana wallet automatically on login
    solana: { createOnLogin: 'users-without-wallets' },
    // sign sniper transactions without a confirmation popup
    showWalletUIs: false,
  },
}
