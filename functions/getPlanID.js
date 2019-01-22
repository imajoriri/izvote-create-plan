require('date-utils');

exports.getPlanID = (groupID) => {
  var dt = new Date();
  var formatted = dt.toFormat("YYYYMMDDHH24MISS");
  return groupID + "_" + formatted ;
}
