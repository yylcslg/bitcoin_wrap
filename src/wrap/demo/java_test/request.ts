/* eslint-disable prettier/prettier */

async function getRespData(res: any){
    let jsonRes: { code: number; msg: string; data: any };

    if (!res) throw new Error('Network error, no response');
    if (res.status !== 200) throw new Error('Network error with status: ' + res.status);
    try {
        jsonRes = await res.json();
    } catch (e) {
        throw new Error('Network error, json parse error');
    }
    if (!jsonRes) throw new Error('Network error,no response data');
    
    return jsonRes.data;
};

const user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36';
export async function httpGet(url: string, headerParams: any){
    const headers = new Headers();
    for (const name in headerParams) {
        headers.append(name, headerParams[name]);
    }
    
    headers.append('user_agent', user_agent);

    let res: Response;
    try {
        res = await fetch(new Request(url), { method: 'GET', headers, mode: 'cors', cache: 'default' });
    } catch (e: any) {
        throw new Error('Network error: ' + e && e.message);
    }
    return res;
};

export async function httpPost(url: string, headerParams: any, params: any){
    const headers = new Headers();
    for (const name in headerParams) {
        headers.append(name, headerParams[name]);
    }
    let res: Response;
    try {
        res = await fetch(new Request(url), {
            method: 'POST',
            headers,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(params)
        });
    } catch (e: any) {
        throw new Error('Network error: ' + e && e.message);
    }

    return res;
};
