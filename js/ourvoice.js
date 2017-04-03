var ourvoice = {
    adminSetup : function(){
        app.cache.admin_pass = null;
        $("#main").addClass("loaded");
        app.transitionToPanel($("#step_setup")); 
        return;
    }

    ,adminView: function(rows){
        rows.reverse();
        $("#list_data tbody").empty();
        for(var i in rows){
            var r_d     = rows[i]["doc"];
            var synced  = r_d.hasOwnProperty("uploaded") ? 1 : 0;
            var r_id    = r_d["_id"];
            var r_rev   = r_d["_rev"];
            var temp    = r_id.split("_");

            var r_proj  = temp[0];
            var r_uid   = temp[2];
            var r_ts    = temp[3];

            var tr      = $("<tr>")
            var bb      = $("<td>").text(r_proj);
            var ii      = $("<td>").text(r_uid);
            var thumbs  = $("<i>").attr("data-docid",r_id);
            if(synced){
                thumbs.addClass("uploaded")
            }
            var up = $("<td>").append(thumbs);
            tr.append(bb);
            tr.append(ii);
            tr.append(up);

            $("#list_data tbody").append(tr);
        }

        return;
    }

    ,checkDirtyData: function(){
        app.cache.localusersdb.allDocs({
          include_docs: true
        }).then(function (res) {
            var rows        = res["rows"];
            rows.reverse();
            for(var i in rows){
                var r_d     = rows[i]["doc"];
                if(!r_d.hasOwnProperty("uploaded")){
                  $("#datastatus i").removeClass("synced");
                  break;  
                }
            }
        }).catch(function(err){
            app.log("ERROR checkDirtyData allDocs()");
            datastore.showError(err);
        });
    }

    ,getActiveProject : function(){
        app.cache.localprojdb.get("active_project", function(err,resp){
            if(err){
                if(err.status == '404'){
                    ourvoice.getAllProjects();
                    clearTimeout(app.cache.db_fail_timeout);
                }
            }
        }).then(function (doc) {
            //LOCAL DB ONLY, SET CURRENT ACTIVE PROJECT ARRAY KEY
            app.cache.active_project = doc;
        }).catch(function (err) {
            app.log("get active_project error : ",err);
        }).then(function(){
            //THIS WORKS AS A "FINALLY"
            ourvoice.getAllProjects();
            clearTimeout(app.cache.db_fail_timeout);
        });
    }
    
    ,getAllProjects : function(){
        //LOAD UP PROJECTS FROM LOCAL DB
        try{
            // PouchDB.debug.disable();
            app.cache.localprojdb.get("all_projects").then(function (doc) {
                app.cache.projects = doc;
                $("h3.loadfail").remove();

                //CHECK TO SEE IF THERE IS AN "active_project" SET YET
                if(app.cache.active_project.hasOwnProperty("i")){
                    //THIS DEVICE HAS BEEN SET UP TO USE A PROJECT
                    ourvoice.loadProject(app.cache.projects["project_list"][app.cache.active_project.i]);
                    ourvoice.checkDirtyData();
                    app.transitionToPanel($("#step_zero"));
                }else{
                    //SHOW ADMIN DEVICE SET UP 
                    ourvoice.adminSetup();
                    app.cache.history = [];
                }
            }).catch(function (err) {
                // ALL ERRORS (EVEN FROM .then() PROMISES) FLOW THROUGH TO BE CAUGHT HERE     
                app.log("NO PROJECTS IN LOCALDB, NOT SYNCING FROM REMOTE","ERROR");      

                //IF NO PROJECTS THEN PUT UP THIS LOADING ERROR
                var cantconnect = $("<h3>").addClass("loadfail").addClass("delete_on_reset").text("Sorry, unable to connect to server.  Please close the app and try later.");
                $(".title hgroup").append(cantconnect);
            });
        }catch(err){
            app.showNotif("This is embaressing", "Error during database syncronization.  Close this alert to try again.", function(){
                app.log("db sync failed, refreshing app to try again");
                // document.location = "index.html";
                window.location.reload(true);
            });
        }   
    }

    ,loadProject : function(project){
        var p = project;
        app.initCache();

        //SEARCH LOCAL USERS DB FOR USERS WITH PARTIAL COLLATED uuid + project_id
        //MAKE SURE TO UPDATE THIS , IF CHANGE THE ORDER OF INDEXING
        var partial_id  = datastore.pouchCollate([ app.cache.active_project["proj_id"], app.cache.uuid ]);
        var partial_end = partial_id + "\uffff";
        app.cache.localusersdb.allDocs({
            // IF NO OPTION, RETURN JUST _id AND _rev (FASTER)
             startkey   : partial_id
            ,endkey     : partial_end
        }).then(function (res) {
            //SET THE NEXT AVAILABLE USER OBJECT _id
            var time_stamp                      = Date.now();
            app.cache.active_project["proj_id"] = p["project_id"];
            app.cache.participant_id            = (res["rows"].length + 1);
            app.cache.next_id                   = datastore.pouchCollate([ app.cache.active_project["proj_id"], app.cache.uuid,   app.cache.participant_id, time_stamp]);
            app.cache.proj_thumbs               = p["thumbs"];

            //Display This Info
            $("#step_zero b.proj_name").text(p["project_name"]);
            $("#step_zero b.user_id").text(app.cache.participant_id);
            if(!app.cache.proj_thumbs){
                $("#pic_review li.good_or_bad").hide();
            }else{
                //TODO think of a better way to do this
                //SMILIES for #2 FOR NOW i guess
                if(app.cache.proj_thumbs == 2){
                    $("#pic_review li.good_or_bad .votes").addClass("smilies");
                }
                $("#pic_review li.good_or_bad").show();
            }

            $("select[name='language']").empty();
            for(var l in p["app_lang"]){
                var langoption  = p["app_lang"][l];
                var l_option    = $("<option>").val(langoption["lang"]).text(langoption["language"]);
                 $("select[name='language']").append(l_option);
            }
            ourvoice.updateLanguage(app.cache.active_project["proj_id"],"en");
        }).then(function(){
            $("select[name='language']").change(function(){
                //REAL TIME LANGUAGE TRANSLATION UPDATES
                var lang_id = $(this).val();
                ourvoice.updateLanguage(app.cache.active_project["proj_id"],lang_id);
                return false;
            });
        }).catch(function(err){
            app.log("loadProject allDocs", "Error");
            datastore.showError(err);
        });
    }

    ,updateLanguage : function(projid,lang){
        lang        = !lang ? "en" :lang;
        var project = app.cache.projects["project_list"][app.cache.active_project["i"]];
        var trans   = project["app_text"];
        
        //OK JUST REDO THE SURVEY EVERYTIME
        $("#survey fieldset").empty();
        survey.build(project["surveys"], lang);
        consent.build(project["consent"], lang);  
        if(project["project_id"] == projid){
            for(var n in trans){
                var kvpair      = trans[n];
                var translation = kvpair["val"].hasOwnProperty(lang) ? kvpair["val"][lang] : "";
                var datakey     = kvpair["key"];
                $("[data-translation-key='"+datakey+"']").text(translation);
            }   
        }
    }

    ,startWatch: function(freq) {
        //SAVE GEO TAGS FOR MAP
        ourvoice.watchPosition();
    }

    ,stopWatch: function(){
        navigator.geolocation.clearWatch(app.cache.positionTrackerId);
        app.cache.positionTrackerId = null;
    }
    
    ,watchPosition: function(){
        app.cache.positionTrackerId = navigator.geolocation.watchPosition(
            function(position){
                var acuracy = position.coords.accuracy;

                var curLat  = position.coords.latitude;
                var curLong = position.coords.longitude;

                var curpos = {
                     "lat"          : curLat
                    ,"lng"          : curLong
                    ,"accuracy"     : acuracy
                    ,"altitude"     : position.coords.altitude
                    ,"heading"      : position.coords.heading
                    ,"speed"        : position.coords.speed
                    ,"timestamp"    : position.timestamp
                };
                
                var curdist = app.cache.user.hasOwnProperty("currentDistance") ? app.cache.user.currentDistance : 0;
                var lastPos = app.cache.user.geotags.length > 0 ? app.cache.user.geotags[app.cache.user.geotags.length - 1] : {"lat" : curLat,"lng" : curLong};
                var prvLat  = lastPos.lat ;
                var prvLong = lastPos.lng ;
 
                if(app.cache.user.geotags.length == 0){
                    app.cache.user.geotags.push(curpos);
                }

                if(curLat != prvLat && curLong != prvLong){
                    app.cache.user.geotags.push(curpos); 
                    curdist     = curdist + utils.calculateDistance(prvLat, prvLong, curLat, curLong);
                    app.cache.user.currentDistance = curdist;
                }
                
                //SAVE THE POINTS IN GOOGLE FORMAT
                if(utils.checkConnection()){
                    app.cache.currentWalkMap.push(
                        new google.maps.LatLng(curLat, curLong)
                    );
                }
            }
            ,function(err){
                console.log(err);
            }
            ,{
                 enableHighAccuracy: true
                ,maximumAge        : 100
                ,timeout           : 5000
            });
    }

    ,tagLocation: function(add_to){
        //GEOLOCATION
        var curpos = {};
        navigator.geolocation.getCurrentPosition(function(position) {
            curpos.longitude    = position.coords.longitude;
            curpos.latitude     = position.coords.latitude;
            curpos.altitude     = position.coords.altitude;
            curpos.heading      = position.coords.heading;
            curpos.speed        = position.coords.speed;
            curpos.timestamp    = position.timestamp;
            add_to["geotag"]    = curpos;
        }, function(err){
            console.log(err);
        },{ 
              enableHighAccuracy: true
             ,maximumAge        : 100
             ,timeout           : 5000
        });
        return curpos;
    }

    ,plotGoogleMap: function(){
        if(!utils.checkConnection()){
            return;
        }
        // Create the map
        var myOptions = {
            zoom        : 32,
            center      : app.cache.currentWalkMap[0],
            mapTypeId   : google.maps.MapTypeId.ROADMAP
        }
        if(app.cache.curmap != null){
            var map             = app.cache.curmap;
        }else{
            var map             = new google.maps.Map(document.getElementById("google_map"), myOptions);
            app.cache.curmap    = map;
        }

        var latLngBounds    = new google.maps.LatLngBounds();
        var geopoints       = app.cache.currentWalkMap.length; 
        
        new google.maps.Marker({
            map: map,
            position: app.cache.currentWalkMap[0],
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: "#ffffff",
                strokeColor: "#0000FF",
                fillOpacity: 1

            },
            title: "Starting Point"
        });


        for(var i = 1; i < geopoints; i++) {
          latLngBounds.extend(app.cache.currentWalkMap[i]);
          // Place the marker
          new google.maps.Marker({
            map: map,
            position: app.cache.currentWalkMap[i],
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 1,
                fillColor: "#008800",
                strokeColor: "#0000FF",
                fillOpacity: 0.5

            },
            title: "Point " + (i + 1)
          });
        }

        // Creates the polyline object
        var polyline        = new google.maps.Polyline({
          map: map,
          path: app.cache.currentWalkMap,
          strokeColor: '#0000FF',
          strokeOpacity: 0.7,
          strokeWeight: 1
        });

        // Fit the bounds of the generated points
        map.fitBounds(latLngBounds);
        $("#distance").text(app.cache.user.currentDistance);
    }

    ,startPlaying : function(recordFileName){
        app.cache.audioObj[recordFileName].play();
        return;
    }

    ,stopPlaying : function(recordFileName){
        app.cache.audioObj[recordFileName].stop();
        app.cache.audioObj[recordFileName].release();
        return;
    }

    ,startRecording : function(photo_i,recordFileName){
        $("#audio_record").removeClass("playing");

        //THIS STARTS RECORDING ON THE MEDIA OBJECT
        app.cache.audioStatus = "recording";
        app.cache.audioObj[recordFileName].startRecord();
    
        //THIS IS FOR THAT FAKE RECORDING TIMER ON THE PAGE
        app.cache.audioTimer = setInterval(function(){
            var curtime = $("#audio_time").text();
            var splits  = curtime.split(":");
            var mins    = parseInt(splits[0]);
            var secs    = parseInt(splits[1]);
            var time    = mins*60 + secs;
            time++;

            var date = new Date(null);
            date.setSeconds(time);
            $("#audio_time").text(date.toISOString().substr(14,5));
        },1000);

        $("#soundwaves").removeClass("pause");
        $("#ctl_stop").data("photo_i",photo_i).data("recordFileName",recordFileName).removeClass("off");
        return;
    }

    ,stopRecording : function(photo_i,recordFileName){
        if (app.cache.audioObj[recordFileName] == null){
            return;
        }

        //STOP THAT FAKE TIMER
        clearInterval(app.cache.audioTimer);

        if (app.cache.audioStatus == 'recording') {
            app.cache.audioObj[recordFileName].stopRecord();
            console.log("Recording stopped");
        } else if (app.cache.audioStatus == 'playing') {
            app.cache.audioObj[recordFileName].stop();            
            console.log("Play stopped");
            app.cache.audioObj[recordFileName].release();
        } else if (app.cache.audioStatus == "stop_release"){
            //STOPS RECORDING ON MEDIA OBJECT
            app.cache.audioObj[recordFileName].stopRecord();
            
            //RESET FAKE TIMER
            $("#audio_time").text("00:00");

            //UPDATE THE GUI
            app.cache.user.photos[photo_i]["audio"]++;
            $(".mediaitem .audiorec[rel='"+photo_i+"']").addClass("hasAudio");
            $("#pic_review .daction.audio").addClass("hasAudio");
            ourvoice.drawSavedAudio(photo_i,recordFileName);

            //NOW SAVE IT AS AN INLINE ATTACHMENT
            var audio_i = !app.cache.user.photos[photo_i]["audio"] ? 0 : app.cache.user.photos[photo_i]["audio"];

            //NOW GET A HANDLE ON THE FILE AND SAVE IT TO POUCH
            app.cache.currentAudio.file(function(file) {
                console.log("last thing, we need to make sure this is saved properly to couch");
                        app.cache.user._attachments[recordFileName] = { "content_type": "audio/" + app.cache.audioformat , "data" : file };

                        //RECORD AUDIO ATTACHMENT 
                        datastore.writeDB(app.cache.localusersdb , app.cache.user);
                    }
                    ,function(err){
                        console.log(err);
                        // console.log("ERROR FILE");                
                    }
                );
        } else {
            // console.log("Nothing stopped");
        }

        $("#soundwaves").addClass("pause");

        $("#ctl_stop").addClass("off");
        $("#ctl_pause").addClass("off");
        
        $("#ctl_record").removeClass("off");
        $("#ctl_play").removeClass("off");
        app.cache.audioStatus = 'stopped';
    }

    ,recordAudio: function(photo_i,_callback){
        //without full path saves to documents/tmp or LocalFileSystem.TEMPORARY
        //Files can be recorded and played back using the documents URI: var myMedia = new Media("documents://beer.mp3")
        //IOS requires the file to be created if it doesnt exist.
        //ios requires .wav format, .mp3 for android
        
        var nex_audio_i     = !app.cache.user.photos[photo_i]["audio"] ? 0 : app.cache.user.photos[photo_i]["audio"];
        nex_audio_i++;
        var recordFileName  = "audio_"+photo_i+"_"+ nex_audio_i +"."+app.cache.audioformat;
        if(app.cache.platform == "iOS") {
            //first create file if not exist //IOS DIFFERENCE
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0
                ,function(fileSystem){
                    fileSystem.root.getFile(recordFileName
                        ,{
                            create    : true,
                            exclusive : false
                        }
                        ,function(fileEntry){
                            // [isFile,isDirectory,name,fullPath,filesystem,nativeURL
                            // ,constructor,createWriter,file,getMetadata,setMetadata
                            // ,moveTo,copyTo,toInternalURL,toURL,toNativeURL
                            // ,toURI,remove,getParent]
                            //PUT THIS ACTUAL FILE INTO CACHE, THEN WHEN STOPPED RECORDING STORE IT 
                            app.cache.currentAudio  = fileEntry; 
                            app.cache.audioObj[recordFileName] = new Media(recordFileName
                                ,function(){
                                    //FINISHED RECORDING
                                }
                                ,function(err){
                                    //RECORDING EROR
                                    console.log(err.code +  " : " + err.message);
                                }
                                ,function(){
                                    // STATUS CHANGE
                                }); //of new Media

                            //FILE CREATED, AVAIALBLE TO RECORD
                            ourvoice.startRecording(photo_i,recordFileName);
                        }
                        ,function(err){
                            console.log("IOS  ERROR CREATING MEDIA OBJECT");
                            console.log(err.code +  " : " + err.message);
                        }); //of getFile
                }
                ,function(){
                    // console.log("window.requestFileSystem  error()");
                }
            ); //of requestFileSystem
        }else{
            //cordova.file.dataDirectory
            //cordova.file.cacheDirectory
            //cordova.file.applicationDirectory
            //cordova.file.applicationStorageDirectory
            //cordova.file.externalApplicationStorageDirectory
            //cordova.file.externalDataDirectory
            //cordova.file.externalCacheDirectory
            //cordova.file.externalRootDirectory
            console.log("ANDROID")

            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
                dir.getFile(recordFileName ,{ create:true }
                    ,function(fileEntry) {
                        app.cache.currentAudio  = fileEntry; 
                        // app.cache.currentAudio.file(function(file) {
                        //         var cdvpath     = file["localURL"];
                        //         console.log(file);
                              
                                //THIS WILL BE THE MEDIA OBJECT THAT HAS THE PROPER METHODS FOR AUDIO RECORDIONG
                                //THIS SORT OF DOESNT BELONG HERE, TODO: REFACTOR THIS TO THE startrecording() function
                                app.cache.audioObj[recordFileName] = new Media(recordFileName
                                    ,function(){
                                        //FINISHED RECORDING
                                    }
                                    ,function(err){
                                        //RECORDING EROR
                                        console.log(err.code +  " : " + err.message);
                                    }
                                    ,function(){
                                        // STATUS CHANGE
                                    }); //of new Media
                                
                                console.log(app.cache.audioObj[recordFileName]);

                                //FILE CREATED, AVAIALBLE TO RECORD
                                ourvoice.startRecording(photo_i,recordFileName);
                        //     }
                        //     ,function(err){
                        //         console.log(err);
                        //         // console.log("ERROR FILE");                
                        //     }
                        // );
                    }
                    ,function(){
                         console.log("crap file not found or created");
                    }
                );
            });
        }

        if(typeof _callback == 'function'){
            _callback();
        }
        return;
    }

    ,clearAllAudio : function(){
        //CLEAN UP / RELEASE ALL THESE MEDIA OBJECTS FROM MEMORY
        for(var m in app.cache.audioObj){
            app.cache.audioObj[m].release();
            delete app.cache.audioObj[m];
        }
        return;
    }

    ,takePhoto: function(_callback){
        // take pic
        // save pic filename + geotag location
        navigator.camera.getPicture( 
            function(imageData){
                var fileurl = "data:image/jpeg;base64," + imageData;
                app.cache.user.photos.push({
                         "audio"    : false
                        ,"geotag"   : null 
                        ,"goodbad"  : null
                    });

                //make sure the audio gets the proper photo to save to
                var thispic_i   = app.cache.user.photos.length - 1;
                var geotag      = ourvoice.tagLocation(app.cache.user.photos[thispic_i]);

                //PREPARE ATTACHEMENT
                var attref      = "photo_" + thispic_i + ".jpg";
                app.cache.user._attachments[attref] = { "content_type": "image/jpeg" , "data" : imageData };
                
                //RECORD PHOTO DATAURL
                datastore.writeDB(app.cache.localusersdb , app.cache.user);

                //SET UP PHOTO PREVIEW PAGE
                ourvoice.previewPhoto(app.cache.user.photos[thispic_i], fileurl);

                //ADD LIST ITEM TO REVIEW PAGE
                setTimeout(function(){
                    ourvoice.addMediaItem(app.cache.user.photos[thispic_i], fileurl);
                },500);

                _callback();
            }
            ,function(err){
                console.log(err);
            }
            ,{ 
                 quality            : 50
                ,destinationType    : Camera.DestinationType.DATA_URL
                ,saveToPhotoAlbum   : false
                ,allowEdit          : false
            }
        );
        return;
    }

    ,previewPhoto: function(_photo,fileurl){
        var photo_i = app.cache.user.photos.indexOf(_photo);
        var goodbad = _photo["goodbad"];

        $("#pic_review a.vote").removeClass("on").removeClass("off");
        if(goodbad == 2){
            $("#pic_review a.vote.up").addClass("on");
        }else if(goodbad == 1){
            $("#pic_review a.vote.down").addClass("on");
        }else if(goodbad == 3){
            $("#pic_review a.vote.up").addClass("on");
            $("#pic_review a.vote.down").addClass("on");
        }

        $(".daction.audio, .record_another").data("photo_i",photo_i);
        if(_photo["audio"]){
            $(".daction.audio").addClass("hasAudio");

            //SET UP THE EXTRA AUDIO
            ourvoice.drawSavedAudio(photo_i,fileurl);
        }else{
            $(".daction.audio").removeClass("hasAudio");
        }

        $("#pic_review a.trashit").data("photo_i",photo_i).attr("rel",photo_i);
        $("#pic_review a.vote").data("photo_i",photo_i).attr("rel",photo_i);
        $("#recent_pic").attr("src",fileurl);
        return;
    }

    ,drawSavedAudio : function(photo_i,recordFileName){
        $("#saved_audio .saved").remove();
        var audio_i = !app.cache.user.photos[photo_i]["audio"] ? 0 : app.cache.user.photos[photo_i]["audio"];
        for(var i = audio_i; i > 0; i--){
            var offset          = i;
            var recordFileName  = "audio_"+photo_i+"_"+i+"."+app.cache.audioformat;
            var duration        = Math.ceil(app.cache.audioObj[recordFileName]["_duration"]) * 1000;
            var playlink        = $("<a>").addClass("saved").attr("rel",recordFileName).attr("duration",duration).attr("href","#").text(offset);
           
            playlink.click(function(){
                var recordFilename = $(this).attr("rel");
                
                if($(this).hasClass("playing")){
                    $(this).removeClass("playing");
                    ourvoice.stopPlaying(recordFilename);

                    clearTimeout(app.cache.playbackTimers[recordFileName] );
                    app.cache.playbackTimers[recordFileName] = null;
                }else{
                    $(this).addClass("playing");
                    ourvoice.startPlaying(recordFilename);

                    app.cache.playbackTimers[recordFileName] = setTimeout(function(){
                         $(this).removeClass("playing");
                    }, duration);
                }
                return false;
            });
            $("#saved_audio").prepend(playlink);
        }
        return;
    }

    ,addMediaItem:function(_photo,fileurl){
        var photo_i     = app.cache.user.photos.indexOf(_photo);
        var tmstmp      = "";
        if(utils.checkConnection()){
            var geotag      = _photo["geotag"];
            var time        = !geotag ? "n/a" : utils.readableTime(geotag.timestamp);
            tmstmp          = "@ " + time;
        }
        //NOW ADD THIS TO THE VIEW #mediacaptured
        var newitem     = $("<li>").addClass("mediaitem").addClass("photo_"+photo_i);
        var newlink     = $("<a>").addClass("previewthumb").attr("href","#").data("photo_i",photo_i).attr("rel",photo_i).html($("<span>").text(tmstmp));
        var newthum     = $("<img>").attr("src",fileurl);
        
        newlink.prepend(newthum);
        newitem.append(newlink);
        
        var trash       = $("<a>").addClass("trashit").attr("href","#").data("photo_i",photo_i).html("&#128465;");
        
        //SAVE MAYBE BRING BACK LATER
        // var audiorec    = $("<a>").attr("href","#").addClass("audiorec").data("photo_i",photo_i).attr("rel",photo_i).attr("data-next","audio_record");
        // if(_photo["audio"]){
        //     //IF HAS AUDIO THEN SHOW PLAY BUTTON
        //     audiorec.addClass("hasAudio");
        // }
        // newitem.append(audiorec);
        
        // if(app.cache.proj_thumbs ){
        //     var thumbs      = $("<div>").addClass("votes");
        //     var thumbsup    = $("<a>").attr("href","#").addClass("vote").addClass("up").data("photo_i",photo_i).attr("rel",photo_i);
        //     var thumbsdown  = $("<a>").attr("href","#").addClass("vote").addClass("down").data("photo_i",photo_i).attr("rel",photo_i);
        //     thumbs.append(thumbsup);
        //     thumbs.append(thumbsdown);
        //     newitem.append(thumbs);
        // }
        newitem.append(trash);

        $(".nomedia").hide();
        newitem.addClass("delete_on_reset");
        $("#mediacaptured").append(newitem);

        var pic_count   = $(".mi_slideout b").text();
        pic_count       = parseInt(pic_count) + 1;
        $(".mi_slideout b, .done_photos b").text(pic_count);
        return;
    }

    ,deletePhoto: function(_photo){
        navigator.notification.confirm(
            'This will delete the photo and any attached audio recordings. Click \'Confirm\' to proceed.', // message
             function(i){
                if(i == 1){
                    //the button label indexs start from 1 = 'Cancel'
                    return;
                }
                var photo_i = app.cache.user.photos.indexOf(_photo);
                app.cache.user.photos[photo_i] = null;
                delete app.cache.user._attachments["photo_"+photo_i+".jpg"];
                
                for(var filekey in app.cache.user._attachments){
                    if(filekey.indexOf("audio_"+photo_i+"_") > -1){
                        delete app.cache.user._attachments[filekey];
                    }
                }

                $("#mediacaptured a[rel='"+photo_i+"']").parents(".mediaitem").fadeOut("medium").delay(250).queue(function(next){
                    $(this).remove();
                    var pic_count   = $(".mi_slideout b").text();
                    pic_count       = parseInt(pic_count) - 1;
                    $(".mi_slideout b").text(pic_count);

                    //RECORD DELETED PHOTO
                    datastore.writeDB(app.cache.localusersdb , app.cache.user);
                    next();
                });
             },            // callback to invoke with index of button pressed
            "Delete this photo?",           // title
            ['Cancel','Confirm']     // buttonLabels
        );
        return;
    }

    ,syncLocalData: function(){
        $("#datastatus i").removeClass("synced");
        datastore.localSyncDB(app.cache.localusersdb, app.cache.remoteusersdb, function(info){
            if(info.hasOwnProperty("status")){
                //.onComplete
                if(info["ok"] && info["status"] == "complete"){
                    $("#datastatus i").addClass("synced");
                    // datastore.emptyUsersDB();
                }else{
                    $("#datastatus i").removeClass("synced");
                }
            }else{
                //.onChange
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
                        app.log("syncLocalData error UPDATING USER DATA " + _id, Error);
                        datastore.showError(werr);
                    });
                }
            }
        });  
        datastore.localSyncDB(app.cache.locallogdb, app.cache.remotelogdb, function(info){
            if(info.hasOwnProperty("status")){
                datastore.emptyLogsDB();
                console.log("local logs synced and deleted");
            }
        }); 
    }

    ,finished : function(){
        app.initCache();
        ourvoice.syncLocalData();
        $("nav").show();
        $(".mi_slideout").removeClass("reviewable");
        app.log("PARTICIPANT FINISHED AND USER OBJECT SAVED");
    }

    ,resetDevice : function(){
        $(".loaded").removeClass("loaded");
        $(".mi_slideout b").text(0);
        $(".nomedia").show();
        $(".delete_on_reset").remove();
        app.initCache();
        app.log("RESETING DEVICE STATE");
        return;
    }
};
