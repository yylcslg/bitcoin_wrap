/* eslint-disable prettier/prettier */

import { httpPost } from "../../common/utils/request";



async function fakeRunesMint(){
    const url ='https://api-testnet.unisat.io/inscribe-v5/order/create/runes-mint'


    const headerParams = {
        'Content-Type': 'application/json; charset=utf-8'
    }

    const param ={
        "receiver": "tb1pkazmlpyfaeuu78chfyn8t5073healy2vgh9dyapev9ruc9khumxqcdv2sq",
        "feeRate": 2097,
        "outputValue": 546,
        "runeId": "2584592:58",
        "count": 1,
        "clientId": "gyxu1hq7v769lrht"
      }
    const rsp = await httpPost(url, headerParams,param)

    const rs = await rsp.json();

    console.log(rs.data)


}


fakeRunesMint()