var datastore = {
    db : null

    ,startupDB: function(dbname){
        // PHONEGAP UI DOES NOT USE SQLite Plugin
        var db  = new PouchDB(dbname, {iosDatabaseLocation: 'default', auto_compaction: true, adapter: 'cordova-sqlite'});
        if (!db.adapter) {
          db = new PouchDB(dbname);
        }
        return db;
    }

    ,deleteDB : function(db,_callback){
        //COMPACT AND DESTROY A DB
        if(db){
            db.compact().then(function (response) {
                db.destroy().then(function (response) {
                    app.log(db.name + " compacted and destroyed");
                    _callback();
                }).catch(function (err) {
                    app.log("destroy :" + err, "Error");
                });
            }).catch(function (err) {
                app.log("compact : " + err, "Error");
            });
        }
    }

    ,getDB : function(db,_id,assign_to_this){
        db.get(_id).then(function (doc) {
            assign_to_this = doc;
        }).catch(function (err) {
            app.log("ERROR getDB(): " + _id, "Error");
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
            app.log("ERROR getAll()", "Error");
        });
    }

    ,writeDB : function(db,_o){
        db.put(_o).then(function (new_o) {
            var _rev    = new_o.rev;
            _o._rev     = _rev;
            if(_o.hasOwnProperty("_attachments")){
                app.cache.attachment["_rev"] = _rev;
            }
            app.log("JSON OBJECT SUCCESFULLY SAVED : " + _o._id + " , rev : " + _o._rev);
        }).catch(function (err) {
            app.log("ERROR WRITING TO A DB", "Error");
            datastore.showError(err);
        });
    }

    ,addAttachment : function(db, _id, _rev, attachmentId , attachment, content_type){
        db.putAttachment(_id, attachmentId, _rev, attachment, content_type).then(function(result) {
          // handle result
          app.cache.attachment["_rev"] = result.rev;
          console.log("attachment "+attachmentId+" attached to " + _id + " with rev : " + result.rev);
        }).catch(function (err) {
          console.log(err);
        });
    }

    ,removeAttachment : function(db, _id, _rev, attachmentId, _callback){
        db.removeAttachment(_id, attachmentId, _rev).then(function(result) {
          // handle result
          app.cache.attachment["_rev"] = result.rev;
          _callback(db, _id, result.rev);
          console.log("attachment "+attachmentId+" removed from " + _id + " with rev : " + result.rev);
        }).catch(function (err) {
          console.log(err);
        });
    }

    ,localSyncDB : function(localdb_obj,remotedb_str, _callBack){
        //'complete', 'active', 'paused', 'change', 'denied' and 'error'
        localdb_obj.replicate.to(remotedb_str,{
            // live: true
            filter: function(doc){
                return !doc.uploaded
            }
        }).on('active',function(){
            // not very useful
        }).on('complete', function (info) {
            // console.log(info["ok","start_time","docs_read","docs_written","doc_write_failures","errors","last_seq","status","end_time"]);
            // console.log("docs_read : "+info["docs_read"]);
            // console.log("docs_written : "+info["docs_written"]);
            _callBack(info);
        }).on('change',function(info){
            //THIS IS MORE VALUABLE THAN "complete"
            //ACTUAL DETAILS THE CHANGES MADE
            // console.log("CHANGE CALLBACK");
            // console.log(info["ok","start_time","docs_read","docs_written","doc_write_failures","errors","last_seq","docs"]);
            // _callBack(info);
        }).catch(function (err) {
            // However, there is one gotcha with live replication: 
            // what if the user goes offline? In those cases, an error will be thrown 
            // and replication will stop.
            app.log("ERROR localSyncDB()", "Error");
        });
    }

    ,remoteSyncDB : function(localdb_obj,remotedb_str, _callBack){
        localdb_obj.replicate.from(remotedb_str,{
            // live: true
        }).on('complete', function (wut) {
            console.log("REPLICATION (COMPLETE) FROM " + remotedb_str);
            _callBack();
        }).on('change',function(change){
            console.log("REPLICATION (CHANGE) FROM " + remotedb_str);
            _callBack();
        }).on('uptodate',function(update){
            console.log("REPLICATION (UPTODATE) FROM " + remotedb_str);
            _callBack();
        }).catch(function (err) {
            // However, there is one gotcha with live replication: 
            // what if the user goes offline? In those cases, an error will be thrown 
            // and replication will stop.
            
            // ourvoice.deleteLocalDB();
            // setTimeout(function(){
            //     datastore.remoteSyncDB(localdb_obj, remotedb_str, _callBack);
            // },3000);

            app.log("ERROR ON REPLICATING FROM REMOTE: " + remotedb_str);
            app.log(err);
        });
    }

    ,liveDB : function(db){
        //DONT NEED THIS CAUSE THE OTHER LIVE SYNCS HAVE "change" EVENT TRIGGER TOO
        db.changes({
             since    : 'now'
            ,live     : true
        }).on('change', function(){

        }).catch(function (err) {
            app.log("ERROR liveDB()", "Error");
        });
    }

    ,twoWaySyncDB : function(localdb_obj,remotedb_str){
        localdb_obj.sync(remotedb_str, {
            live: true
        }).on('change', function (change) {
        }).on('uptodate',function(update){
        }).catch(function (err) {
            app.log("ERROR twoWaySyncDB():");
        });
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

    // ,pouchDeCollate : function(_id){
    //     return window.pouchCollate.parseIndexableString(_id);
    // }    
};

