/* eslint-disable prettier/prettier */
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
