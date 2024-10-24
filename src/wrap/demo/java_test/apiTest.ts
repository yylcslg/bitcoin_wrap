/* eslint-disable prettier/prettier */

import { httpGet } from "./request";

const token = 'MdYawvQmi3MAAM6UQL7wCTJeUdG6CS5oLtDRIAcao9lZEUe46J'
const emailId='qatest.hu.mary3@gmail.com'

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

testRetrieveIssueAsPerRunCaseId();