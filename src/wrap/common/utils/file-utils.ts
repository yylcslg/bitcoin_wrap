/* eslint-disable prettier/prettier */

import * as fs from 'fs-extra'
import * as path from 'path'
import { LocalWallet } from '../../../core/wallet';
import { AddressType } from '../../../core';
import { NetworkType } from '../../../core/network';

export const DIR_PATH:string = path.resolve(`$(__dirname)`,'../resource');
export function readWalletFile(fileName=''){
    let data = fs.readFileSync(DIR_PATH +'/' + fileName,'utf-8')
    
    let arr:[string,string,string][] = []
    data.split('\n').forEach(line => {
        let ele = line.split(',')
        if(ele.length > 2){
            let t:[string,string,string] = [ele[0],ele[1],ele[2]]
            arr.push(t)
        }
    })

    return arr
}


export function readWallets(fileName:string, addressType: AddressType = AddressType.P2TR, networkType: NetworkType = NetworkType.TESTNET){
    let data = fs.readFileSync(DIR_PATH +'/' + fileName,'utf-8')
    
    let arr:LocalWallet[] = []
    data.split('\n').forEach(line => {
        let ele = line.split(',')
        if(ele.length > 2){
            const wif = ele[1] as string
            const wallet = LocalWallet.fromWif(wif, addressType, networkType)
            arr.push(wallet)
        }
    })

    return arr
}
export function saveWalletFile(fileName:string,wallets:LocalWallet[]){
    wallets.forEach((a, _idx, _)=>{
        let data = a.address+','+a.wif+','+a.mnemonic+'\n'
        fs.appendFileSync(DIR_PATH +'/' + fileName, data)
    })
}
