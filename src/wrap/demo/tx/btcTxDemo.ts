/* eslint-disable prettier/prettier */

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
    console.log(wallet.address)

    const openapi = new OpenApiService(chain, wallet)

   const feeLst = await openapi.getFeeSummary();
   const feeRate = feeLst.list[1].feeRate
   console.log('feeLst :' , feeLst)
   console.log('avg feeRate:',feeRate)

  const txid = await openapi.sendBTCPsbt({
    to: toAddress,
    toAmount: 10000,
    feeRate,
    enableRBF
  });

  console.log('txid:',txid)

}


sendbtcTest()

