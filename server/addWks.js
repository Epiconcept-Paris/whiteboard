const fs = require('fs');

 exports.createWks = function(name,login,psw,url) {
  return new Promise((resolveCreateWks) => {

    return new Promise((resolveCreateDir) => {
      let path = '../data/fod/workspaces/' + name;
      fs.exists(path, (exists) => {
        if (exists) {
          console.log('directory already exists');
        } else {
          fs.mkdir(path ,(err) => {
            if (err) throw err;
            console.log('The workspace directory has been saved!');
            resolveCreateDir(path);
          })
        }
      });
    }).then((path) => {
      const aDataSource = [{
        login: login,
        psw: psw,
        url: url,
        chunk: '50'
      }];
      const sDataSourcesJSON = JSON.stringify(aDataSource);
      fs.writeFile(path + '/datasources.json', sDataSourcesJSON, (err) => {
        if (err) throw err;
        console.log('The datasources.json has been saved!');
        resolveCreateWks(path);
      });
      fs.mkdir(path +'/dataset', function(err) {
        if (err) console.log(err)
      });
    })
    .catch((err)=>{
      if(err) throw err
    })
  })
  .catch((err)=>{
    if(err) throw err
  })

};
