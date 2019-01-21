var admin = require("firebase-admin");
var rp = require("request-promise");
var to_json = require('xmljson').to_json;

var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://izvote.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("/");

exports.handler = async (event) => {
  // フロント側に返すステータス
  // 問題なしなら "OK"
  var status;
  var msg;

  // google apiから駅の緯度経度取得
  if(event.station){
    var lon, lat;
    await fetchGeometry(event.station).then( data => {
      [lon, lat] = data;
    }).catch( err => {
      console.log(err);
      status = "err";
    });
  }

  // ぐるなびから店情報を取得
  var restInfos;
  await fetchRestSearch(lon, lat).then( data => {
    restInfos = data;
  }).catch( err => {
    status = "err";
  });

  // TODO
  // firebaseに保存するためのモデル等作成
  var rest = restInfos.rest

  // レストラン（居酒屋）が取得できたら、ランダムに並べたり
  if(rest){
  }
  // 取得できなかったら、、
  else{
    status = "err";
  }

  const response = {
    status: status,
    msg: msg,
  };
  return response;
};

async function fetchRestSearch(lon, lat){
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


// google apiを使って駅の緯度経度を取得
async function fetchGeometry(station){
  var options = {
    uri: "https://maps.googleapis.com/maps/api/place/findplacefromtext/json", 
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
  var res = await rp(options);
  res = JSON.parse(res);

  // APIから正当な返答が来なかったら、エラーを返す
  if(res.status !== "OK"){
    throw new Error("google api error");
  }

  // log
  console.log("--- geometry info " + station + "---");
  console.log(JSON.stringify(res));

  // 緯度
  var lat = res.candidates[0].geometry.location.lat;
  // 経度
  var lon = res.candidates[0].geometry.location.lng;

  return [lon, lat];
}
