/* eslint-disable prettier/prettier */
import BigNumber from "bignumber.js";
import randomstring from 'randomstring';
import { AddressType } from "../../../core";
import { ADDRESS_TYPES, CHAINS_MAP, ChainType } from "../constant";
import moment from 'moment-timezone'
export function getChain(chainType:ChainType){
    return CHAINS_MAP[chainType];
}

export function getSignTime(format = 'yyyy-MM-dd HH:mm:ss'){
    let formattedDateTime = moment().utc().format(format)
    return formattedDateTime
}

export function sleep(ms:number){
    return new Promise(resolve=>setTimeout(resolve, ms))
}

export const getAddressTypeDetail = (addressType : AddressType)=>{
    return ADDRESS_TYPES.find((item)=>{
        return item.value === addressType;
    })
}

export function formatDate(date: Date, fmt = 'yyyy-MM-dd hh:mm:ss') {
    const o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      S: date.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
    for (const k in o)
      if (new RegExp(`(${k})`).test(fmt))
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
    return fmt;
  }
  
  export function satoshisToAmount(val: number) {
    const num = new BigNumber(val);
    return num.dividedBy(100000000).toFixed(8);
  }
  
  export function amountToSatoshis(val: any) {
    const num = new BigNumber(val);
    return num.multipliedBy(100000000).toNumber();
  }
  

  export function randomStr(num: number){
    return randomstring.generate(num)
  }
