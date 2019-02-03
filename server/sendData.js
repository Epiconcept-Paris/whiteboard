/**
 * merge all data related to a dataset from chunk files and send for display
 * @param path
 * @returns {Promise<[]>}
 */
exports.sendData = function(path){
  return new Promise((resolveSendData, rejectSendData)=> {
    const fs = require('fs')
    , ws = path.shift()
    , aRows = path;

    const idTable = aRows[0].split("[")[0];
    this.readModel(ws).then((oModel) => {
      const oTable = oModel['tables'].find(x => parseInt(x['id']) === parseInt(idTable));

      // retrieve data from chunk files and merge into one
      if (oTable) {
        const chunks = Math.ceil(oTable['total_rows'] / oTable['chunk_size']);
        let aChunkPromise = [];

        for (let i = 0; i < chunks; i++) {
          aChunkPromise.push(this.readFile(ws, idTable, i, aRows));
        }

        Promise.all(aChunkPromise).then(responses => {
          let data = [];
          for (let j = 0; j < responses.length; j++) {
            data = data.concat(responses[j]);
          }
          resolveSendData(JSON.stringify(data));
        });
      }
    }).catch(err => rejectSendData(err));
  })
};

/**
 * read model of a WS
 * @param ws
 * @returns {Promise<Object>}
 */
exports.readModel = function (ws) {
  return new Promise((resolveReadModel, rejectReadModel) => {
    const fs = require('fs');

    fs.readFile(`../data/fod/workspaces/${ws}/model.json`, 'utf8', function (err, data) {
      if (err) {
        rejectReadModel(err);
      }
      const oModel = JSON.parse(data);
      resolveReadModel(oModel);
    });

  });
};

/**
 * read chunk file of a dataset
 * @param ws
 * @param idTable
 * @param index
 * @param aRows
 * @returns {Promise<[]>}
 */
exports.readFile = function (ws, idTable, index, aRows) {
  return new Promise((resolveReadFile, rejectReadFile) => {
    const fs = require('fs');

    fs.readFile(`../data/fod/workspaces/${ws}/dataset/${idTable}_${index}.json`, 'utf8', function (err,data) {
      if (err) {
        rejectReadFile(err);
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
      resolveReadFile(aRet);
    });

  });
};