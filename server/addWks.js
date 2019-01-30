const fs = require('fs');
const model = require('./model');

 exports.createWks = function(name,login,psw,url) {
  return new Promise((resolve1,reject1) => {

    return new Promise((resolve,reject)=>{
      let path = '../data/fod/workspaces/' + name;
      fs.exists(path, (exists) => {
        if (exists) {
          console.log('file already exists');
        } else {
          fs.mkdir(path ,(err) => {
            if (err) throw err;
            console.log('The workspace directory has been saved!');
            resolve(path);
          })
        }
      });
    }).then((path) => {
      oDatasources = [{
        'login':login
        ,'psw':psw
        ,'url':url
      }]
      jsonDatasource = JSON.stringify(oDatasources)
      fs.writeFile(path + '/datasources.json', jsonDatasource, (err) => {
        if (err) throw err;
        console.log('The dataset.json has been saved!');
        resolve1(path)
      })
      fs.mkdir(path +'/dataset', function(err){
        if (err) console.log(err)
      })
    })
    .catch((err)=>{
      if(err) throw err
    })
  })
  .catch((err)=>{
    if(err) throw err
  })

};
