require('date-utils');
var { constant } = require("./../constant");

exports.setPlanModel = async (db, planId, groupId, lineId, station, conditions, rest, designatedRest) => {
  var planRef = db.ref("plan");

  // updatedAtとupdatedAt用の時間
  var dt = new Date();
  var formatted = dt.toFormat("YYYY-MM-DD-HH-24MISS");

  // restからshop_idのみを取得してobjに
  // ぐるなびから得られたrestのidをキーとして保存する
  var shops = {};
  for(var i in rest){

    //画像と、サイトページのURLがない奴は切り捨て
    if(rest[i].image_url.shop_image1 && rest[i].url_mobile){
      shops[rest[i].id] = {
        id: rest[i].id,
        imgURL: rest[i].image_url.shop_image1,
        name: rest[i].name,
        budget: rest[i].budget,
        prShort: rest[i].pr.pr_short,
        urlMobile: rest[i].url_mobile,
        station: rest[i].access.station,
        walk: rest[i].access.walk,
      }
    }

    // 一定数以上取得したら終了
    if(Object.keys(shops).length > constant.shopsMaxLength){
      break;
    }
  }

  // 指定されたやつを入れていく
  var designatedShops = {};
  for(var i in designatedRest){
    designatedShops[designatedRest[i].id] = {
      id: designatedRest[i].id,
      imgURL: designatedRest[i].image_url.shop_image1,
      name: designatedRest[i].name,
      budget: designatedRest[i].budget,
      prShort: designatedRest[i].pr.pr_short,
      urlMobile: designatedRest[i].url_mobile,
      station: designatedRest[i].access.station,
      walk: designatedRest[i].access.walk,
    }
  }


  var data = {
    groupId: groupId,
    createdBy: lineId,
    station: station,
    conditions: conditions,
    //shops: shops,
    shops: Object.assign(designatedShops, shops),
    updatedAt: formatted,
    createdAt: formatted,
  }

  // planIDをkeyとしてfirebaseに保存
  var plan = {};
  plan[planId] = data;

  await planRef.update(plan)

  return "ok";
};

// 以下のデータ形式
// 
exports.setGroupModel = async (db, planId, groupId) => {
  var groupRef = db.ref("group").child(groupId);

  var data = {};
  data[planId] = true;

  await groupRef.update(data);

  return "ok";
};
