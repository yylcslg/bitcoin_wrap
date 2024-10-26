/* eslint-disable prettier/prettier */

import { httpGet } from "../../common/utils/request";


const token = 'c4RrlTMj1xLyseUj43GbRnpFgLXKN0ZO4DFsVIBeLRzFx3JfwE'
const emailId='qatest.hu.mary3@gmail.com'

//const token = 'xdtkkrrivxpy8y0le49tgih9rno5g61u23nv3e3sdtbb0c2pc3'

async function testRetrieveIssueAsPerRunCaseId(){
    const url = 'http://127.0.0.1:8082/api/apiAdpater/1845379350254395394/retrieveIssueAsPerRunCaseId?runCaseId=1847572057001336833';
    const headerParams = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': token,
        'emailId': emailId
    }
    const rsp = await httpGet(url, headerParams)

    const rs = await rsp.json();

    console.log(rs.data)

}

async function testQueryViewTree(ip='127.0.0.1'){
    const url = 'http://'+ip+':8082/api/view/queryViewTrees?scope=3000001';
    const headerParams = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': token,
        'emailId': emailId
    }
    const rsp = await httpGet(url, headerParams)

    const rs = await rsp.json();

    console.log(rs.data[0])

}

//1847562005142085633
//1849435610377371650

//1849697399514087425
async function testBeanSearch(ip='127.0.0.1'){
    const url = 'http://'+ip+':8082/api/bean/search/testCase/1849435610377371650?pageNum=1&pageSize=20';
    const headerParams = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': token,
        'emailId': emailId
    }
    const rsp = await httpGet(url, headerParams)

    const rs = await rsp.json();

    console.log(rs.data)

}

//http://43.139.159.146:8082/api/bean/search/testCycle/1849755335233912834?pageNum=1&pageSize=20


async function testBeanSearchTestCycle(ip='127.0.0.1'){
    const url = 'http://'+ip+':8082/api/bean/search/testCycle/1849755335233912834';
    const headerParams = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': token,
        'emailId': emailId
    }
    const rsp = await httpGet(url, headerParams)

    const rs = await rsp.json();

    console.log(rs.data)

}

const remote_ip='43.139.159.146'
//testBeanSearch(remote_ip);

//testBeanSearch();

//testQueryViewTree();

testBeanSearchTestCycle();