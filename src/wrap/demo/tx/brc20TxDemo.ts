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


const headerParams = {
    'Content-Type': 'application/json; charset=utf-8'
}

async function sendbrc20Test() {
    const feeLst = await openapiService.openApi.getFeeSummary();
    const feeRate = feeLst.list[1].feeRate
    console.log('feeLst :', feeLst)
    console.log('avg feeRate:', feeRate)

    //1：获取所有ins

    const {list} = await openapiService.openApi.getOrdinalsInscriptions(wallet.address);

    for(const item of list){
        const url = item.content
        const rsp = await httpGet(url, headerParams)
        const rs = await rsp.json();
        console.log('inscriptionId:',item.inscriptionId)
        console.log('content:',rs)
    }

    const id = list[0].inscriptionId

    //2：发送
    const txId = await openapiService.sendOrdinalsInscription({
        to: toAddress,
        inscriptionId:id,
        feeRate:feeRate,
        enableRBF: false
    })

    console.log('txId:', txId)
}



async function sendbrc20Tests() {
    const feeLst = await openapiService.openApi.getFeeSummary();
    const feeRate = feeLst.list[1].feeRate
    console.log('feeLst :', feeLst)
    console.log('avg feeRate:', feeRate)

    //1：获取所有ins

    const {list} = await openapiService.openApi.getOrdinalsInscriptions(wallet.address);

    for(const item of list){
        const url = item.content
        const rsp = await httpGet(url, headerParams)
        const rs = await rsp.json();
        console.log('inscriptionId:',item.inscriptionId)
        console.log('content:',rs)
    }

    const id = list[0].inscriptionId
    const ids:string[] = [id]

    //2：发送
    // const txId = await openapiService.sendOrdinalsInscriptions({
    //     to: toAddress,
    //     inscriptionIds:ids,
    //     feeRate:feeRate,
    //     enableRBF: false
    // })

    // console.log('txId:', txId)
}

