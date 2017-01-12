var datastore = {
    db : null

    ,startupDB: function(dbname){
        var db  = new PouchDB(dbname, {iosDatabaseLocation: 'default', auto_compaction: true});
        if (!db.adapter) {
          db = new PouchDB(dbname);
        }
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
            app.log(res["rows"]);
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
            datastore.showError(err);
        });
    }

    ,liveDB : function(db){
        //DONT NEED THIS CAUSE THE OTHER LIVE SYNCS HAVE "change" EVENT TRIGGER TOO
        db.changes({
             since    : 'now'
            ,live     : true
        }).on('change', function(){
            app.log("liveDB().on(change)");
        }).catch(function (err) {
            app.log("ERROR liveDB()");
            datastore.showError(err);
        });
    }

    ,twoWaySyncDB : function(localdb_obj,remotedb_str){
        localdb_obj.sync(remotedb_str, {
            live: true
        }).on('change', function (change) {
            app.log("twoWaySyncDB()on(change)");
            app.log(change);
        }).on('uptodate',function(update){
            app.log("twoWaySyncDB()on(uptodate)");
            app.log(update);
        }).catch(function (err) {
            app.log("ERROR twoWaySyncDB():");
            datastore.showError(err);
        });
    }

    ,localSyncDB : function(localdb_obj,remotedb_str){
        //'complete', 'active', 'paused', 'change', 'denied' and 'error'
        localdb_obj.replicate.to(remotedb_str,{
            // live: true
            filter: function(doc){
                return !doc.uploaded
            }
        }).on('active',function(){
            // not very useful
        }).on('complete', function (info) {
            // console.log("COMPLETE CALLBACK");
            // console.log(info["ok","start_time","docs_read","docs_written","doc_write_failures","errors","last_seq","status","end_time"]);
            // console.log("docs_read : "+info["docs_read"]);
            // console.log("docs_written : "+info["docs_written"]);
            if(info["ok"] && info["status"] == "complete"){
                $("#datastatus i").addClass("synced");
            }else{
                $("#datastatus i").removeClass("synced");
            }
        }).on('change',function(info){
            //THIS IS MORE VALUABLE THAN "complete"
            //ACTUAL DETAILS THE CHANGES MADE
            // console.log("CHANGE CALLBACK");
            // console.log(info["ok","start_time","docs_read","docs_written","doc_write_failures","errors","last_seq","docs"]);
            for(var i in info["docs"]){
                var changed_doc = info["docs"][i];
                var _id         = changed_doc["_id"];
                var _rev        = changed_doc["_rev"];
                app.cache.localusersdb.get(_id).then(function (doc) {
                    doc.uploaded = true;
                    app.cache.localusersdb.put(doc);
                    $("i[data-docid='"+_id+"']").addClass("uploaded");
                    $(".uploadbtn").removeClass("loading");
                }).catch(function (werr) {
                    app.log("ERROR UPDATING USER DATA " + _id);
                    datastore.showError(werr);
                });
            }

        }).catch(function (err) {
            // However, there is one gotcha with live replication: 
            // what if the user goes offline? In those cases, an error will be thrown 
            // and replication will stop.
            app.log("ERROR localSyncDB()");
            datastore.showError(err);
        });
    }

    ,remoteSyncDB : function(localdb_obj,remotedb_str){
        localdb_obj.replicate.from(remotedb_str,{
            // live: true
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
            // However, there is one gotcha with live replication: 
            // what if the user goes offline? In those cases, an error will be thrown 
            // and replication will stop.
            app.log("ERROR ON REPLICATING FROM REMOTE: " + remotedb_str);
            console.log(remotedb_str);
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
            app.log("DELETEING local proj db");
            app.cache.localprojdb       = datastore.startupDB(config["database"]["proj_local"]);
        }).catch(function (err) {
            app.log(err);
        });
        return;
    }

    ,emptyUsersDB : function(){
        //DELETE LOCAL DBs
        app.cache.localusersdb.destroy().then(function (response) {
            app.log("EMPTYING local users db = DELETING, THEN RESTARTING");
            app.cache.localusersdb    = datastore.startupDB(config["database"]["users_local"]); 
        }).catch(function (err) {
            app.log(err);
        });
        return;
    }
};

