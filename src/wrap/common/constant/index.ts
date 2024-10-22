import { AddressType } from '../../../core';
import { NetworkType } from '../../../core/network';

export enum CHAINS_ENUM {
  BTC = 'BTC'
}

export const GAS_LEVEL_TEXT = {
  slow: 'Standard',
  normal: 'Fast',
  fast: 'Instant',
  custom: 'Custom'
};

export const ADDRESS_TYPES: {
  value: AddressType;
  label: string;
  name: string;
  hdPath: string;
  displayIndex: number;
  isUnisatLegacy?: boolean;
}[] = [
  {
    value: AddressType.P2PKH,
    label: 'P2PKH',
    name: 'Legacy (P2PKH)',
    hdPath: "m/44'/0'/0'/0",
    displayIndex: 3,
    isUnisatLegacy: false
  },
  {
    value: AddressType.P2WPKH,
    label: 'P2WPKH',
    name: 'Native Segwit (P2WPKH)',
    hdPath: "m/84'/0'/0'/0",
    displayIndex: 0,
    isUnisatLegacy: false
  },
  {
    value: AddressType.P2TR,
    label: 'P2TR',
    name: 'Taproot (P2TR)',
    hdPath: "m/86'/0'/0'/0",
    displayIndex: 2,
    isUnisatLegacy: false
  },
  {
    value: AddressType.P2SH_P2WPKH,
    label: 'P2SH-P2WPKH',
    name: 'Nested Segwit (P2SH-P2WPKH)',
    hdPath: "m/49'/0'/0'/0",
    displayIndex: 1,
    isUnisatLegacy: false
  },
  {
    value: AddressType.M44_P2WPKH,
    label: 'P2WPKH',
    name: 'Native SegWit (P2WPKH)',
    hdPath: "m/44'/0'/0'/0",
    displayIndex: 4,
    isUnisatLegacy: true
  },
  {
    value: AddressType.M44_P2TR,
    label: 'P2TR',
    name: 'Taproot (P2TR)',
    hdPath: "m/44'/0'/0'/0",
    displayIndex: 5,
    isUnisatLegacy: true
  }
];

export const OW_HD_PATH = "m/86'/0'/0'";

export enum ChainType {
  BITCOIN_MAINNET = 'BITCOIN_MAINNET',
  BITCOIN_TESTNET = 'BITCOIN_TESTNET',
  BITCOIN_TESTNET4 = 'BITCOIN_TESTNET4',
  BITCOIN_SIGNET = 'BITCOIN_SIGNET',
  FRACTAL_BITCOIN_MAINNET = 'FRACTAL_BITCOIN_MAINNET',
  FRACTAL_BITCOIN_TESTNET = 'FRACTAL_BITCOIN_TESTNET'
}

export const NETWORK_TYPES = [
  { value: NetworkType.MAINNET, label: 'LIVENET', name: 'livenet', validNames: [0, 'livenet', 'mainnet'] },
  { value: NetworkType.TESTNET, label: 'TESTNET', name: 'testnet', validNames: ['testnet'] }
];

type TypeChain = {
  enum: ChainType;
  label: string;
  icon: string;
  unit: string;
  networkType: NetworkType;
  endpoints: string[];
  mempoolSpaceUrl: string;
  unisatUrl: string;
  ordinalsUrl: string;
  unisatExplorerUrl: string;
  okxExplorerUrl: string;
  isViewTxHistoryInternally?: boolean;
  disable?: boolean;
  isFractal?: boolean;
  showPrice: boolean;
  defaultExplorer: 'mempool-space' | 'unisat-explorer';
};

export const CHAINS_MAP: { [key: string]: TypeChain } = {
  [ChainType.BITCOIN_MAINNET]: {
    enum: ChainType.BITCOIN_MAINNET,
    label: 'Bitcoin Mainnet',
    icon: './images/artifacts/bitcoin-mainnet.png',
    unit: 'BTC',
    networkType: NetworkType.MAINNET,
    endpoints: ['https://wallet-api.unisat.io'],
    mempoolSpaceUrl: 'https://mempool.space',
    unisatUrl: 'https://unisat.io',
    ordinalsUrl: 'https://ordinals.com',
    unisatExplorerUrl: '',
    okxExplorerUrl: '',
    showPrice: true,
    defaultExplorer: 'mempool-space'
  },
  [ChainType.BITCOIN_TESTNET]: {
    enum: ChainType.BITCOIN_TESTNET,
    label: 'Bitcoin Testnet',
    icon: './images/artifacts/bitcoin-testnet.svg',
    unit: 'tBTC',
    networkType: NetworkType.TESTNET,
    endpoints: ['https://wallet-api-testnet.unisat.io'],
    mempoolSpaceUrl: 'https://mempool.space/testnet',
    unisatUrl: 'https://testnet.unisat.io',
    ordinalsUrl: 'https://testnet.ordinals.com',
    unisatExplorerUrl: '',
    okxExplorerUrl: '',
    showPrice: false,
    defaultExplorer: 'mempool-space'
  },
  [ChainType.BITCOIN_TESTNET4]: {
    enum: ChainType.BITCOIN_TESTNET4,
    label: 'Bitcoin Testnet4 (Beta)',
    icon: './images/artifacts/bitcoin-testnet.svg',
    unit: 'tBTC',
    networkType: NetworkType.TESTNET,
    endpoints: ['https://wallet-api-testnet4.unisat.io'],
    mempoolSpaceUrl: 'https://mempool.space/testnet4',
    unisatUrl: 'https://testnet4.unisat.io',
    ordinalsUrl: 'https://testnet4.ordinals.com',
    unisatExplorerUrl: '',
    okxExplorerUrl: '',
    showPrice: false,
    defaultExplorer: 'mempool-space'
  },
  [ChainType.BITCOIN_SIGNET]: {
    enum: ChainType.BITCOIN_SIGNET,
    label: 'Bitcoin Signet',
    icon: './images/artifacts/bitcoin-signet.svg',
    unit: 'sBTC',
    networkType: NetworkType.TESTNET,
    endpoints: ['https://wallet-api-signet.unisat.io'],
    mempoolSpaceUrl: 'https://mempool.space/signet',
    unisatUrl: 'https://signet.unisat.io',
    ordinalsUrl: 'https://signet.ordinals.com',
    unisatExplorerUrl: '',
    okxExplorerUrl: '',
    showPrice: false,
    defaultExplorer: 'mempool-space'
  },
  [ChainType.FRACTAL_BITCOIN_MAINNET]: {
    enum: ChainType.FRACTAL_BITCOIN_MAINNET,
    label: 'Fractal Bitcoin Mainnet',
    icon: './images/artifacts/fractal-mainnet.svg',
    unit: 'FB',
    networkType: NetworkType.MAINNET,
    endpoints: ['https://wallet-api-fractal.unisat.io'],
    mempoolSpaceUrl: 'https://mempool.fractalbitcoin.io',
    unisatUrl: 'https://fractal.unisat.io',
    ordinalsUrl: 'https://ordinals.fractalbitcoin.io',
    unisatExplorerUrl: 'https://explorer.unisat.io/fractal-mainnet',
    okxExplorerUrl: '',
    isViewTxHistoryInternally: false,
    disable: false,
    isFractal: true,
    showPrice: true,
    defaultExplorer: 'unisat-explorer'
  },
  [ChainType.FRACTAL_BITCOIN_TESTNET]: {
    enum: ChainType.FRACTAL_BITCOIN_TESTNET,
    label: 'Fractal Bitcoin Testnet',
    icon: './images/artifacts/fractal-testnet.svg',
    unit: 'tFB',
    networkType: NetworkType.MAINNET,
    endpoints: ['https://wallet-api-fractal-testnet.unisat.io'],
    mempoolSpaceUrl: 'https://mempool-testnet.fractalbitcoin.io',
    unisatUrl: 'https://fractal-testnet.unisat.io',
    ordinalsUrl: 'https://ordinals-testnet.fractalbitcoin.io',
    unisatExplorerUrl: 'https://explorer.unisat.io/fractal-testnet',
    okxExplorerUrl: '',
    isViewTxHistoryInternally: false,
    isFractal: true,
    showPrice: false,
    defaultExplorer: 'unisat-explorer'
  }
};

export const CHAINS = Object.values(CHAINS_MAP);

export const MINIMUM_GAS_LIMIT = 21000;

export const WALLETCONNECT_STATUS_MAP = {
  PENDING: 1,
  CONNECTED: 2,
  WAITING: 3,
  SIBMITTED: 4,
  REJECTED: 5,
  FAILD: 6
};

export const GASPRICE_RANGE = {
  [CHAINS_ENUM.BTC]: [0, 10000]
};

export const COIN_NAME = 'BTC';
export const COIN_SYMBOL = 'BTC';

export const COIN_DUST = 1000;

export const TO_LOCALE_STRING_CONFIG = {
  minimumFractionDigits: 8
};

export const SAFE_DOMAIN_CONFIRMATION = 3;

export const CHANNEL = process.env.channel!;
export const VERSION = process.env.release!;
export const MANIFEST_VERSION = process.env.manifest!;

export enum AddressFlagType {
  Is_Enable_Atomicals = 0b1,
  CONFIRMED_UTXO_MODE = 0b10,
  DISABLE_AUTO_SWITCH_CONFIRMED = 0b100
}

export const UNCONFIRMED_HEIGHT = 4194303;

export enum PaymentChannelType {
  MoonPay = 'moonpay',
  AlchemyPay = 'alchemypay',
  Transak = 'transak'
}

export enum HardwareWalletType {
  Keystone = 'keystone',
  Ledger = 'ledger',
  Trezor = 'trezor'
}
