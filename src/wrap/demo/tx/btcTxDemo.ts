/* eslint-disable prettier/prettier */

import { txHelpers, UnspentOutput } from "../../../core"
import { bitcoin } from "../../../core/bitcoin-core"
import { satoshisToAmount } from "../../../core/utils"
import { LocalWallet } from "../../../core/wallet"
import { ChainType } from "../../common/constant"
import { OpenApiService } from "../../common/openapi"
import { getChain } from "../../common/utils/constantUtils"
import { readWallets } from "../../common/utils/file-utils"

//tb1p28xw3z442m2dcg0s4rxcy0lp2r6s7xef02896y057cktl5hhdeas4ryz2l

async function sendbtcTest(){
    const toAddress = 'tb1p28xw3z442m2dcg0s4rxcy0lp2r6s7xef02896y057cktl5hhdeas4ryz2l'
    const enableRBF = false
    const wallet = readWallets('test.txt')[0]
    const chain = getChain(ChainType.BITCOIN_TESTNET)
    const btcUnit = chain.unit

    const openapi = new OpenApiService(chain, wallet)
    const toAmount = 10000;

   const feeLst = await openapi.getFeeSummary();
   const feeRate = feeLst.list[1].feeRate
   console.log('avg feeRate:',feeRate)

   const utxos = await openapi.getBTCUtxos(wallet.address);
   console.log(utxos)

   const spendUnavailableUtxos = []
   let _utxos: UnspentOutput[] = (
    spendUnavailableUtxos.map((v) => {
      return Object.assign({}, v, { inscriptions: [], atomicals: [] });
    }) as any
  ).concat(utxos);

   const safeBalance = utxos.filter((v) => v.inscriptions.length == 0).reduce((pre, cur) => pre + cur.satoshis, 0);

   if (safeBalance < toAmount) {
    throw new Error(
      `Insufficient balance. Non-Inscription balance(${satoshisToAmount(
        safeBalance
      )} ${btcUnit}) is lower than ${satoshisToAmount(toAmount)} ${btcUnit} `
    );
  }

  let psbt;
  if (safeBalance === toAmount) {
    psbt = await openapi.sendAllBTC({
      to: toAddress,
      btcUtxos: _utxos,
      enableRBF,
      feeRate
    });
  } else {
    psbt = await openapi.sendBTC({
      to: toAddress,
      amount: toAmount,
      btcUtxos: _utxos,
      enableRBF,
      feeRate,
      memo :'',
      memos: []
    });
  }
  const rawtx = psbt.extractTransaction().toHex()

  const txid = await openapi.pushTx(rawtx);
  console.log('txid:',txid)

}





async function getUnavailableUtxos(openapi:OpenApiService, wallet:LocalWallet){
    const utxos = await openapi.getUnavailableUtxos(wallet.address);
    const unavailableUtxos = utxos.map((v) => {
      return {
        txid: v.txid,
        vout: v.vout,
        satoshis: v.satoshis,
        scriptPk: v.scriptPk,
        addressType: v.addressType,
        pubkey: wallet.pubkey,
        inscriptions: v.inscriptions,
        atomicals: v.atomicals
      };
    });
    return unavailableUtxos;
}


sendbtcTest()

