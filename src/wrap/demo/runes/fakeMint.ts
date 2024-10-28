/* eslint-disable prettier/prettier */

import { ChainType } from "../../common/constant";
import { OpenApiService } from "../../common/openapiService";
import { randomStr } from "../../common/utils/constantUtils";
import { readWallets } from "../../common/utils/file-utils";

const headerParams = {
    'Content-Type': 'application/json; charset=utf-8'
}


//https://testnet.unisat.io/runes/detail/TRILLION%E2%80%A2DOLLAR%E2%80%A2MEMECOIN

async function fakeRunesMint(){
    const runeId = '2585790:43'
    const wallets = readWallets('test.txt')
    const wallet = wallets[1]
  
    const openapiService = new OpenApiService(ChainType.BITCOIN_TESTNET, wallet)
    const feeLst = await openapiService.openApi.getFeeSummary();
    const feeRate = feeLst.list[1].feeRate
    console.log('avg feeRate:', feeRate)

    const url ='https://api-testnet.unisat.io/inscribe-v5/order/create/runes-mint'


    const param ={
        "receiver": wallet.address,
        "feeRate": feeRate,
        "outputValue": 546,
        "runeId": runeId,
        "count": 1,
        "clientId": randomStr(12)
      }
    const rsp = await httpPost(url, headerParams,param)
    const rs = await rsp.json();

    console.log(rs.data.payAddress, ' :  ', rs.data.amount)

    const txid = await openapiService.sendBTCPsbt({
        to: rs.data.payAddress,
        toAmount: rs.data.amount,
        feeRate:feeRate,
        enableRBF:false
      });
    
      console.log('txid:', txid)
}

//fakeRunesMint()