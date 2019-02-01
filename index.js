var admin = require("firebase-admin");
var rp = require("request-promise");
var to_json = require('xmljson').to_json;

// functions
var { fetchRestSearch } = require("./functions/fetchRestSearch");
var { pushDesignatedById } = require("./functions/pushDesignatedById");
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

  console.log("--- event ---");
  console.log(JSON.stringify(event));

  var body = JSON.parse(event.body);

  // フロント側に返すステータス
  // 問題なしなら "OK"
  var status;

  // google apiから駅の緯度経度取得
  if(body.station){
    var lon, lat;
    await fetchGeometry(body.station).then( data => {
      [lon, lat] = data;

      console.log("--- geometry ---");
      console.log("緯度: " + lat);
      console.log("経度: " + lon);

    })
  }

  // ぐるなびから店情報を取得。
  var rest = {};

  await fetchRestSearch(lon, lat, body.conditions).then( data => {
    rest = data;

    console.log("--- fetchRestSearch ---");
    console.log(rest);
  })

  // 店情報が一つも取れなかったらエラー
  if(Object.keys(rest).length === 0){
    throw new Error("rest data not found");
  }

  var designatedRest = {};

  // もしdesignatedIdがあれば、その店を追加する
  if(body.designatedIdList.length > 0){

    await pushDesignatedById(body.designatedIdList).then( data => {
      designatedRest = data;

      console.log("--- designatedRest ---");
      console.log(designatedRest);
    })

  }

  var planId = body.planId;

  // dbにPlanモデルを保存
  await setPlanModel(
    db,
    planId,
    body.groupId,
    body.lineId,
    body.station,
    body.conditions,
    rest,
    designatedRest,
  )

  await setGroupModel(db, planId, body.groupId)

  status = "ok";

  const response = {
    status: status,
  };

  console.log("--- response ---");
  console.log(response);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "X-PINGOTHER, Content-Type"
    },
    body: JSON.stringify(response)
  };
};


