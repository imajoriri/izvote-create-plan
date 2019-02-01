const https = require('https');
var rp = require("request-promise");
var url = "https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=6acfe0d33eacb621c306771035beb904"//&id=a570600"

var options = {
  uri: url,
  method: "GET",
  timeout: 30 * 1000, // タイムアウト指定しないと帰ってこない場合がある
  qs: { 
  //  keyid: process.env["gnaviApiKye"],
  //  //id: id,
    id: "a570600,a640626",
  },
  headers: { 
    'User-Agent': 'Request-Promise'
  },
}

var res;
rp(options).then( async (data) => {
  console.log(data);
  // なぜかxmlで帰ってくるのでパース
}).catch( err => {
  console.log(err);
  throw new Error("gnavi api error");
});

//const req = https.request(url, (res) => {
//    res.on('data', (chunk) => {
//        console.log(`BODY: ${chunk}`);
//    });
//    res.on('end', () => {
//        console.log('No more data in response.');
//    });
//})
//
//req.on('error', (e) => {
//  console.error(`problem with request: ${e.message}`);
//});
//
//req.end();
