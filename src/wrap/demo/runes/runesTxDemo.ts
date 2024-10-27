/* eslint-disable prettier/prettier */

import { ChainType } from "../../common/constant"
import { OpenApiService } from "../../common/openapiService"
import { readWallets } from "../../common/utils/file-utils"
import { httpGet } from "../../common/utils/request"

const wallets = readWallets('test.txt')
const wallet = wallets[0]
const toAddress = wallets[1].address

console.log(wallet.address)

const openapiService = new OpenApiService(ChainType.BITCOIN_TESTNET, wallet)

async function sendRunesTest(){
    const feeLst = await openapiService.openApi.getFeeSummary();
    const feeRate = feeLst.list[1].feeRate
    console.log('feeLst :', feeLst)
    console.log('avg feeRate:', feeRate)


    const {list} = await openapiService.openApi.getRunesList(wallet.address);

    for(let item of list){
        console.log('Rune:',item)
    }

    const item = list[0]

    const runeid = item.runeid
    const runeAmount = item.amount

        //2：发送
    const txId = await openapiService.sendRunes({
        to: toAddress,
        runeid:runeid,
        runeAmount:runeAmount,
        feeRate:feeRate,
        enableRBF: false
    })

    console.log('txId:', txId)
}


sendRunesTest();