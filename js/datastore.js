var datastore = {
    db : null

    ,startupDB: function(dbname){
        var db  = new PouchDB(dbname, {iosDatabaseLocation: 'default', auto_compaction: true});
        // app.log("GOT DB: " + dbname);
        return db;
    }

    ,destroyDB : function(dbname){
        new PouchDB(dbname).destroy().then(function (){
          app.log("DB DESTROYED: " + dbname);
        }).catch(function (err) {
          app.log("ERROR destroyDB(): " + dbname);
          datastore.showError(err);
        });
    }

    ,getDB : function(db,_id,assign_to_this){
        db.get(_id).then(function (doc) {
            assign_to_this = doc;
        }).catch(function (err) {
            app.log("ERROR getDB(): " + _id);
            datastore.showError(err);
        });
    }

    ,getAll : function(db){
        db.allDocs({
            // IF NO OPTION, RETURN JUST _id AND _rev (FASTER)
            include_docs: true
            // ,startkey : 'id01'
            // ,endkey : 'id10'
            // ,limit : 10
            // inefficient
            // ,skip  : 5
            // ,descending : true
            // ,key : 'id01'
            // ,keys : ['id01','id02']
        }).then(function (res) {
            console.log(res["rows"]);
            // utils.dump(res["rows"]);
        }).catch(function(err){
            app.log("ERROR getAll()");
            datastore.showError(err);
        });
    }

    ,writeDB : function(db,_o){
        db.put(_o).then(function (new_o) {
            var _rev = new_o.rev;
            app.log("PUTTING old rev : " + _o._rev + " / new rev : " + _rev);
            _o._rev = _rev;
            app.log("JSON OBJECT SUCCESFULLY SAVED : " + _o._id + " , rev : " + _o._rev);
        }).catch(function (err) {
            app.log("ERROR WRITING TO A DB");
            console.log(_o);
            datastore.showError(err);
        });
    }

    ,liveDB : function(db){
        //DONT NEED THIS CAUSE THE OTHER LIVE SYNCS HAVE "change" EVENT TRIGGER TOO
        db.changes({
             since    : 'now'
            ,live     : true
        }).on('change', function(){
            console.log("Incoming Changes From Remote , or Even Local Writes? I THINK EVEN LOCAL");
        }).catch(function (err) {
            app.log("ERROR liveDB()");
            datastore.showError(err);
        });
    }

    ,twoWaySyncDB : function(localdb_obj,remotedb_str){
        localdb_obj.sync(remotedb_str, {
            live: true
        }).on('change', function (change) {
            console.log("SOMETHING CHANGED , SYNC!");
            console.log(change);
        }).on('uptodate',function(update){
            console.log("SYNC TO/FROM DONE");
        }).catch(function (err) {
            console.log("ERROR twoWaySyncDB():");
            datastore.showError(err);
        });
    }

    ,localSyncDB : function(localdb_obj,remotedb_str){
        localdb_obj.replicate.to(remotedb_str,{
            live: true
        }).on('complete', function (wut) {
            app.log("LOCAL DB REPLICATED TO REMOTE!");
        }).on('change',function(change){
        }).on('uptodate',function(update){
        }).catch(function (err) {
            app.log("ERROR localSyncDB()");
            datastore.showError(err);
        });
    }

    ,remoteSyncDB : function(localdb_obj,remotedb_str){
        localdb_obj.replicate.from(remotedb_str,{
            live: true
        }).on('complete', function (wut) {
            app.log("REPLICATION (COMPLETE) FROM " + remotedb_str + " DONE");
            ourvoice.getAllProjects();
        }).on('change',function(change){
            app.log("REPLICATION (CHANGE) FROM " + remotedb_str + " DONE");
            ourvoice.getAllProjects();
        }).on('uptodate',function(update){
            app.log("REPLICATION (UPTODATE) FROM " + remotedb_str + " DONE");
            ourvoice.getAllProjects();
        }).catch(function (err) {
            app.log("ERROR ON REPLICATING FROM REMOTE: " + remotedb_str);
        });
    }

    ,addAttachment : function(_o, media){
        // URL.createObjectURL();  converts base64 image into imgsrc
    }

    ,showError : function(e){
        console.log("status: "  + e["status"]);
        console.log("name: "    + e["name"]);
        console.log("message: " + e["message"]);
        console.log("reason: "  + e["reason"]);
        return;
    }

    ,pouchCollate : function(component_array){
        // return window.pouchCollate.toIndexableString(component_array).replace(/\u0000/g, '\u0001')
        return component_array.join("_");
    }

    ,pouchDeCollate : function(_id){
        return window.pouchCollate.parseIndexableString(_id);
    }

    ,deleteLocalDB : function(){
        //DELETE LOCAL USER DB
        datastore.emptyUsersDB();

        //DELETE LOCAL PROJECT DB
        app.cache.localprojdb.destroy().then(function (response) {
            console.log("DELETEING local proj db");
            app.cache.localprojdb       = datastore.startupDB(config["database"]["proj_local"]);
        }).catch(function (err) {
            console.log(err);
        });
        return;
    }

    ,emptyUsersDB : function(){
        //DELETE LOCAL DBs
        app.cache.localusersdb.destroy().then(function (response) {
            console.log("EMPTYING local users db = DELETING, THEN RESTARTING");
            app.cache.localusersdb    = datastore.startupDB(config["database"]["users_local"]); 
        }).catch(function (err) {
            console.log(err);
        });
        return;
    }
};

