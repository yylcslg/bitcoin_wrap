/* eslint-disable prettier/prettier */

import randomstring from 'randomstring';
import { getChain, satoshisToAmount } from './utils/constantUtils';
import { ChainType, TypeChain } from './constant';
import { AddressUserToSignInput,  PublicKeyUserToSignInput, SignPsbtOptions, ToSignInput, UTXO} from './types';
import { bitcoin } from '../../core/bitcoin-core';
import { AddressType, txHelpers, UnspentOutput, UTXO_DUST } from '../../core';
import { toXOnly } from '../../core/utils';
import { toPsbtNetwork } from '../../core/network';
import { scriptPkToAddress } from '../../core/address';
import { LocalWallet } from '../../core/wallet';
import { getAddressUtxoDust } from '../../core/transaction';
import { OpenApi } from './openapi';
import { runesUtils } from './utils/runes-utils';

export class OpenApiService {

    clientAddress = '';
    addressFlag = 0;
    endpoint = '';
    deviceId = '';
    chain: TypeChain;
    wallet:LocalWallet;
    openApi:OpenApi;

    constructor(chainType:ChainType, wallet: LocalWallet, addressFlag = 0) {
        this.chain = getChain(chainType);
        this.wallet = wallet
        this.deviceId = randomstring.generate(12)
        this.endpoint = this.chain.endpoints[0]
        this.clientAddress = wallet.address
        this.addressFlag = addressFlag
        this.openApi = new OpenApi(chainType, wallet, addressFlag);
    };


  sendBTCPsbt = async ({
    to,
    toAmount,
    feeRate,
    enableRBF = true,
    memo,
    memos
  }: {
    to: string;
    toAmount: number;
    feeRate: number;
    enableRBF: boolean;
    memo?: string;
    memos?: string[];
  }) => {
    const btcUtxos = await this.getUnspentOutput(this.wallet.address)
    const safeBalance = await this.getSafeBalance(this.wallet.address, btcUtxos)

    console.log('safeBalance:', satoshisToAmount(safeBalance), ' satoshis:', safeBalance)

    if (safeBalance < toAmount) {
      throw new Error(
        `Insufficient balance. Non-Inscription balance(${satoshisToAmount(
          safeBalance
        )} ${this.chain.unit}) is lower than ${satoshisToAmount(toAmount)} ${this.chain.unit} `
      );
    }

    if (btcUtxos.length == 0) {
      throw new Error('Insufficient balance.');
    }

    let fnParam;
    if (safeBalance === toAmount) {
      fnParam = await txHelpers.sendAllBTC({
        btcUtxos: btcUtxos,
        toAddress: to,
        networkType: this.chain.networkType,
        feeRate,
        enableRBF
      });
    } else {
      fnParam = await txHelpers.sendBTC({
        btcUtxos: btcUtxos,
        tos: [{ address: to, satoshis: toAmount }],
        networkType: this.chain.networkType,
        changeAddress: this.wallet.address,
        feeRate,
        enableRBF,
        memo,
        memos
      });

    }

    this.setPsbtSignNonSegwitEnable(fnParam.psbt, true);
    await this.signPsbt(fnParam.psbt, fnParam.toSignInputs, true);
    this.setPsbtSignNonSegwitEnable(fnParam.psbt, false);

    const rawtx = fnParam.psbt.extractTransaction().toHex()
    return await this.openApi.pushTx(rawtx);
  };

  setPsbtSignNonSegwitEnable(psbt: bitcoin.Psbt, enabled: boolean) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = enabled;
  }


  formatOptionsToSignInputs = async (_psbt: string | bitcoin.Psbt, options?: SignPsbtOptions) => {
    let toSignInputs: ToSignInput[] = [];
    if (options && options.toSignInputs) {
      // We expect userToSignInputs objects to be similar to ToSignInput interface,
      // but we allow address to be specified in addition to publicKey for convenience.
      toSignInputs = options.toSignInputs.map((input) => {
        const index = Number(input.index);
        if (isNaN(index)) throw new Error('invalid index in toSignInput');

        if (!(input as AddressUserToSignInput).address && !(input as PublicKeyUserToSignInput).publicKey) {
          throw new Error('no address or public key in toSignInput');
        }

        if ((input as AddressUserToSignInput).address && (input as AddressUserToSignInput).address != this.wallet.address) {
          throw new Error('invalid address in toSignInput');
        }

        if (
          (input as PublicKeyUserToSignInput).publicKey &&
          (input as PublicKeyUserToSignInput).publicKey != this.wallet.pubkey
        ) {
          throw new Error('invalid public key in toSignInput');
        }

        const sighashTypes = input.sighashTypes?.map(Number);
        if (sighashTypes?.some(isNaN)) throw new Error('invalid sighash type in toSignInput');

        return {
          index,
          publicKey: this.wallet.pubkey,
          sighashTypes,
          disableTweakSigner: input.disableTweakSigner
        };
      });
    } else {
      const networkType = this.chain.networkType;
      const psbtNetwork = toPsbtNetwork(networkType);

      const psbt =
        typeof _psbt === 'string'
          ? bitcoin.Psbt.fromHex(_psbt as string, { network: psbtNetwork })
          : (_psbt as bitcoin.Psbt);
      psbt.data.inputs.forEach((v, index) => {
        let script: any = null;
        let value = 0;
        if (v.witnessUtxo) {
          script = v.witnessUtxo.script;
          value = v.witnessUtxo.value;
        } else if (v.nonWitnessUtxo) {
          const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
          const output = tx.outs[psbt.txInputs[index].index];
          script = output.script;
          value = output.value;
        }
        const isSigned = v.finalScriptSig || v.finalScriptWitness;
        if (script && !isSigned) {
          const address = scriptPkToAddress(script, networkType);
          if (this.wallet.address === address) {
            toSignInputs.push({
              index,
              publicKey: this.wallet.pubkey,
              sighashTypes: v.sighashType ? [v.sighashType] : undefined
            });
          }
        }
      });
    }
    return toSignInputs;
  };

  signPsbt = async (psbt: bitcoin.Psbt, toSignInputs: ToSignInput[], autoFinalized: boolean) => {
    
    const networkType = this.chain.networkType
    const psbtNetwork = toPsbtNetwork(networkType);

    if (!toSignInputs) {
      // Compatibility with legacy code.
      toSignInputs = await this.formatOptionsToSignInputs(psbt);
      if (autoFinalized !== false) autoFinalized = true;
    }
    psbt.data.inputs.forEach((v) => {
      const isNotSigned = !(v.finalScriptSig || v.finalScriptWitness);
      const isP2TR = this.wallet.addressType === AddressType.P2TR || this.wallet.addressType === AddressType.M44_P2TR;
      const lostInternalPubkey = !v.tapInternalKey;
      // Special measures taken for compatibility with certain applications.
      if (isNotSigned && isP2TR && lostInternalPubkey) {
        const tapInternalKey = toXOnly(Buffer.from(this.wallet.pubkey, 'hex'));
        const { output } = bitcoin.payments.p2tr({
          internalPubkey: tapInternalKey,
          network: psbtNetwork
        });
        if (v.witnessUtxo?.script.toString('hex') == output?.toString('hex')) {
          v.tapInternalKey = tapInternalKey;
        }
      }
    });


    psbt = await this.wallet.keyring.signTransaction(psbt, toSignInputs);
    if (autoFinalized) {
      toSignInputs.forEach((v) => {
        // psbt.validateSignaturesOfInput(v.index, validator);
        psbt.finalizeInput(v.index);
      });
    }
    return psbt;
  };


  async getUnspentOutput(address: string){
    const utxos = await this.openApi.getBTCUtxos(address);

    const btcUtxos = this.buildBtcUtxos(utxos, this.wallet.pubkey)

    const spendUnavailableUtxos = []
    let _utxos: UnspentOutput[] = (
      spendUnavailableUtxos.map((v) => {
        return Object.assign({}, v, { inscriptions: [], atomicals: [] });
      }) as any
    ).concat(btcUtxos);
    return _utxos;
  }

  async getSafeBalance(address: string, btcUtxos?: UnspentOutput[]){
    if(!btcUtxos){
      btcUtxos = await this.getUnspentOutput(address);
    }
    const safeBalance = btcUtxos.filter((v) => v.inscriptions.length == 0).reduce((pre, cur) => pre + cur.satoshis, 0);
    return safeBalance;
  }

  sendOrdinalsInscription = async ({
    to,
    inscriptionId,
    feeRate,
    enableRBF,
    outputValue
  }: {
    to: string;
    inscriptionId: string;
    feeRate: number;
    enableRBF: boolean;
    outputValue?: number;
  }) => {

    const utxo = await this.openApi.getInscriptionUtxo(inscriptionId);
    const assetUtxo = Object.assign(utxo, { pubkey: this.wallet.pubkey });
    
    if (!utxo) {
      throw new Error('UTXO not found.');
    }

    if(outputValue){
      outputValue = getAddressUtxoDust(to)
    }

    let tempUtxos = await this.openApi.getBTCUtxos(this.wallet.address)
    let btcUtxos = this.buildBtcUtxos(tempUtxos, this.wallet.pubkey)

    if (btcUtxos.length == 0) {
      throw new Error('Insufficient balance.');
    }

    const { psbt, toSignInputs } = await txHelpers.sendInscription({
      assetUtxo,
      btcUtxos:btcUtxos,
      toAddress: to,
      networkType: this.chain.networkType,
      changeAddress: this.wallet.address,
      feeRate,
      outputValue: outputValue || assetUtxo.satoshis,
      enableRBF,
      enableMixed: true
    });

    this.setPsbtSignNonSegwitEnable(psbt, true);
    await this.signPsbt(psbt, toSignInputs, true);
    this.setPsbtSignNonSegwitEnable(psbt, false);

    const rawtx = psbt.extractTransaction().toHex()
    return await this.openApi.pushTx(rawtx);
    //return ''
  }


  sendOrdinalsInscriptions = async ({
    to,
    inscriptionIds,
    feeRate,
    enableRBF,
  }: {
    to: string;
    inscriptionIds: string[];
    feeRate: number;
    enableRBF: boolean;
  }) => {

    const inscription_utxos = await this.openApi.getInscriptionUtxos(inscriptionIds);
    if (!inscription_utxos) {
      throw new Error('UTXO not found.');
    }

    if (inscription_utxos.find((v) => v.inscriptions.length > 1)) {
      throw new Error('Multiple inscriptions are mixed together. Please split them first.');
    }

    const assetUtxos = inscription_utxos.map((v) => {
      return Object.assign(v, { pubkey: this.wallet.pubkey });
    });

    const toDust = getAddressUtxoDust(to);

    assetUtxos.forEach((v) => {
      if (v.satoshis < toDust) {
        throw new Error('Unable to send inscriptions to this address in batches, please send them one by one.');
      }
    });

    
    const tempUtxos = await this.openApi.getBTCUtxos(this.wallet.address);
    let btcUtxos = this.buildBtcUtxos(tempUtxos, this.wallet.pubkey)
    
    if (btcUtxos.length == 0) {
      throw new Error('Insufficient balance.');
    }

    const { psbt, toSignInputs } = await txHelpers.sendInscriptions({
      assetUtxos,
      btcUtxos,
      toAddress: to,
      networkType: this.chain.networkType,
      changeAddress: this.wallet.address,
      feeRate,
      enableRBF
    });

    this.setPsbtSignNonSegwitEnable(psbt, true);
    await this.signPsbt(psbt, toSignInputs, true);
    this.setPsbtSignNonSegwitEnable(psbt, false);

    //const rawtx = psbt.extractTransaction().toHex()
    //return await this.openApi.pushTx(rawtx);
    return ''
  }


  buildBtcUtxos = (utxos:UTXO[], pubkey:string) => {
    const btcUtxos = utxos.map((v) => {
      return {
        txid: v.txid,
        vout: v.vout,
        satoshis: v.satoshis,
        scriptPk: v.scriptPk,
        addressType: v.addressType,
        pubkey: pubkey,
        inscriptions: v.inscriptions,
        atomicals: v.atomicals
      };
    })
    
    return btcUtxos
  }



  getAssetUtxosRunes = async (runeid: string) => {
    const runes_utxos = await this.openApi.getRunesUtxos(this.wallet.address, runeid);

    const assetUtxos = runes_utxos.map((v) => {
      return Object.assign(v, { pubkey: this.wallet.pubkey });
    });

    assetUtxos.forEach((v) => {
      v.inscriptions = [];
      v.atomicals = [];
    });

    assetUtxos.sort((a, b) => {
      const bAmount = b.runes.find((v) => v.runeid == runeid)?.amount || '0';
      const aAmount = a.runes.find((v) => v.runeid == runeid)?.amount || '0';
      return runesUtils.compareAmount(bAmount, aAmount);
    });

    return assetUtxos;
  };


  sendRunes = async ({
    to,
    runeid,
    runeAmount,
    feeRate,
    enableRBF,
    outputValue
  }: {
    to: string;
    runeid: string;
    runeAmount: string;
    feeRate: number;
    enableRBF: boolean;
    outputValue?: number;
  }) => {

    let assetUtxos = await this.findRuneAmountUtxo(runeid, runeAmount)

    const tempUtxos = await this.openApi.getBTCUtxos(this.wallet.address);
    let btcUtxos = this.buildBtcUtxos(tempUtxos, this.wallet.pubkey)

    const { psbt, toSignInputs } = await txHelpers.sendRunes({
      assetUtxos,
      assetAddress: this.wallet.address,
      btcUtxos,
      btcAddress: this.wallet.address,
      toAddress: to,
      networkType: this.chain.networkType,
      feeRate,
      enableRBF,
      runeid,
      runeAmount,
      outputValue: outputValue || UTXO_DUST
    });

    this.setPsbtSignNonSegwitEnable(psbt, true);
    await this.signPsbt(psbt, toSignInputs, true);
    this.setPsbtSignNonSegwitEnable(psbt, false);

    //const rawtx = psbt.extractTransaction().toHex()
    //return await this.openApi.pushTx(rawtx);
    return ''

  }

  findRuneAmountUtxo = async (runeid:string, runeAmount:string)=>{

    const assetUtxos = await this.getAssetUtxosRunes(runeid);
    const _assetUtxos: UnspentOutput[] = [];

    // find the utxo that has the exact amount to split
    for (let i = 0; i < assetUtxos.length; i++) {
      const v = assetUtxos[i];
      if (v.runes && v.runes.length > 1) {
        const balance = v.runes.find((r) => r.runeid == runeid);
        if (balance && balance.amount == runeAmount) {
          _assetUtxos.push(v);
          break;
        }
      }
    }

    if (_assetUtxos.length == 0) {
      for (let i = 0; i < assetUtxos.length; i++) {
        const v = assetUtxos[i];
        if (v.runes) {
          const balance = v.runes.find((r) => r.runeid == runeid);
          if (balance && balance.amount == runeAmount) {
            _assetUtxos.push(v);
            break;
          }
        }
      }
    }

    if (_assetUtxos.length == 0) {
      let total = BigInt(0);
      for (let i = 0; i < assetUtxos.length; i++) {
        const v = assetUtxos[i];
        v.runes?.forEach((r) => {
          if (r.runeid == runeid) {
            total = total + BigInt(r.amount);
          }
        });
        _assetUtxos.push(v);
        if (total >= BigInt(runeAmount)) {
          break;
        }
      }
    }

    return _assetUtxos;
  }

}