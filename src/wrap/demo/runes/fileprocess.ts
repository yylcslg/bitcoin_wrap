/* eslint-disable prettier/prettier */

import * as fs from 'fs-extra'
import * as path from 'path'
import { DIR_PATH } from '../../common/utils/file-utils'



export function readWalletFile(fileName=''){
    let data = fs.readFileSync(DIR_PATH +'/' + fileName,'utf-8')
    
    let arr:[string][] = []

    const array = data.split('\n')

    for(let i=0;i<array.length;i= i+2){
        const line = "'"+array[i]+"':" + "'"+array[i+1]+"',"
        line.replace("/:'/gi","'")
        console.log(line)

    }



}

readWalletFile('1.txt')