
/* eslint-disable prettier/prettier */

import { NetworkType } from "../../../core/network";
import { readWallets } from "../../common/utils/file-utils";

//bc1pyz2nrvzg4hh2kmnt8pmjz4n7ecc82suvlqerahr837sg0a8086vsach65a
//H70u0YzMO/GZS0o2xs4mJXBMHHycJ4UyJmc7tnMrd0taPzulHVZovK8UJF0KjvMr8JWLNecd/MADORUUGk6xQFE=
async function dataSign() {
    const wallets = readWallets('wallet_1.txt', NetworkType.MAINNET)
    const wallet = wallets[0]
    console.log('wallet address:' , wallet.address)

    const msg = "You're signing into Infinity AI using your wallet on time: Oct 27 06:10 (UTC+0)"


    const sig = await wallet.keyring.signMessage(wallet.pubkey, msg)

    console.log('sig:', sig)

    const flag = await wallet.keyring.verifyMessage(wallet.pubkey, msg, sig)

    console.log(flag)


}



dataSign();
