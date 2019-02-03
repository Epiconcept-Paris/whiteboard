exports.modelRefresh = function(ws){
  return new Promise(function(resolveModelRefresh) {
    const req = require('request')
    ,parser = require('xml2json')
    ,fs = require('fs');

    console.log('Refreshing the model');
    const readDataSources = new Promise((resolveReadDataSources, rejectReadDataSources) => {
      fs.readFile('../data/fod/workspaces/'+ ws +'/datasources.json', 'utf8', function (err, data) {
        if (err) {
          console.log(err);
          rejectReadDataSources(err);
        } else {
          resolveReadDataSources(data);
        }
      });
    });

    readDataSources.then((response) => {
      const aDataSource = JSON.parse(response);
      if (aDataSource.length) {
        const login = aDataSource[0].login.trim();
        const psw = aDataSource[0].psw.trim();
        const url = aDataSource[0].url.replace('http://', '').replace('https://', '').trim();
        const chunkSize = parseInt(aDataSource[0].chunk.trim(), 10);
        const sAuthUrl = 'http://' + login + ':' + psw + '@' + url;

        // get data sets of specified Voo4 application
        const apiUrl = sAuthUrl + '/ws/dataset';

        const model = {
          "sources":
            [
              {"name":"voozanoo"}
            ]
          ,"groups":[
            "Varsets", "Data Queries"
          ]
          ,"reports":
            [
              {"name":"Malaria evolution by Region", "order":1, "visible":true, "source":"myDb", "group":"Reports", "collapsed":"true"}
              ,{"name":"Vaccination coverage analysis", "order":1, "visible":true, "source":"myDb", "group":"Reports", "collapsed":"true"}
              ,{"name":"Poverty & weather correlation", "order":1, "visible":true, "source":"myDb", "group":"Reports", "collapsed":"true"}
              ,{"name":"Infectious diseases evolution ", "order":1, "visible":true, "source":"myDb", "group":"Reports", "collapsed":"true"}
            ]
          ,"tables":[
            {"name":"Patient", "order":1, "visible":true, "source":"myDb", "group":"Varsets", "collapsed":"true"
              ,"fields": [
                {"name":"IdPatient","type":"column", "dataType":"string", "formula":"IdPatient","format":null, "visible":false, "order":0, "level":1, "table":"Patient"}
                ,{"name":"Nom","type":"column", "dataType":"string", "formula":"Nom","format":null, "visible":true, "order":1, "level":1, "table":"Patient"}
                ,{"name":"Prenom","type":"column", "dataType":"string", "formula":"Prenom","format":null, "visible":true, "order":2, "level":1, "table":"Patient"}
                ,{"name":"Convocation","type":"column", "dataType":"string", "formula":"Convocation","format":null, "visible":true, "order":3, "level":1, "table":"Patient"}
                ,{"name":"Convocation-code","type":"column", "dataType":"string", "formula":"Convocation-code","format":null, "visible":true, "order":4, "level":2, "table":"Patient"}
                ,{"name":"Convocation-libellé","type":"column", "dataType":"string", "formula":"Convocation-libellé","format":null, "visible":true, "order":5, "level":2, "table":"Patient"}
                ,{"name":"Date Naissance","type":"column", "dataType":"date", "formula":"BirthDate","format":null,"visible":true, "order":6, "level":1, "table":"Patient"}
                ,{"name":"Date Naissance.Année","type":"column", "dataType":"int", "formula":"GetYear(BirthDate)","format":null,"visible":true, "order":7, "level":2, "table":"Patient"}
                ,{"name":"Date Naissance.Mois","type":"column","dataType":"string","formula":"Format(BirthDate, 'yyyyMMM')","format":null,"visible":true,"order":8,"level":2,"orderby":"Format(Date, 'yyyyMM')","table":"Patient"}
                ,{"name":"Date Naissance.Jour","type":"column", "dataType":"int", "formula":"GetDay(BirthDate)","format":null,"visible":true, "order":9, "level":2,"table":"Patient"}
              ]
            }
            ,{"name":"Pays", "order":2, "visible":true, "source":"myDb", "group":"Varsets", "collapsed":"true"
              ,"fields": [
                {"name":"Code Pays","type":"column", "dataType":"string", "formula":"Code Pays","format":null, "visible":true, "order":1, "level":1, "table":"Pays"}
                ,{"name":"Pays","type":"column", "dataType":"string", "formula":"Pays","format":null, "visible":true, "order":2, "level":1, "table":"Pays"}
                ,{"name":"Region","type":"column", "dataType":"string", "formula":"Region","format":null, "visible":true, "order":3, "level":1, "table":"Pays"}
              ]
            }
            ,{"name":"Visite", "order":3, "visible":true, "source":"myDb", "group":"Varsets", "collapsed":"true"
              ,"fields": [
                {"name":"IdPatient","type":"column", "dataType":"string", "formula":"IdPatient","format":null, "visible":false, "order":0, "level":1, "table":"Visite"}
                ,{"name":"Age Patient","type":"column", "dataType":"int","formula":"DateDiff(Date, Now(), 'yyyy')","format":null,"visible":true, "order":1, "level":1, "table":"Visite"}
                ,{"name":"Date","type":"column", "dataType":"date", "formula":"Date","format":null,"visible":true, "order":2, "level":1, "table":"Visite"}
                ,{"name":"Date.Année","type":"column", "dataType":"int", "formula":"GetYear(Date)","format":null,"visible":true, "order":3, "level":2, "table":"Visite"}
                ,{"name":"Date.Mois","type":"column","dataType":"string","formula":"Format(Date, 'yyyyMMM')","format":null,"visible":true,"order":4,"level":2,"orderby":"Format(Date, 'yyyyMM')", "table":"Visite"}
                ,{"name":"Date.Jour","type":"column", "dataType":"int", "formula":"GetDay(Date)","format":null,"visible":true, "order":4, "level":2, "table":"Visite"}
                ,{"name":"Code Pays","type":"column", "dataType":"string", "formula":"Code Pays","format":null, "visible":false, "order":5, "level":1, "table":"Visite"}
                ,{"name":"Code Postale","type":"column", "dataType":"string", "formula":"Code Postale","format":null, "visible":true, "order":6, "level":1, "table":"Visite"}
              ]
            }
            ]
        };

        // Get request to obtain all dataqueries and exports of the application
        req.get(apiUrl, (error, res, body) => {
          const oResponse = JSON.parse(parser.toJson(body));
          const aDataSet = oResponse.root.response.dataset;
          Promise.all(
            aDataSet.map((oItem, iIndex) => new Promise(function(resolveGetDataSet, rejectGetDataSet) {
              var aDataSetId = ['185', '187'];
              if (aDataSetId.includes(oItem.id)) {
                console.log('fetching data for dataset ' + oItem.id + ' name ' + oItem.name);

                const datasetApiUrl = sAuthUrl + '/ws/dataset/id/' + oItem.id + '/format/json/';
                let table = {};

                const getDataSetFirstChunk = new Promise((resolveGetDataSetFirstChunk, rejectGetDataSetFirstChunk) => {
                  const datasetInfoApiUrl = datasetApiUrl + 'begin/0/range/1';
                  // GET request to obtain data set information
                  req.get(datasetInfoApiUrl, (error, res, body) => {
                    if (error) {
                      rejectGetDataSetFirstChunk(error);
                    }
                    const oDataQueryFirstChunk = JSON.parse(body);
                    if( Object.keys(oDataQueryFirstChunk).indexOf('metadata') !== -1 && Object.keys(oDataQueryFirstChunk).indexOf('total_rows') !== -1 ) {
                      const aField = oDataQueryFirstChunk['metadata']['fields'];
                      const iTotalRows = oDataQueryFirstChunk['total_rows'];
                      table = {
                        id: oItem.id,
                        name: oItem.name,
                        order: iIndex,
                        visible: true,
                        source: 'varset',
                        group: 'Data Queries',
                        collapsed: true,
                        fields: [],
                        chunk_size: chunkSize,
                        total_rows: 0
                      };
                      let index = 0;
                      for (let d in aField) {
                        if (aField.hasOwnProperty(d)) {
                          const field = {
                            id: d,
                            name: (aField[d]['default_label'] ? aField[d]['default_label'] : d),
                            type: 'column',
                            dataType: aField[d]['type'],
                            formula: '',
                            format: null,
                            visible: true,
                            order: index,
                            level: 1,
                            table: oItem.id // used in JSON file name
                          };
                          table.fields.push(field);
                          index++;
                        }
                      }
                      // model.tables.push(table);
                      resolveGetDataSetFirstChunk(iTotalRows);
                    }
                  });
                });
                
                getDataSetFirstChunk.then((iTotalRows) => {
                  const chunks = Math.ceil(iTotalRows / chunkSize);
                  let aChunkPromise = [];
                  let iBegin = 0;
                  for (let i = 0; i < chunks; i++) {
                    aChunkPromise.push(
                      new Promise((resolveGetDataSetChunk, rejectGetDataSetChunk) => {
                        const datasetApiUrlChunk = `${datasetApiUrl}begin/${iBegin}/range/${chunkSize}`;
                        // console.log('datasetApiUrlChunk: ' + datasetApiUrlChunk);
                        req.get(datasetApiUrlChunk, (error, res, body) => {
                          if (error) {
                            rejectGetDataSetChunk(error);
                          }
                          const oDataQueryChunk = JSON.parse(body);
                          if(Object.keys(oDataQueryChunk).indexOf('metadata') !== -1 && Object.keys(oDataQueryChunk).indexOf('rowdata') !== -1) {
                            const aField = oDataQueryChunk['metadata']['fields'];
                            const aRowData = oDataQueryChunk['rowdata'];
                            if (aRowData.length > 0) {
                              const dataJson = JSON.stringify(aRowData.map(row => {
                                let newRow = {};
                                for(let d in row) {
                                  if (row.hasOwnProperty(d)) {
                                    newRow[(aField[d]['default_label'] ? aField[d]['default_label'] : d)] = row[d];
                                  }
                                }
                                return newRow;
                              }));
                              fs.writeFile('../data/fod/workspaces/'+ ws + `/dataset/${oItem.id}_${i}.json`, dataJson, (err) => {
                                if (err) throw err;
                                console.log(`The data for ${oItem.name} no. ${i} file has been saved!`);
                              });
                              table.total_rows += aRowData.length;
                            }
                          }
                          resolveGetDataSetChunk();
                        });
                      })
                    );
                    iBegin += chunkSize;
                  }

                  Promise.all(aChunkPromise).then(response => {
                    model.tables.push(table);
                    resolveGetDataSet(response)
                  });
                }).catch(console.error);
              } else {
                console.log(oItem.name, 'ignored');
                resolveGetDataSet();
              }
            })))
            .then(aResult => {
              aResult.forEach(oItem => {
                if (oItem && oItem.error) {
                  console.error(oItem.error);
                  return false;
                }
              });
              const modelJSON = JSON.stringify(model);
              fs.writeFile('../data/fod/workspaces/'+ ws + '/model.json', modelJSON, (err) => {
                if (err) throw err;
                console.log('The model file has been saved!');
              });
              resolveModelRefresh();
            })
            .catch(console.error);
        });
      }
    })
    .catch(console.error);
  })
};
