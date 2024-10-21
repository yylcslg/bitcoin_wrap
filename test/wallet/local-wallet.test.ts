import { expect } from 'chai';
import { AddressType } from '../../src';
import { NetworkType } from '../../src/network';
import { LocalWallet } from '../../src/wallet';

const sampleMnemonic = 'finish oppose decorate face calm tragic certain desk hour urge dinosaur mango';

const wallet = LocalWallet.fromMnemonic(AddressType.P2TR, NetworkType.TESTNET, sampleMnemonic, '', "m/86'/0'/0'/0");
console.log('address:', wallet.address);
console.log('public key:', wallet.pubkey);
