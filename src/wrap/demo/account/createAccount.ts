/* eslint-disable prettier/prettier */

import { AddressType } from "../../../core";
import { NetworkType } from "../../../core/network";
import { LocalWallet } from "../../../core/wallet";
import { ChainType } from "../../common/constant";
import { getChain,getAddressTypeDetail } from "../../common/utils/constantUtils";


function baseInfo() {
    console.log('',getAddressTypeDetail(AddressType.P2TR));

    console.log(getChain(ChainType.BITCOIN_MAINNET));
}

function createAccount(){
    //const wallet = LocalWallet.fromRandom(AddressType.P2TR, NetworkType.TESTNET);
    
    //console.log(LocalWallet.fromWif(wif, AddressType.P2TR, NetworkType.TESTNET))

    const addressTypeDetail = getAddressTypeDetail(AddressType.P2TR);
    //const wallet = LocalWallet.fromMnemonic(addressTypeDetail.value, NetworkType.TESTNET,msg,'',addressTypeDetail.hdPath);
    console.log(LocalWallet.generateMnemonic(addressTypeDetail.value, NetworkType.TESTNET,'',addressTypeDetail.hdPath))

}


createAccount();

//mnemonic: 'senior spoon cupboard beach judge student chat expire attract conduct valley version'
//address: 'tb1pkazmlpyfaeuu78chfyn8t5073healy2vgh9dyapev9ruc9khumxqcdv2sq',
//wif: 'cSuUE1E4bnK4ksRrTQeJ4bcE5ctr43y41US5KCbiQnHHEXgEycNs',