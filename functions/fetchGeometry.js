var rp = require("request-promise");
var to_json = require('xmljson').to_json;

// google apiを使って駅の緯度経度を取得
exports.fetchGeometry = async (station) => {
  var options = {
    uri: process.env["geometryURL"],
    method: "GET",
    timeout: 30 * 1000, // タイムアウト指定しないと帰ってこない場合がある
    qs: { 
      input: station,
      inputtype: "textquery",
      fields: "geometry", // 緯度経度以外の情報を取得しない
      key: process.env["googleApiKey"],
      language: "ja"
    },
    headers: { 
      'User-Agent': 'Request-Promise'
    },
  }

  // google apiから取得
  var res = await rp(options)

  res = JSON.parse(res);

  // 緯度
  var lat = res.candidates[0].geometry.location.lat;
  // 経度
  var lon = res.candidates[0].geometry.location.lng;

  return [lon, lat];
}
