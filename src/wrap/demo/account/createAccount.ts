/* eslint-disable prettier/prettier */

import { AddressType } from "../../../core";
import { NetworkType } from "../../../core/network";
import { LocalWallet } from "../../../core/wallet";
import { ChainType } from "../../common/constant";
import { getChain,getAddressTypeDetail } from "../../common/utils/constantUtils";
import { DIR_PATH, readWalletFile, readWallets, saveWalletFile } from "../../common/utils/file-utils";


function baseInfo() {
    console.log(getAddressTypeDetail(AddressType.P2TR));

    console.log(getChain(ChainType.BITCOIN_MAINNET));
}

function createAccount(){
    //const wallet = LocalWallet.fromRandom(AddressType.P2TR, NetworkType.TESTNET);
    const wif =''
    console.log(LocalWallet.fromWif(wif, AddressType.P2TR, NetworkType.TESTNET))

    const addressTypeDetail = getAddressTypeDetail(AddressType.P2TR);
    //const wallet = LocalWallet.fromMnemonic(addressTypeDetail.value, NetworkType.TESTNET,msg,'',addressTypeDetail.hdPath);
    //console.log(LocalWallet.generateMnemonic(addressTypeDetail.value, NetworkType.TESTNET,'',addressTypeDetail.hdPath))
    console.log(DIR_PATH)
}
function saveWallet(){
    const addressTypeDetail = getAddressTypeDetail(AddressType.P2TR);
    const msg = 'senior spoon cupboard beach judge student chat expire attract conduct valley version';
    const wallet = LocalWallet.fromMnemonic(addressTypeDetail.value, NetworkType.TESTNET,msg,'',addressTypeDetail.hdPath);
    const wallets =[]
    wallets.push(wallet)
    saveWalletFile('test.txt', wallets)

}


function readText(){
    const array = readWallets('test.txt')
    console.log(array)

    
}

readText();
//createAccount();
