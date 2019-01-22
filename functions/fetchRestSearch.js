var rp = require("request-promise");
var to_json = require('xmljson').to_json;

exports.fetchRestSearch = async (lon, lat) => {
  //async function fetchRestSearch(lon, lat){
  var options = {
    uri: "https://api.gnavi.co.jp/RestSearchAPI/v3",
    method: "GET",
    timeout: 30 * 1000, // タイムアウト指定しないと帰ってこない場合がある
    qs: { 
      keyid: process.env["gnaviApiKye"],
      category_l: process.env["category_l"],
      longitude: lon,
      latitude: lat,
      range: 3, // 1:300m、2:500m、3:1000m、4:2000m、5:3000m
      hit_per_page: 20, // ヒット件数
    },
    headers: { 
      'User-Agent': 'Request-Promise'
    },
  }

  var res;
  await rp(options).then( async (data) => {
    // なぜかxmlで帰ってくるのでパース
    await to_json(data, function (error, json) {
      res = json;
    });
  }).catch( err => {
    console.log(err);
    throw new Error("gnavi api error");
  });

  return res.response;

}


