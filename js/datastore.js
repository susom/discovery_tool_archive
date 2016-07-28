var datastore = {
    db : null

    ,startupDB: function(dbname){
        var db = new PouchDB(dbname, {adapter: 'websql', iosDatabaseLocation: 'default'});
        if (!db.adapter) { // websql not supported by this browser
          db = new PouchDB(dbname);
        }
        return db;
    }

    ,getDB : function(_id,db){
        db.get(_id).then(function (doc) {
          // handle doc
          return doc;
        }).catch(function (err) {
          console.log(err);
          return false;
        });
        return;
    }

    ,getAll : function(db){
        db.allDocs({include_docs: true})
        .then(function (response) {
          console.log(response);
        });
    }

    ,writeDB : function(_o,db){
        console.log("writing to the dB");
        db.put(_o, function callback(err, result) {
            if (!err) {
              console.log('Successfully saved a json object!');
            }
        });
        return;
    }

    ,liveDB : function(db){
        // console.log("liveDB is more for INCOMING SERVER CHANGES TO DB?");

        db.changes({
           since    : 'now'
          ,live     : true
        }).on('change', function(){
            console.log("Incoming Changes From Remote , or Even Local Writes?");
            //WHAT TO DO IF DATA COMES IN?
            //THAT WONT HAPPEN MUCH, SINCE THIS APP IS 
            //MORE ABOUT STORING USER DATA TO UPLOAD LATER
        });
        return;
    }

    ,twoWaySyncDB : function(localdb,remotedb){
        // console.log("real time live two way replication, dont do this on 'users'");

        localdb.sync(remotedb, {
          live: true
        }).on('change', function (change) {
            console.log("redundant to liveDB");
          // yo, something changed!
        }).on('error', function (err) {
          // yo, we got an error! (maybe the user went offline?)
        });
        return;
    }

    ,localSyncDB : function(localdb,remotedb){
        console.log("only sync from local to remote");
        var opts = {live: true};
        localdb.replicate.to(remotedb, opts, syncError);
        return;
    }

    ,remoteSyncDB : function(localdb,remotedb){
        console.log("only sync from remote to local");
        var opts = {live: true};
        localdb.replicate.from(remotedb, opts, syncError);
        return;
    }

    ,addAttachment : function(_o, media){
        // URL.createObjectURL();  converts base64 image into imgsrc

        return;
    }
};

