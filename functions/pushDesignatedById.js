var rp = require("request-promise");
var to_json = require('xmljson').to_json;

exports.pushDesignatedById = async (designatedIdList) => {
  var id = designatedIdList.join(",");

  var options = {
    // なぜかidをqsでやるとうまく行かないので、ベタがき
    uri: "https://api.gnavi.co.jp/RestSearchAPI/v3"
    + `?keyid=${process.env["gnaviApiKye"]}&id=${id}`,
    method: "GET",
    timeout: 30 * 1000, // タイムアウト指定しないと帰ってこない場合がある
    //qs: { 
    //  keyid: process.env["gnaviApiKye"],
    //  //id: id,
    //  id: "a570600,a640626",
    //},
    headers: { 
      'User-Agent': 'Request-Promise'
    },
  }

  var res;
  await rp(options).then( async (data) => {
    // なぜかxmlで帰ってくるのでパース
    await to_json(data, function (error, json) {
      res = json;
    })
  })

  return res.response.rest;

}



