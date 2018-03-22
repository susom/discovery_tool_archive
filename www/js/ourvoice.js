// var ourvoice = {
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
            var trash   = $("<td>");
            reset.append($("<a>").addClass("resync").attr("data-docid",r_id).text('reset'));
            trash.append($("<a>").addClass("trash").attr("data-docid",r_id).html('&#128465;'));
            if(synced){
                tr.addClass("uploaded");
                thumbs.addClass("uploaded");
            }else{
                // console.log("no 'sync flag'");
            }
            var up = $("<td>").append(thumbs);

            tr.append(walknum);
            tr.append(truncid);
            tr.append(pics);
            tr.append(audio);
            tr.append(up);
            tr.append(reset);
            // tr.append(trash);

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
                                                        ,"project_id"           : null
                                                        ,"user_id"              : null
                                                        ,"lang"                 : null
                                                        ,"photos"               : []
                                                        ,"geotags"              : []
                                                        ,"survey"               : []
                                                        ,"device"               : null
                                                    };

        app.cache.attachment                        = {
                                                         "_id"                  : null
                                                        ,"project_id"           : null
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
            console.log(doc);
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
                if(app.cache.active_project.hasOwnProperty("i") && !app.cache.projectDataChanged){
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
        lang                = !lang ? "en" :lang;
        var project         = app.cache.projects["project_list"][app.cache.active_project["i"]];
        var trans           = app.cache.projects["app_text"];
        var survey_trans    = project.hasOwnProperty("template_type") ? app.cache.projects["survey_text"][project["template_type"]]  : project["surveys"];
        var consent_trans   = project.hasOwnProperty("template_type") ? app.cache.projects["consent_text"][project["template_type"]] : project["consent"];

        //OK JUST REDO THE SURVEY EVERYTIME
        $("#survey fieldset").empty();
        survey.build(survey_trans, lang);
        consent.build(consent_trans, lang);
        
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

                if(acuracy <= app.cache.accuracy_threshold){
                    if(curLat != prvLat && curLong != prvLong){
                        app.cache.user[app.cache.current_session].geotags.push(curpos); 
                        curdist     = curdist + utils.calculateDistance(prvLat, prvLong, curLat, curLong);
                        app.cache.user[app.cache.current_session].currentDistance = curdist;
                    
                        //SAVE THE POINTS IN GOOGLE FORMAT
                        if(utils.checkConnection()){
                            app.cache.currentWalkMap.push(
                                new google.maps.LatLng(curLat, curLong)
                            );
                        } 
                    }
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
        // ILL JUST SET IT TO THE PREVIOUS ONE FIRST, THEN IF THIS CALLBACK DOESNT ERROR, IT WILL SET ITS OWN GEOTAG?
        add_to["geotag"]    = app.cache.user[app.cache.current_session].geotags[app.cache.user[app.cache.current_session].geotags.length - 1];
        curpos              = {}
        navigator.geolocation.getCurrentPosition(function(position) {
            curpos.longitude    = position.coords.longitude;
            curpos.latitude     = position.coords.latitude;
            curpos.altitude     = position.coords.altitude;
            curpos.heading      = position.coords.heading;
            curpos.speed        = position.coords.speed;
            curpos.timestamp    = position.timestamp;
            curpos.lat          = position.coords.latitude;
            curpos.lng          = position.coords.longitude;
            curpos.accuracy     = position.coords.accuracy;
            add_to["geotag"]    = curpos;
        }, function(err){
            // if timed out use the the latest WAtchPostiion?
            console.log("TagLocation either it timed out or errored out? " + err);
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
            // app.cache.audioObj[recordFileName].play();
            //RESET FAKE TIMER
            $("#audio_time").text("00:00");

            //UPDATE THE GUI
            app.cache.user[app.cache.current_session].photos[photo_i]["audio"]++;
            $(".mediaitem .audiorec[rel='"+photo_i+"']").addClass("hasAudio");
            $("#pic_review .daction.audio").addClass("hasAudio");
            
            ourvoice.drawSavedAudio(photo_i,recordFileName);

            //NOW SAVE IT AS AN INLINE ATTACHMENT
            var audio_i = !app.cache.user[app.cache.current_session].photos[photo_i]["audio"] ? 0 : app.cache.user[app.cache.current_session].photos[photo_i]["audio"];

            if(app.cache.platform == "iOS"){
                //NOW GET A HANDLE ON THE FILE AND SAVE IT TO POUCH
                app.cache.currentAudio.file(function(file) {
                        //RECORD AUDIO ATTACHMENT 
                        //instead of carrying an image all over, just put it directly to the pouchDB asap and forget it
                        datastore.addAttachment( app.cache.localattachmentdb
                                                ,app.cache.attachment["_id"] + "_" + recordFileName
                                                ,null
                                                ,recordFileName
                                                ,file
                                                ,"audio/" + app.cache.audioformat );
                        app.cache.user[app.cache.current_session].photos[photo_i]["audios"].push(recordFileName);
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

                                        //NOW GET A HANDLE ON THE FILE AND SAVE IT TO POUCH
                                        //RECORD AUDIO ATTACHMENT 
                                        datastore.addAttachment( app.cache.localattachmentdb
                                                                ,app.cache.attachment["_id"] + "_" + recordFileName
                                                                ,null
                                                                ,recordFileName
                                                                ,file
                                                                ,"audio/" + app.cache.audioformat );
                                        app.cache.user[app.cache.current_session].photos[photo_i]["audios"].push(recordFileName);
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
                
                //make sure the audio gets the proper photo to save to
                var thispic_i   = app.cache.user[app.cache.current_session].photos.length;
                var attref      = "photo_" + thispic_i + ".jpg";
                app.cache.user[app.cache.current_session].photos.push({
                         "audio"    : false
                        ,"geotag"   : null 
                        ,"goodbad"  : null
                        ,"name"     : attref
                        ,"audios"   : []
                    });
                var geotag      = ourvoice.tagLocation(app.cache.user[app.cache.current_session].photos[thispic_i]);

                //RECORD PHOTO DATAURL
                datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);

                datastore.addAttachment( app.cache.localattachmentdb
                                        ,app.cache.attachment["_id"] + "_" + attref
                                        ,null
                                        ,attref
                                        ,imageData
                                        ,"image/jpeg" );
    
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
                //on error or cancel go back to take pic page
                var panel = $("#loading");
                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#step_two"),false);
            }
            ,{ 
                 quality            : 50
                ,destinationType    : Camera.DestinationType.DATA_URL
                ,saveToPhotoAlbum   : app.cache.saveToAlbum
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

                //"delete" doesnt delete, rather replaces with undefined, leaving length to the array
                //use indexOf and array.splice() instead
                var photo_i = app.cache.user[app.cache.current_session].photos.indexOf(_photo);
                if(photo_i > -1){
                    app.cache.user[app.cache.current_session].photos.splice(photo_i,1);
                }

                //TODO DELETE ATTACHMENTS
                var related_audio = "audio_"+photo_i+"_1." + app.cache.audioformat;
                // datastore.removeAttachment(app.cache.localattachmentsdb, app.cache.attachment["_id"], app.cache.attachment["_rev"] ,"photo_"+photo_i+".jpg", function(db,_id,_rev){
                //     datastore.removeAttachment(db, _id, _rev , related_audio, function(){});
                // });
                
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
        
        // ourvoice.syncLocalData();

        $(".mi_slideout").removeClass("reviewable");

        app.log("PARTICIPANT FINISHED AND USER OBJECT SAVED");        
    }

    ,resetDevice : function(){
        //refreshes UI
        $(".loaded").removeClass("loaded");
        $(".mi_slideout b").text(0);
        $(".mi_slideout").removeClass("reviewable");
        $(".nomedia").show();
        $(".delete_on_reset").remove();

        app.log("RESETING DEVICE STATE");
        return;
    }

    ,syncLocalData: function(needUpdating){
        $("#datastatus i").removeClass("synced");
        window.plugins.insomnia.keepAwake();

        datastore.localSyncDB(app.cache.localusersdb, app.cache.remoteusersdb, function(info){
            // console.log(info);
            if(info.hasOwnProperty("docs")){
                //.onChange
                var updated = 0;
                for(var i in info["docs"]){
                    var changed_doc = info["docs"][i];
                    var _id         = changed_doc["_id"];
                    var _rev        = changed_doc["_rev"];
                    app.cache.localusersdb.get(_id).then(function (doc) {
                        doc.uploaded = true;
                        app.cache.localusersdb.put(doc);
                    }).catch(function (werr) {
                        app.log("syncLocalData error UPDATING USER DATA " + _id, Error);
                        datastore.showError(werr);
                    });
                }
            }
        }); 

        datastore.localSyncDB(app.cache.localattachmentdb, app.cache.remoteattachmentdb, function(info){ //callback
            if(info.hasOwnProperty("status") && info["status"] == "complete"){
                //onComplete
                //THIS APPEARS AFTER THE onChange() BLOCK BELOW
                
                //CHANGE SYNC INDICATOR TO THUMBS UP
                $("#datastatus i").addClass("synced");

                app.cache.pbacutoff = true; //set to true to finish complete the upload animation

                $("i[data-docid]").addClass("uploaded");
                $("i[data-docid]").closest("tr").addClass("uploaded");

                //LET THE PHONE SLEEP AGAIN
                window.plugins.insomnia.allowSleepAgain();
                
                //REMOVE UPLOADING SPINNER
                setTimeout(function(){
                    $("#cancel_upload").click();
                    $(".uploading").removeClass("uploading");
                }, 180000); //??
            }else if(info.hasOwnProperty("docs") && info["docs_written"] > 0){
                //.onChange
                //THIS GIVES DETAILS OF UPLOADED DATA ROWS , UNFORTUNATELY THEY COME ALL AT ONCE (OR NOTHING?) SO CAN'T DO PROPER PROGRES BAR
                ourvoice.clearAllAudio();
            }
        });

        datastore.localSyncDB(app.cache.locallogdb, app.cache.remotelogdb, function(info){
            if(info.hasOwnProperty("status")){
                datastore.deleteDB(app.cache.locallogdb,function(){
                    app.cache.locallogdb = datastore.startupDB(config["database"]["log_local"]);
                });
            }
        }); 
    }

    ,progressBarAnimationStart: function(needUpdating){
        var max_width               = 280;
        var segment_width           = Math.round(max_width/needUpdating); //needUpdating = numFiles
        var linear_segment_width    = Math.round(max_width/100);
        var current_width           = $("#progressbar span").width();
        var current_perc            = parseInt($("#percent_uploaded").text());
        var segment_perc            = Math.round((linear_segment_width/max_width) * 100);
        var timeout                 = 750;
        var min                     = 750;
        var max                     = 750;

        //THIS IS HOW TO PUT ARTIFICAL DELAY IN FOR "LOOP"
        (function next(i, maxLoops, finished) {
            if(!finished){
                current_width       = current_width + linear_segment_width;
                current_width       = current_width > (max_width*0.8) ? (max_width*0.8) : current_width;
                current_perc        = current_perc + segment_perc;
                current_perc        = current_perc > 80 ? 80 : current_perc;
                
                if(current_width <= max_width*.25){
                    min = 750;
                    max = 1000;
                }else if(current_width <= max_width*.5){
                    min = 1000;
                    max = 1250;
                }else if(current_width <= max_width*.8){
                    min = 1250;
                    max = 1500;
                }
                
                timeout = utils.randomInRange(min,max);
                $("#progressbar span").width(current_width);
                $("#percent_uploaded").text(current_perc);
            }else{
                var difference  = max_width - current_width;
                var increment   = Math.ceil(difference/maxLoops) + ((Math.random()/3)*difference)+1;
                current_width   = current_width + increment;
                current_width   = current_width > max_width ? max_width : current_width;
                current_perc    = current_perc + Math.round((increment/max_width)*100);
                current_perc    = current_perc > 100 ? 100 : current_perc;
                $("#progressbar span").width(current_width);
                $("#percent_uploaded").text(current_perc);
            }
            
            if(current_width >= max_width){
                $("#cancel_upload").click();
                setTimeout(function(){ },750);
                return;
            }

            var pbanim = setTimeout(function() {
                if(app.cache.pbacutoff){ //if the data upload is done...
                    next(i, maxLoops, true);
                }else{
                    // call next() recursively
                    next(i, maxLoops, false);
                }
            }, timeout); //setTimeout
        })(0, needUpdating, false); //next(0,maxloops) function invoking gets called immediately
    }

    ,deleteLocalDB : function(){
        //DELETE LOCAL USER DB
        datastore.deleteDB(app.cache.localprojdb, function(){});
        datastore.deleteDB(app.cache.localusersdb, function(){});
        datastore.deleteDB(app.cache.localattachmentdb, function(){});
        datastore.deleteDB(app.cache.locallogdb, function(){});
        return;
    }
};
