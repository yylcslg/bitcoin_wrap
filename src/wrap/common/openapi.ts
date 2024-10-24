/* eslint-disable prettier/prettier */
import randomstring from 'randomstring';
import { getChain } from './utils/constantUtils';
import { ChainType, TypeChain } from './constant';
import { AddressRunesTokenSummary, AddressSummary, AddressTokenSummary, AddressUserToSignInput, AppSummary, Arc20Balance, BitcoinBalance, BtcPrice, DecodedPsbt, FeeSummary, InscribeOrder, Inscription, InscriptionSummary, PublicKeyUserToSignInput, RuneBalance, SignPsbtOptions, TickPriceItem, TokenBalance, TokenTransfer, ToSignInput, UTXO, UTXO_Detail, VersionDetail } from './types';
import { bitcoin } from '../../core/bitcoin-core';
import { AddressType, txHelpers, UnspentOutput } from '../../core';
import { toXOnly } from '../../core/utils';
import { toPsbtNetwork } from '../../core/network';
import { scriptPkToAddress } from '../../core/address';
import { LocalWallet } from '../../core/wallet';

const CHANNEL = 'github';
const VERSION = '1.5.0'

const maxRPS = 100;

enum API_STATUS {
    FAILED = -1,
    SUCCESS = 0
}



export class OpenApiService {

    clientAddress = '';
    addressFlag = 0;
    endpoint = '';
    deviceId = '';
    chain: TypeChain;
    wallet:LocalWallet;


    constructor(chain: TypeChain, wallet: LocalWallet, addressFlag = 0) {
        this.chain = chain;
        this.wallet = wallet;
        this.deviceId = randomstring.generate(12)
        this.endpoint = this.chain.endpoints[0]
        this.clientAddress = wallet.address;
        this.addressFlag = addressFlag;
    };


    getRespData = async (res: any) => {
        let jsonRes: { code: number; msg: string; data: any };

        if (!res) throw new Error('Network error, no response');
        if (res.status !== 200) throw new Error('Network error with status: ' + res.status);
        try {
            jsonRes = await res.json();
        } catch (e) {
            throw new Error('Network error, json parse error');
        }
        if (!jsonRes) throw new Error('Network error,no response data');
        if (jsonRes.code !== API_STATUS.SUCCESS) {
            throw new Error(jsonRes.msg);
        }
        return jsonRes.data;
    };

    httpGet = async (route: string, params: any) => {
        let url = this.endpoint + route;
        let c = 0;
        for (const id in params) {
            if (c == 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += `${id}=${params[id]}`;
            c++;
        }
        const headers = new Headers();
        headers.append('X-Client', 'UniSat Wallet');
        headers.append('X-Version', VERSION);
        headers.append('x-address', this.clientAddress);
        headers.append('x-flag', this.addressFlag + '');
        headers.append('x-channel', CHANNEL);
        headers.append('x-udid', this.deviceId);

        let res: Response;
        try {
            res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
        } catch (e: any) {
            throw new Error('Network error: ' + e && e.message);
        }

        return this.getRespData(res);
    };

    httpPost = async (route: string, params: any) => {
        const url = this.endpoint + route;
        const headers = new Headers();
        headers.append('X-Client', 'UniSat Wallet');
        headers.append('X-Version', VERSION);
        headers.append('x-address', this.clientAddress);
        headers.append('x-flag', this.addressFlag + '');
        headers.append('x-channel', CHANNEL);
        headers.append('x-udid', this.deviceId);
        headers.append('Content-Type', 'application/json;charset=utf-8');
        let res: Response;
        try {
            res = await fetch(new Request(url), {
                method: 'POST',
                headers,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(params)
            });
        } catch (e: any) {
            throw new Error('Network error: ' + e && e.message);
        }

        return this.getRespData(res);
    };


    async getAddressSummary(address: string): Promise<AddressSummary> {
        return this.httpGet('/v5/address/summary', {
            address
        });
    }

    async getAddressBalance(address: string): Promise<BitcoinBalance> {
        return this.httpGet('/v5/address/balance', {
            address
        });
    }

    async getMultiAddressAssets(addresses: string): Promise<AddressSummary[]> {
        return this.httpGet('/v5/address/multi-assets', {
            addresses
        });
    }


  async findGroupAssets(
    groups: { type: number; address_arr: string[] }[]
  ): Promise<{ type: number; address_arr: string[]; satoshis_arr: number[] }[]> {
    return this.httpPost('/v5/address/find-group-assets', {
      groups
    });
  }

  async getUnavailableUtxos(address: string): Promise<UTXO[]> {
    return this.httpGet('/v5/address/unavailable-utxo', {
      address
    });
  }

  async getBTCUtxos(address: string): Promise<UTXO[]> {
    return this.httpGet('/v5/address/btc-utxo', {
      address
    });
  }

  async getInscriptionUtxo(inscriptionId: string): Promise<UTXO> {
    return this.httpGet('/v5/inscription/utxo', {
      inscriptionId
    });
  }

  async getInscriptionUtxoDetail(inscriptionId: string): Promise<UTXO_Detail> {
    return this.httpGet('/v5/inscription/utxo-detail', {
      inscriptionId
    });
  }

  async getInscriptionUtxos(inscriptionIds: string[]): Promise<UTXO[]> {
    return this.httpPost('/v5/inscription/utxos', {
      inscriptionIds
    });
  }

  async getInscriptionInfo(inscriptionId: string): Promise<Inscription> {
    return this.httpGet('/v5/inscription/info', {
      inscriptionId
    });
  }

  async getAddressInscriptions(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: Inscription[]; total: number }> {
    return this.httpGet('/v5/address/inscriptions', {
      address,
      cursor,
      size
    });
  }

  async getInscriptionSummary(): Promise<InscriptionSummary> {
    return this.httpGet('/v5/default/inscription-summary', {});
  }

  async getAppSummary(): Promise<AppSummary> {
    return this.httpGet('/v5/default/app-summary-v2', {});
  }

  async pushTx(rawtx: string): Promise<string> {
    return this.httpPost('/v5/tx/broadcast', {
      rawtx
    });
  }

  async getFeeSummary(): Promise<FeeSummary> {
    return this.httpGet('/v5/default/fee-summary', {});
  }

  private btcPriceCache: number | null = null;
  private btcPriceUpdateTime = 0;
  private isRefreshingBtcPrice = false;

  async refreshBtcPrice() {
    try {
      this.isRefreshingBtcPrice = true;
      const result: BtcPrice = await this.httpGet('/v5/default/btc-price', {});
      // test
      // const result: BtcPrice = await Promise.resolve({ price: 58145.19716040577, updateTime: 1634160000000 });

      this.btcPriceCache = result.price;
      this.btcPriceUpdateTime = Date.now();

      return result.price;
    } finally {
      this.isRefreshingBtcPrice = false;
    }
  }

  async getBtcPrice(): Promise<number> {
    while (this.isRefreshingBtcPrice) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    //   30s cache
    if (this.btcPriceCache && Date.now() - this.btcPriceUpdateTime < 30 * 1000) {
      return this.btcPriceCache;
    }
    // 40s return cache and refresh
    if (this.btcPriceCache && Date.now() - this.btcPriceUpdateTime < 40 * 1000) {
      this.refreshBtcPrice().then();
      return this.btcPriceCache;
    }

    return this.refreshBtcPrice();
  }


  private brc20PriceCache: { [key: string]: { cacheTime: number; data: TickPriceItem } } = {};
  private currentRequestBrc20 = {};

  async getBrc20sPrice(ticks: string[]) {
    if (ticks.length < 0) {
      return {};
    }
    const tickLine = ticks.join('');
    if (!tickLine) return {};

    try {
      while (this.currentRequestBrc20[tickLine]) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.currentRequestBrc20[tickLine] = true;

      const result = {} as { [key: string]: TickPriceItem };

      for (let i = 0; i < ticks.length; i += 1) {
        const tick = ticks[i];
        const cache = this.brc20PriceCache[tick];
        if (!cache) {
          break;
        }
        if (cache.cacheTime + 5 * 60 * 1000 > Date.now()) {
          result[tick] = cache.data;
        }
      }

      if (Object.keys(result).length === ticks.length) {
        return result;
      }

      const resp: { [ticker: string]: TickPriceItem } = await this.httpPost('/v5/market/brc20/price', {
        ticks,
        nftType: 'brc20'
      });

      for (let i = 0; i < ticks.length; i += 1) {
        const tick = ticks[i];
        this.brc20PriceCache[tick] = { cacheTime: Date.now(), data: resp[tick] };
      }
      return resp;
    } finally {
      this.currentRequestBrc20[tickLine] = false;
    }
  }

  private runesPriceCache: { [key: string]: { cacheTime: number; data: TickPriceItem } } = {};
  private currentRequestRune = {};

  async getRunesPrice(ticks: string[]) {
    if (ticks.length < 0) {
      return {};
    }
    const tickLine = ticks.join('');
    if (!tickLine) return {};

    try {
      while (this.currentRequestRune[tickLine]) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.currentRequestRune[tickLine] = true;

      const result = {} as { [key: string]: TickPriceItem };

      for (let i = 0; i < ticks.length; i += 1) {
        const tick = ticks[i];
        const cache = this.runesPriceCache[tick];
        if (!cache) {
          break;
        }
        if (cache.cacheTime + 5 * 60 * 1000 > Date.now()) {
          result[tick] = cache.data;
        }
      }

      if (Object.keys(result).length === ticks.length) {
        return result;
      }

      const resp: { [ticker: string]: TickPriceItem } = await this.httpPost('/v5/market/runes/price', {
        ticks,
        nftType: 'runes'
      });

      for (let i = 0; i < ticks.length; i += 1) {
        const tick = ticks[i];
        this.runesPriceCache[tick] = { cacheTime: Date.now(), data: resp[tick] };
      }
      return resp;
    } finally {
      this.currentRequestRune[tickLine] = false;
    }
  }

  async getDomainInfo(domain: string): Promise<Inscription> {
    return this.httpGet('/v5/address/search', { domain });
  }

  async inscribeBRC20Transfer(
    address: string,
    tick: string,
    amount: string,
    feeRate: number,
    outputValue: number
  ): Promise<InscribeOrder> {
    return this.httpPost('/v5/brc20/inscribe-transfer', { address, tick, amount, feeRate, outputValue });
  }

  async getInscribeResult(orderId: string): Promise<TokenTransfer> {
    return this.httpGet('/v5/brc20/order-result', { orderId });
  }

  async getBRC20List(address: string, cursor: number, size: number): Promise<{ list: TokenBalance[]; total: number }> {
    return this.httpGet('/v5/brc20/list', { address, cursor, size });
  }

  async getBRC20List5Byte(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: TokenBalance[]; total: number }> {
    return this.httpGet('/v5/brc20/5byte-list', { address, cursor, size, type: 5 });
  }

  async getAddressTokenSummary(address: string, ticker: string): Promise<AddressTokenSummary> {
    return this.httpGet('/v5/brc20/token-summary', { address, ticker: encodeURIComponent(ticker) });
  }

  async getTokenTransferableList(
    address: string,
    ticker: string,
    cursor: number,
    size: number
  ): Promise<{ list: TokenTransfer[]; total: number }> {
    return this.httpGet('/v5/brc20/transferable-list', {
      address,
      ticker: encodeURIComponent(ticker),
      cursor,
      size
    });
  }

  async decodePsbt(psbtHex: string, website: string): Promise<DecodedPsbt> {
    return this.httpPost('/v5/tx/decode2', { psbtHex, website });
  }

  async getBuyBtcChannelList(): Promise<{ channel: string }[]> {
    return this.httpGet('/v5/buy-btc/channel-list', {});
  }

  async createPaymentUrl(address: string, channel: string): Promise<string> {
    return this.httpPost('/v5/buy-btc/create', { address, channel });
  }

  async checkWebsite(website: string): Promise<{ isScammer: boolean; warning: string }> {
    return this.httpPost('/v5/default/check-website', { website });
  }

  async getOrdinalsInscriptions(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: Inscription[]; total: number }> {
    return this.httpGet('/v5/ordinals/inscriptions', {
      address,
      cursor,
      size
    });
  }

  async getAtomicalsNFT(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: Inscription[]; total: number }> {
    return this.httpGet('/v5/atomicals/nft', {
      address,
      cursor,
      size
    });
  }

  async getAtomicalsUtxo(atomicalId: string): Promise<UTXO> {
    return this.httpGet('/v5/atomicals/utxo', {
      atomicalId
    });
  }

  async getArc20BalanceList(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: Arc20Balance[]; total: number }> {
    return this.httpGet('/v5/arc20/balance-list', { address, cursor, size });
  }

  async getArc20Utxos(address: string, ticker: string): Promise<UTXO[]> {
    return this.httpGet('/v5/arc20/utxos', {
      address,
      ticker
    });
  }

  async getVersionDetail(version: string): Promise<VersionDetail> {
    return this.httpGet('/v5/version/detail', {
      version
    });
  }

  async getRunesList(address: string, cursor: number, size: number): Promise<{ list: RuneBalance[]; total: number }> {
    return this.httpGet('/v5/runes/list', { address, cursor, size });
  }

  async getRunesUtxos(address: string, runeid: string): Promise<UTXO[]> {
    return this.httpGet('/v5/runes/utxos', {
      address,
      runeid
    });
  }

  async getAddressRunesTokenSummary(address: string, runeid: string): Promise<AddressRunesTokenSummary> {
    return this.httpGet(`/v5/runes/token-summary?address=${address}&runeid=${runeid}`, {});
  }

  async getAddressRecentHistory(params: { address: string, start: number, limit: number }) {
    return this.httpGet('/v5/address/history', params);
  }


  sendBTC = async ({
    to,
    amount,
    feeRate,
    enableRBF,
    btcUtxos,
    memo,
    memos
  }: {
    to: string;
    amount: number;
    feeRate: number;
    enableRBF: boolean;
    btcUtxos?: UnspentOutput[];
    memo?: string;
    memos?: string[];
  }) => {
    
    if (btcUtxos.length == 0) {
      throw new Error('Insufficient balance.');
    }


    const { psbt, toSignInputs } = await txHelpers.sendBTC({
      btcUtxos: btcUtxos,
      tos: [{ address: to, satoshis: amount }],
      networkType: this.chain.networkType,
      changeAddress: this.wallet.address,
      feeRate,
      enableRBF,
      memo,
      memos
    });
    console.log('psbt:', psbt);
    console.log('toSignInputs:', toSignInputs);

    this.setPsbtSignNonSegwitEnable(psbt, true);
    await this.signPsbt(psbt, toSignInputs, true);
    this.setPsbtSignNonSegwitEnable(psbt, false);
    return psbt;
  };

  sendAllBTC = async ({
    to,
    feeRate,
    enableRBF,
    btcUtxos
  }: {
    to: string;
    feeRate: number;
    enableRBF: boolean;
    btcUtxos?: UnspentOutput[];
  }) => {

    if (btcUtxos.length == 0) {
      throw new Error('Insufficient balance.');
    }

    const { psbt, toSignInputs } = await txHelpers.sendAllBTC({
      btcUtxos: btcUtxos,
      toAddress: to,
      networkType: this.chain.networkType,
      feeRate,
      enableRBF
    });

    this.setPsbtSignNonSegwitEnable(psbt, true);
    await this.signPsbt(psbt, toSignInputs, true);
    this.setPsbtSignNonSegwitEnable(psbt, false);
    return psbt;
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
}
