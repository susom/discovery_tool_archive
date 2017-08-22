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
        var numwalks = rows.length;
        for(var i in rows){
            var r_d     = rows[i]["doc"];
            var synced  = r_d.hasOwnProperty("uploaded") ? 1 : 0;
            var r_id    = r_d["_id"];
            var truncid = r_id.substr(r_id.length - 4);

            var picount = 0;
            for(var p in r_d["photos"]){
                var pic = r_d["photos"][p];
                if(pic["audio"]){
                    picount += parseInt(pic["audio"]);
                }
            }

            var tr      = $("<tr>")
            var walknum = $("<td>").text(numwalks - parseInt(i));
            truncid     = $("<td>").text(truncid);
            var pics    = $("<td>").text(r_d["photos"].length);
            var audio   = $("<td>").text(picount);
            var thumbs  = $("<i>").attr("data-docid",r_id);
            var reset   = $("<td>");
            reset.append($("<a>").addClass("resync").attr("data-docid",r_id).text('reset'));

            if(synced){
                tr.addClass("uploaded");
                thumbs.addClass("uploaded");
            }
            var up = $("<td>").append(thumbs);

            tr.append(walknum);
            tr.append(truncid);
            tr.append(pics);
            tr.append(audio);
            tr.append(up);
            tr.append(reset);

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

    ,newUserSession : function(){
        var session_count                           = app.cache.user.length;
        app.cache.current_session                   = session_count;
        app.cache.user[app.cache.current_session]   = {
                                                         "_id"                  : null
                                                        ,"_attachments"         : {}
                                                        ,"project_id"           : null
                                                        ,"user_id"              : null
                                                        ,"lang"                 : null
                                                        ,"photos"               : []
                                                        ,"geotags"              : []
                                                        ,"survey"               : []
                                                        ,"device"               : null
                                                    };
        app.initCache();
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
            console.log(err);
            app.log("get active_project error : ");
            app.log(err);
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
                     // $("#main").addClass("loaded");
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

        $("body").removeClass().addClass(lang); 
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
        //NO SLEEP DURING WALK
        window.plugins.insomnia.keepAwake();

        //SAVE GEO TAGS FOR MAP
        ourvoice.watchPosition();
    }

    ,stopWatch: function(){
        //ALLOW SLEEP
        window.plugins.insomnia.allowSleepAgain();

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
                
                var curdist = app.cache.user[app.cache.current_session].hasOwnProperty("currentDistance") ? app.cache.user[app.cache.current_session].currentDistance : 0;
                var lastPos = app.cache.user[app.cache.current_session].geotags.length > 0 ? app.cache.user[app.cache.current_session].geotags[app.cache.user[app.cache.current_session].geotags.length - 1] : {"lat" : curLat,"lng" : curLong};
                var prvLat  = lastPos.lat ;
                var prvLong = lastPos.lng ;
 
                if(app.cache.user[app.cache.current_session].geotags.length == 0){
                    app.cache.user[app.cache.current_session].geotags.push(curpos);
                }

                if(curLat != prvLat && curLong != prvLong){
                    app.cache.user[app.cache.current_session].geotags.push(curpos); 
                    curdist     = curdist + utils.calculateDistance(prvLat, prvLong, curLat, curLong);
                    app.cache.user[app.cache.current_session].currentDistance = curdist;
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
        $("#distance").text(app.cache.user[app.cache.current_session].currentDistance);
    }

    ,startPlaying : function(recordFileName){
        app.cache.audioObj[recordFileName].play();
        return;
    }

    ,stopPlaying : function(recordFileName){
        app.cache.audioObj[recordFileName].stop();
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
            app.cache.user[app.cache.current_session].photos[photo_i]["audio"]++;
            $(".mediaitem .audiorec[rel='"+photo_i+"']").addClass("hasAudio");
            $("#pic_review .daction.audio").addClass("hasAudio");
            
            console.log(app.cache.audioObj[recordFileName]);
            ourvoice.drawSavedAudio(photo_i,recordFileName);

            //NOW SAVE IT AS AN INLINE ATTACHMENT
            var audio_i = !app.cache.user[app.cache.current_session].photos[photo_i]["audio"] ? 0 : app.cache.user[app.cache.current_session].photos[photo_i]["audio"];

            if(app.cache.platform == "iOS"){
                //NOW GET A HANDLE ON THE FILE AND SAVE IT TO POUCH
                app.cache.currentAudio.file(function(file) {
                    console.log("last thing, we need to make sure this is saved properly to couch");
                            app.cache.user[app.cache.current_session]._attachments[recordFileName] = { "content_type": "audio/" + app.cache.audioformat , "data" : file };

                            //RECORD AUDIO ATTACHMENT 
                            datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);
                        }
                        ,function(err){
                            console.log(err);
                            // console.log("ERROR FILE");                
                        }
                    );
            }else{
                //ANDROID IS HANDLED IN THE MEDIA OBJECT COMPLETE CALLBACK
            }
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
        
        var nex_audio_i     = !app.cache.user[app.cache.current_session].photos[photo_i]["audio"] ? 0 : app.cache.user[app.cache.current_session].photos[photo_i]["audio"];
        nex_audio_i++;

        var some_timestamp  = Date.now();
        var recordFileName  = "audio_"+photo_i+"_"+ nex_audio_i + "."+app.cache.audioformat;
        var actualFileName  = "audio_"+photo_i+"_"+ nex_audio_i + "_" + some_timestamp + "."+app.cache.audioformat;
        if(app.cache.platform == "iOS") {
            //first create file if not exist //IOS DIFFERENCE
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0
                ,function(fileSystem){
                    fileSystem.root.getFile(actualFileName
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
                            app.cache.audioObj[recordFileName] = new Media(actualFileName
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
            app.cache.audioObj[recordFileName] = new Media( actualFileName
                ,function(){
                    //FINISHED RECORDING
                    // console.log("MEDIA FINISHED RECORDING, NOW USE FILE SYSTEM TO GET THE FILE?");
                    // console.log(this);

                    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
                        dir.getFile(actualFileName, {} 
                            ,function(fileEntry) {

                                fileEntry.file(function(file) {
                                        var cdvpath = file["localURL"];
                                        // console.log("file",file);

                                        //NOW GET A HANDLE ON THE FILE AND SAVE IT TO POUCH
                                        // console.log("last thing, we need to make sure this is saved properly to couch");
                                        app.cache.user[app.cache.current_session]._attachments[recordFileName] = { "content_type": file.type , "data" : file };

                                        //RECORD AUDIO ATTACHMENT 
                                        datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);
                                    }
                                    ,function(err){ console.log(err); }
                                );
                            }
                            ,function(){ console.log("cordova.file.externalRootDirectory crap file not found or created"); }
                        );
                    });
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
        }

        if(typeof _callback == 'function'){
            _callback();
        }
        return;
    }

    ,drawSavedAudio : function(photo_i,recordFileName){
        $("#saved_audio .saved").remove();
        var audio_i = !app.cache.user[app.cache.current_session].photos[photo_i]["audio"] ? 0 : app.cache.user[app.cache.current_session].photos[photo_i]["audio"];
        for(var i = audio_i; i > 0; i--){
            var offset          = i;
            var recordFileName  = "audio_"+photo_i+"_"+i+"."+app.cache.audioformat;
            
            var duration        = Math.ceil(app.cache.audioObj[recordFileName]["_duration"]) * 1000;
            duration            = duration < 0 ? 6000 : duration;
            
            var playlink        = $("<a>").addClass("saved").attr("rel",recordFileName).attr("duration",duration).attr("href","#").text(offset);
            
            playlink.click(function(){
                var recordFileName  = $(this).attr("rel");

                if($(this).hasClass("playing")){
                    $(this).removeClass("playing");
                    ourvoice.stopPlaying(recordFileName);
                    clearTimeout(app.cache.playbackTimer);
                }else{
                    $(this).addClass("playing");
                    ourvoice.startPlaying(recordFileName);

                    app.cache.playbackTimer = setTimeout(function(){
                         $("a.saved.playing").removeClass("playing");
                    }, duration);
                }
                return false;
            });
            $("#saved_audio").prepend(playlink);
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
                app.cache.user[app.cache.current_session].photos.push({
                         "audio"    : false
                        ,"geotag"   : null 
                        ,"goodbad"  : null
                    });

                //make sure the audio gets the proper photo to save to
                var thispic_i   = app.cache.user[app.cache.current_session].photos.length - 1;
                var geotag      = ourvoice.tagLocation(app.cache.user[app.cache.current_session].photos[thispic_i]);

                //PREPARE ATTACHEMENT
                var attref      = "photo_" + thispic_i + ".jpg";
                app.cache.user[app.cache.current_session]._attachments[attref] = { "content_type": "image/jpeg" , "data" : imageData };
                
                //RECORD PHOTO DATAURL
                datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);

                //SET UP PHOTO PREVIEW PAGE
                ourvoice.previewPhoto(app.cache.user[app.cache.current_session].photos[thispic_i], fileurl);

                //ADD LIST ITEM TO REVIEW PAGE
                setTimeout(function(){
                    ourvoice.addMediaItem(app.cache.user[app.cache.current_session].photos[thispic_i], fileurl);
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
        var photo_i = app.cache.user[app.cache.current_session].photos.indexOf(_photo);
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

    ,addMediaItem:function(_photo,fileurl){
        var photo_i     = app.cache.user[app.cache.current_session].photos.indexOf(_photo);
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
                var photo_i = app.cache.user[app.cache.current_session].photos.indexOf(_photo);
                app.cache.user[app.cache.current_session].photos[photo_i] = null;
                delete app.cache.user[app.cache.current_session]._attachments["photo_"+photo_i+".jpg"];
                
                for(var filekey in app.cache.user[app.cache.current_session]._attachments){
                    if(filekey.indexOf("audio_"+photo_i+"_") > -1){
                        delete app.cache.user[app.cache.current_session]._attachments[filekey];
                    }
                }

                $("#mediacaptured a[rel='"+photo_i+"']").parents(".mediaitem").fadeOut("medium").delay(250).queue(function(next){
                    $(this).remove();
                    var pic_count   = $(".mi_slideout b").text();
                    pic_count       = parseInt(pic_count) - 1;
                    $(".mi_slideout b").text(pic_count);

                    //RECORD DELETED PHOTO
                    datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);
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
        window.plugins.insomnia.keepAwake();

        datastore.localSyncDB(app.cache.localusersdb, app.cache.remoteusersdb, function(info){
            if(info.hasOwnProperty("status")){
                //.onComplete
                if(info["ok"] && info["status"] == "complete"){
                    $("#datastatus i").addClass("synced");
                   
                   setTimeout(function(){
                        $(".uploading").removeClass("uploading");
                   },1500);
                    
                    ourvoice.clearAllAudio();
                    // datastore.emptyUsersDB();

                    window.plugins.insomnia.allowSleepAgain();
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

                        $("i[data-docid='"+_id+"']").closest("tr").addClass("uploaded");
                        $("i[data-docid='"+_id+"']").addClass("uploaded");
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
        //THIS COMES FROM LAST SURVEY PAGE
        
        var dist_walked     = Math.round(parseFloat(app.cache.user[app.cache.current_session]["currentDistance"]) * 10) / 10;
        var photos_took     = app.cache.user[app.cache.current_session]["photos"].length;
        var audios_recorded = 0;
        for(var i in app.cache.user[app.cache.current_session]["photos"]){
            var photo = app.cache.user[app.cache.current_session]["photos"][i];
            if(photo["audio"]){
                audios_recorded += parseInt(photo["audio"]);
            }
        }
        $("#dist_walked b").text(dist_walked + " mi.");
        $("#photos_took b").text(photos_took);
        $("#audios_recorded b").text(audios_recorded);
        
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

        app.log("RESETING DEVICE STATE");
        return;
    }

    ,androidInternalMemory : function(){    
        var ts = Date.now();
        var actualFileName = ts+"_where_is_my_file.amr";
        var actualFileName = "cdvfile://localhost/sdcard/"+ts+"_where_is_my_file.amr";
        var recordFileName = actualFileName;
        console.log(actualFileName);
        console.log(cordova.file.externalRootDirectory);
        
        app.cache.audioObj[recordFileName] = new Media( actualFileName
            ,function(){
                //FINISHED RECORDING
                console.log("MEDIA FINISHED RECORDING, NOW USE FILE SYSTEM TO GET THE FILE?");
                console.log(app.cache.audioObj[recordFileName]);
                
                app.cache.audioObj[recordFileName].play();
                app.cache.audioObj[recordFileName].release();

                console.log("did it play?");
                
                function gotFS(fileSystem) {
                    var reader = fileSystem.root.createReader();
                    reader.readEntries(gotList, function(err){
                        console.log(err);
                    });    
                }

                function gotList(entries) {
                    var i;
                    for (i=0; i<entries.length; i++) {
                       console.log(entries[i].fullPath);
                    }
                }
                window.requestFileSystem(cordova.file.externalRootDirectory, 0, gotFS, function(err){
                    console.log(err);
                });
                // //GET DIRECTORY
                // window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
                //     console.log(dir);
                //     //GET FILE WITHIN DIR
                //     dir.getFile(actualFileName, {} 
                //         ,function(fileEntry) {
                //             fileEntry.file(function(file) {
                //                     var cdvpath = file["localURL"];
                //                     console.log("cordova.file.externalRootDirectory");
                //                     console.log(file);
                //                 }
                //                 ,function(err){ console.log(err); }
                //             );
                //         }
                //         ,function(){ 
                //             console.log("cordova.file.externalRootDirectory file not found or created"); 
                //         }
                //     );
                // });
               

            }
            ,function(err){
                //RECORDING EROR
                console.log(err.code +  " : " + err.message);
            }
            ,function(info){
                // STATUS CHANGE
                console.log(info);
                console.log("media status change");
        }); //of new Media


        console.log("recording");
        app.cache.audioObj[recordFileName].startRecord();

        setTimeout(function(){
            console.log("stop recording");
            app.cache.audioObj[recordFileName].stopRecord();
         },5000);



        return;

        // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(dir) {
        //     console.log(dir);
        //     dir.root.getFile(actualFileName, { create: true, exclusive: false } 
        //         ,function(fileEntry) {
        //             fileEntry.file(function(file) {
        //                     var cdvpath = file["localURL"];
        //                     console.log("LocalFileSystem.PERSISTENT");
        //                     console.log(file);
        //                 }
        //                 ,function(err){ console.log(err); }
        //             );
        //         }
        //         ,function(){ 
        //             console.log("LocalFileSystem.PERSISTENT file not found or created"); 
        //         }
        //     );
        // });

        // window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
        //     dir.getFile(actualFileName, {} 
        //         ,function(fileEntry) {
        //             fileEntry.file(function(file) {
        //                     var cdvpath = file["localURL"];
        //                     console.log("cordova.file.externalRootDirectory");
        //                     console.log(file);
        //                 }
        //                 ,function(err){ console.log(err); }
        //             );
        //         }
        //         ,function(){ 
        //             console.log("cordova.file.externalRootDirectory file not found or created"); 
        //         }
        //     );
        // });
    }
};
