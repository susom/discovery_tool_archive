var datastore = {
    db : null

    ,startupDB: function(dbname){
        var db  = new PouchDB(dbname, {iosDatabaseLocation: 'default', auto_compaction: true});
        app.log(dbname + " DB GOT");
        return db;
    }

    ,destroyDB : function(dbname){
        new PouchDB(dbname).destroy().then(function (){
          console.log("DATABASE DESTROYED: " + dbname);
        }).catch(function (err) {
          console.log("ERROR destroyDB():");
          datastore.showError(err);
        });
    }

    ,getDB : function(db,_id,assign_to_this){
        db.get(_id).then(function (doc) {
            console.log(doc);
            assign_to_this = doc;
        }).catch(function (err) {
            console.log("ERROR getDB():");
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
            // //inefficient
            // ,skip  : 5
            // ,descending : true
            // ,key : 'id01'
            // ,keys : ['id01','id02']
        }).then(function (res) {
            console.log(res["total_rows"]);
            console.log(res["offset"]);
            utils.dump(res["rows"]);
        }).catch(function(err){
            console.log("ERROR getAll():");
            datastore.showError(err);
        });
    }

    ,writeDB : function(db,_o){
        db.put(_o).then(function (new_o) {
            var _rev = new_o.rev;
            _o._rev = _rev;
            // console.log("new rev");
            // console.log(_rev);
            app.log("JSON OBJECT SUCCESFULLY SAVED");
            console.log('Successfully saved a json object?');

        }).catch(function (err) {
            app.log("ERROR WRITING TO A DB");
            console.log("ERROR writeDB():");
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
            console.log("ERROR liveDB():");
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
            console.log("REPLICATED TO REMOTE!");
        }).on('change',function(change){
            console.log("REPLICATE TO , CHANGE, SYNC!")
        }).on('uptodate',function(update){
            console.log("REPLICATION TO DONE");
        }).catch(function (err) {
            console.log("ERROR localSyncDB():");
            datastore.showError(err);
        });
    }

    ,remoteSyncDB : function(localdb_obj,remotedb_str){
        localdb_obj.replicate.from(remotedb_str,{
            live: true
        }).on('complete', function (wut) {
            app.log("REPLICATED FROM REMOTE");
            console.log("REPLICATED FROM REMOTE!");
            ourvoice.getAllProjects();
        }).on('change',function(change){
            app.log("REPLICATED FROM REMOTE : CHANGE AND SYNC");
            console.log("REPLICATE FROM REMOTE PROJECTS DB, CHANGE, SYNC! , SO REINITIALiZE APP?");
            ourvoice.getAllProjects();
        }).on('uptodate',function(update){
            console.log("REPLICATION FROM DONE");
            ourvoice.getAllProjects();
        }).catch(function (err) {
            app.log("ERROR ON REPLICATING FROM REMOTE");
            console.log("ERROR remoteSyncDB( WHAT? ):");
            datastore.showError(err);
        });
    }

    ,addAttachment : function(_o, media){
        // URL.createObjectURL();  converts base64 image into imgsrc
    }

    ,showError : function(e){
        // utils.dump(e);
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
        //DELETE LOCAL DBs
        app.cache.localusersdb.destroy().then(function (response) {
            console.log("EMPTYING local users db = DELETING, THEN RESTARTING");
            app.cache.localusersdb    = datastore.startupDB(config["database"]["users_local"]); 
        }).catch(function (err) {
            console.log(err);
        });

        app.cache.localprojdb.destroy().then(function (response) {
            console.log("DELETEING local proj db");
            app.cache.localprojdb   = datastore.startupDB(config["database"]["proj_local"]);
        }).catch(function (err) {
            console.log(err);
        });

        app.log("DELETING LOCAL DATABASES");
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

        app.log("DELETING LOCAL DATABASES");
        return;
    }
};

