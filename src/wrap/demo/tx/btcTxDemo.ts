/* eslint-disable prettier/prettier */

import { ChainType } from "../../common/constant"
import { OpenApiService } from "../../common/openapiService"

import { readWallets } from "../../common/utils/file-utils"

async function sendbtcTest() {
  const wallets = readWallets('test.txt')
  const wallet = wallets[0]
  const toAddress = wallets[1].address
  
  console.log(wallet.address)

  const openapiService = new OpenApiService(ChainType.BITCOIN_TESTNET, wallet)

  const feeLst = await openapiService.openApi.getFeeSummary();
  const feeRate = feeLst.list[1].feeRate
  console.log('feeLst :', feeLst)
  console.log('avg feeRate:', feeRate)

  const txid = await openapiService.sendBTCPsbt({
    to: toAddress,
    toAmount: 10000,
    feeRate,
    enableRBF:false
  });

  console.log('txid:', txid)

}


sendbtcTest()

