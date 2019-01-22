require('date-utils');

exports.setPlanModel = async (db, planID, groupID, lineID, station, rest) => {
  var planRef = db.ref("plan");

  // updatedAtとupdatedAt用の時間
  var dt = new Date();
  var formatted = dt.toFormat("YYYY-MM-DD-HH-24MISS");

  // restからshop_idのみを取得してobjに
  // ぐるなびから得られたrestのidをキーとして保存する
  var shops = {};
  for(var i in rest){
    shops[rest[i].id] = true;
  }

  var data = {
    groupID: groupID,
    createdBy: lineID,
    station: station,
    //conditions: conditions,
    shops: shops,
    updatedAt: formatted,
    createdAt: formatted,
  }

  // planIDをkeyとしてfirebaseに保存
  var plan = {};
  plan[planID] = data;

  await planRef.update(plan);

  return "ok";
};

// 以下のデータ形式
// 
exports.setGroupModel = async (db, planID, groupID) => {
  var groupRef = db.ref("group").child(groupID);

  var data = {};
  data[planID] = true;

  await groupRef.update(data);

  return "ok";
};
