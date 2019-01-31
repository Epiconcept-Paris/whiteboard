exports.sendData = function(path){
  return new Promise((resolveSendData)=>{
    const fs = require('fs')
    , ws = path.shift()
    , aRows = path;

    const tableName = aRows[0].split("[")[0];

    fs.readFile(`../data/fod/workspaces/${ws}/dataset/${tableName}.json`, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      const aData = JSON.parse(data);
      const aRet = aData.map(line=>{
        let newLine = {};
        aRows.forEach(colName =>{
          let id = colName.split("[");
          id.shift();
          let sId = id.toString();
          sId = sId.substr(0, sId.length -1);
          newLine[sId] = line[sId];
        });
        return newLine;
      });
      const retJson = JSON.stringify(aRet);
      resolveSendData(retJson);
    })
  })
};
