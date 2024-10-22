/* eslint-disable prettier/prettier */
import { AddressType } from "../../../core";
import { ADDRESS_TYPES, CHAINS_MAP, ChainType } from "../constant";

export function getChain(chainType:ChainType){
    return CHAINS_MAP[chainType];
}

export const getAddressTypeDetail = (addressType : AddressType)=>{
    return ADDRESS_TYPES.find((item)=>{
        return item.value === addressType;
    })
}
