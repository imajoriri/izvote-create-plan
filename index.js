var admin = require("firebase-admin");
var rp = require("request-promise");
var to_json = require('xmljson').to_json;

// functions
var { fetchRestSearch } = require("./functions/fetchRestSearch");
var { fetchGeometry } = require("./functions/fetchGeometry");
var { getPlanID } = require("./functions/getPlanID");
var {
  setPlanModel,
  setGroupModel,
} = require("./functions/setFirebase");

var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://izvote.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("/");

// event >> station, conditions, groupID, line_user_id
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
      msg = "fetch geometry error";
    });
  }

  // ぐるなびから店情報を取得
  var restInfos;
  await fetchRestSearch(lon, lat, event.conditions).then( data => {
    restInfos = data;
  }).catch( err => {
    status = "err";
    msg = "fetch rest serch error";
  });

  // レストラン（居酒屋）が取得できたら、ランダムに並べたり
  if(restInfos){
    var rest = restInfos.rest

    // planのkeyとなるID取得
    var planID = getPlanID(event.groupID);

    // dbにPlanモデルを保存
    await setPlanModel(
      db,
      planID,
      event.groupID,
      event.lineID,
      event.station,
      rest
    ).catch( err => {
      console.log(err);
      status = "err";
      msg = "set plan model";
    });

    await setGroupModel(db, planID, event.groupID).catch( err => {
      console.log(err);
      status = "err";
      msg = "set group model error"
    });

    // 全て保存できたからOKを返す
    status = "ok";
  }
  // 取得できなかったら、、
  else{
    status = "err";
    msg = "not found rest info";
  }

  const response = {
    status: status,
    msg: msg,
  };
  return response;
};


