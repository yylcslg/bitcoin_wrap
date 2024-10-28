/* eslint-disable prettier/prettier */

import { ChainType } from "../../common/constant";
import { OpenApiService } from "../../common/openapiService";
import { randomStr } from "../../common/utils/constantUtils";
import { readWallets } from "../../common/utils/file-utils";
import { httpGet, httpPost } from "../../common/utils/request";

const headerParams = {
    'Content-Type': 'application/json; charset=utf-8'
}

async function login(){
    const url ='https://api-testnet.unisat.io/basic-v4/base/login'

    const param ={
        "address": "tb1p28xw3z442m2dcg0s4rxcy0lp2r6s7xef02896y057cktl5hhdeas4ryz2l",
        "pubkey": "03271b848ba8a25246eea84b9937e1a383b54cf2d0db976f5a7d65c4f9f7e80e98",
        "sign": "H+lBBp/plML2c+ep/RrNNZ4Rh6zqQRX7nzABB3i8mlYJSOc1Nb6MCSB4kCuGJiLTc1f4mU0NBBvXzWu77KgEmic=",
        "walletType": "unisat",
        'X-Appid':'1adcd7969603261753f1812c9461cd36',
        'X-Sign':'860312196067f6381cb7a5d1d325bbd3',
        'X-Ts':'1730083929'
      }
    const rsp = await httpPost(url, headerParams,param)

    const rs = await rsp.json();

    console.log(rs.data)

}


//    e.headers["cf-token"] = "".concat(Math.random().toString(36).slice(-6)).concat(t.substring(12, 14)).concat(Math.random().toString(36).slice(-8), "u").concat(Math.random().toString(36).slice(-8))

//https://api-testnet.unisat.io/ts2
//
//X-Appid: 应该是个固定值
//X-Ts :时间
//X-Sign :生成方式还没找到，应该和 X-Ts  ，address ，X-Appid 有关
async function preload(){
    const url = 'https://api-testnet.unisat.io/basic-v4/base/preload?address=tb1p28xw3z442m2dcg0s4rxcy0lp2r6s7xef02896y057cktl5hhdeas4ryz2l'

    const headerParams = {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Appid':'1adcd7969603261753f1812c9461cd36',
        'X-Sign':'24237cda3596efe0e708e3acbe0ba818',
        'X-Ts':'1730085510'
    }

    const rsp = await httpGet(url, headerParams)

    const rs = await rsp.json();


    console.log(rs.data)
}

preload();