/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // app cache - in memory data store
    cache : {}

    // Application Constructor
    ,initialize: function() {
        this.bindEvents();
        app.cache.user              = config["default_user"]; //NEED TO USE COLLATE
        app.cache.positionTrackerId = null; //ref to setInterval
        app.cache.currentWalkMap    = [];   //array of geotags for current walk
        app.cache.curmap            = null; //ref to google map

        app.cache.localusersdb      = null; //ref to local users DB
        app.cache.localprojdb       = null; //ref to local copy of projects DB
        app.cache.remoteusersdb     = null; //ref to remote users DB
        app.cache.remoteprojdb      = null; //ref to remote projects DB
        app.cache.projects          = null; //ref to projects list from local proj DB
        app.cache.active_project    = null; //active project ID

        app.cache.uuid              = null; //DEVICE UNIQUE ID
        app.cache.proj_id           = null; 
        app.cache.next_id           = null; //NEXT USER ID - POUCH COLLATED
        app.cache.participant_id    = null;
        app.cache.platform          = null;

        app.cache.audioObj          = null;
        app.cache.audioStatus       = null;
    }
    
    // The scope of 'this' is the event. 
    // In order to call the 'receivedEvent' we call this.receivedEvent
    // Bind any events that are required on startup. "deviceready" is a must "pause" and "resume" seem useful
    ,bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // document.addEventListener('pause'  , this.CallBackFunctionName, false);
        // document.addEventListener('resume' , this.CallBackFunctionName, false);
    }

    ,onDeviceReady: function() {
        // $("#main").addClass("loaded");
        // app.transitionToPanel($("#pic_review"));
        // return;

        //0 CHECK NETWORK STATE, AND GET UUID
        var networkState    = utils.checkConnection();
        app.cache.uuid      = device.uuid;
        app.cache.platform  = device.platform;
        
        //1) (RE)OPEN LOCAL DB
        app.cache.localusersdb  = datastore.startupDB(config["database"]["users_local"]); 
        app.cache.localprojdb   = datastore.startupDB(config["database"]["proj_local"]);

        // DELETING THE LOCAL PROJ DB
        // app.cache.localprojdb.destroy().then(function (response) {
        //   console.log("byebye local proj db");
        // }).catch(function (err) {
        //   console.log(err);
        // });
        // return;

        app.cache.remoteusersdb = datastore.startupDB(config["database"]["users_remote"]);
        app.cache.remoteprojdb  = datastore.startupDB(config["database"]["proj_remote"]);

        //2) KICK OFF LIVE REMOTE SYNCING - WORKS EVEN IF STARTING IN OFFLINE
        // datastore.twoWaySyncDB(app.cache.localdb,app.cache.remoteusersdb);
        datastore.localSyncDB(app.cache.localusersdb,app.cache.remoteusersdb);
        datastore.remoteSyncDB(app.cache.localprojdb,app.cache.remoteprojdb);

        //3) THIS NEEDS TO BE GOTTEN FROM LOCAL PROJECTS OR SERVER
        app.cache.localprojdb.get("all_projects").then(function (doc) {
            app.cache.projects = doc;

            //THERE SHOULD BE AT LEAST 1 PROJECT
            if(0 in app.cache.projects["project_list"]){
                app.deviceSetup(app.cache.projects["project_list"]);
            }else{
                //DELIBERATLEY THROW ERROR
                console.log("deliberately thrown error");
                throw err;
            }

            //CHECK TO SEE IF THERE IS AN "active_project" YET
            if("active_project" in doc){
                //THIS DEVICE HAS BEEN SET UP TO USE A PROJECT
                app.cache.active_project = doc["active_project"];
                app.loadProject(app.cache.projects["project_list"][app.cache.active_project]);

                //SHOW THE USER SIGN IN
                app.transitionToPanel($("#step_zero"));
            }else{
                //SHOW ADMIN DEVICE SET UP 
                app.adminSetup();
            }
        }).catch(function (err) {
            console.log("ALL ERRORS (EVEN FROM .then() PROMISES) FLOW THROUGH TO BE CAUGHT HERE");
            datastore.showError(err);

            //IF NO PROJECTS THEN PUT UP THIS LOADING ERROR
            var cantconnect = $("<h3>").addClass("loadfail").text("Sorry, unable to connect to server.  Please close the app and try later.");
            $(".title hgroup").append(cantconnect);
        });

        //4) ADD EVENTS TO VARIOUS BUTTONS/LINKS
        $(".button").click(function(){
            //GET CURRENT PANEL
            var panel   = $(this).closest(".panel");
            var next    = $(this).data("next");

            if(next == "step_zero"){
                $("#main").removeClass("loaded"); 
                var pid         = $("#admin_projid").val().toUpperCase();
                var pid_correct = null;
                for(var i in app.cache.projects["project_list"]){
                    var p = app.cache.projects["project_list"][i];
                    if(pid == p.project_id){
                        var pid_correct = i;
                    }
                }
                if($("#admin_pw").val() == "discovery1" && pid_correct != null){
                    $("#admin_pw").val(null);
                    $("#admin_projid").val(null);

                    var project_i               = pid_correct;
                    app.cache.active_project    = project_i;
                }else{
                    alert("Wrong ProjectID/Password");
                    return false;
                }

                //THIS WILL SET THE device (local DB) TO USE THIS PROJECT
                app.cache.projects["active_project"] = project_i;
                datastore.writeDB(app.cache.localprojdb, app.cache.projects);
                app.loadProject(app.cache.projects["project_list"][project_i]);
            }else{
                //ONE TIME DEAL if NOT STEP ZERO
                $("#main").addClass("loaded");
            }

            //SPECIAL RULES ENTERING INTO DIFFERNT "PAGES"
            if(next == "consent_one"){
                app.cache.user.project_id    = $("select[name='project_id']").val();
                app.cache.user.lang          = $("select[name='language']").val();
                app.cache.user.user_id       = app.cache.participant_id;
                app.cache.user._id           = app.cache.next_id; //COLLATED

                if(!$("header hgroup h3").length){
                    $("header hgroup").append($("<h3>").text("Project : " + app.cache.proj_id.toUpperCase() + ", Participant : " + app.cache.participant_id));
                }
            }

            if(next == "step_two" && !$(this).hasClass("continuewalk")){
                app.startWatch(8000);
            }

            if(next == "step_three"){
                console.log("possibliy end walk, show goog map");
                app.plotGoogleMap();
            }

            if(next == "survey"){
                app.stopWatch();
                $("nav").hide();
            }

            //TRANSITION TO NEXT PANEL
            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next));
            return false;
        });

        //ADD EVENTS TO device Actions
        $(".panel").on("click",".daction",function(){
            var panel   = $(this).closest(".panel");
            var next    = $(this).data("next");

            if($(this).hasClass("camera")){
                //GET CURRENT PANEL
                app.takePhoto();
            }else if($(this).hasClass("playing")){
                app.stopPlaying();
                //change button to play
                $(this).removeClass("playing");
                return false;
            }else if($(this).hasClass("audioplay")){
                app.startPlaying();
                //change button to stop
                $(this).addClass("playing");
                return false;
            }else{
                app.recordAudio();
            }

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next));
            return false;
        });

        $(".help").click(function(){
            app.closeCurrentPanel($(".panel.loaded"));
            app.transitionToPanel($("#help"));
            return false;
        });

        $(".back").click(function(){
            app.cache.user.history.pop(); //not the most recent one.
            var tempnext = app.cache.user.history.pop(); //this is the one we want
            if(tempnext == "step_zero"){
                $("#main").removeClass("loaded");
            }

            app.closeCurrentPanel($(".panel.loaded"));
            app.transitionToPanel($("#"+tempnext));
            return false;
        });

        $(".panel").on("click",".votes .vote", function(){
            //VOTE GOOD OR BAD
            var curPhoto    = $(this).data("photo_i");
            $(".vote.up[rel='" + curPhoto + "'],.vote.down[rel='" + curPhoto + "']").removeClass("on").removeClass("off");
            
            if($(this).hasClass("up")){
                app.cache.user.photos[curPhoto].goodbad = 1;
                $("a.up[rel='" + curPhoto + "']").addClass("on");
                $("a.down[rel='" + curPhoto + "']").addClass("off");
            }else{
                app.cache.user.photos[curPhoto].goodbad = -1;
                $("a.down[rel='" + curPhoto + "']").addClass("on");
                $("a.up[rel='" + curPhoto + "']").addClass("off");
            }
            return false;
        });

        $(".panel").on("click",".trashit", function(){
            //DELETE A PHOTO (AND ASSOCIATED GEOTAGS/AUDIO)
            var thispic_i   = $(this).data("photo_i");
            var panel       = $(this).closest(".panel");

            if(panel.attr("id") == "pic_review"){
                var next    = "step_two";
                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#"+next),1);
            }

            app.deletePhoto(app.cache.user.photos[thispic_i]);
            return false;
        });

        $(".panel").on("click",".previewthumb",function(){
            //OPEN UP PREVIEW PAGE FOR PHOTO
            var thispic_i   = $(this).data("photo_i");
            app.previewPhoto(app.cache.user.photos[thispic_i]);

            var panel       = $(this).closest(".panel");
            var next        = "pic_review";

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next));
        });

        $(".panel").on("click",".listen", function(){
            var url = $(this).attr("href");
            var my_media = new Media(url,
                 function () {  console.log("playAudio():Audio Success"); }
                ,function (err) { console.log(err.message); }
            );

            my_media.play();
            my_media.release();
            return false;
        });

        // $("#main").addClass("loaded");
        // app.transitionToPanel($("#audio_record"));
        // app.recordAudio();

        $("#audio_controls a").click(function(){
            var ctl_id = $(this).attr("id");
            switch(ctl_id){
                case "ctl_play":
                    app.startPlaying();
                break;

                case "ctl_record":
                console.log("this event?");
                    app.recordAudio();
                break;

                case "ctl_pause":
                    app.stopRecording();
                break

                case "ctl_stop":
                    app.cache.audioStatus = "stop_release";
                    app.stopRecording();
                    var panel = $(this).closest(".panel");
                    var next  = "pic_review";

                    //CHANGE THE RECORD BUTTON IN PIC PREVIEW
                    $("#pic_review .device_actions").addClass("has_audio");
                    var playbutton = $("<a>").attr("href","#").addClass("daction").addClass("audioplay");
                    var or = $("<span>").text(" or ");
                    $("#pic_review .device_actions").prepend(or);
                    $("#pic_review .device_actions").prepend(playbutton);
                    
                    //TO PLAY or RECORD NEW
                    app.closeCurrentPanel(panel);
                    app.transitionToPanel($("#"+next));
                break

                default:

                break;
            }

            return false;
        });

        $("#resetdevice").click(function(){
            //DITCH USER TOO
            app.cache.user = config["default_user"];
            $("#admin_null").show();
            $("#admin_passed").hide();

            $("#main").addClass("loaded");

            app.closeCurrentPanel($("#step_zero"));
            app.transitionToPanel($("#step_setup"));
            return false;
        });

        $("#cancelreset").click(function(){
            app.closeCurrentPanel($("#step_setup"));
            app.transitionToPanel($("#step_zero"));
            return false;
        });

        $("#end_session").click(function(){
            $("#main").removeClass("loaded");
            //THIS DEVICE HAS BEEN SET UP TO USE A PROJECT
            app.loadProject(app.cache.projects["projects"][app.cache.active_project]);

            app.closeCurrentPanel($("#finish"));
            app.transitionToPanel($("#step_zero"));
        });
    }

    ,closeCurrentPanel: function(panel){
        panel.removeClass("loaded").delay(50).queue(function(next){
            $(this).hide();
            next();
        });
    }

    ,transitionToPanel: function(panel,nosave){
        if(!nosave){
            app.cache.user.history.push(panel.attr("id"));
        }
        panel.show().delay(250).queue(function(next){
            $(this).addClass("loaded");
            next();
        });
    }

    ,adminSetup : function(){
        app.cache.admin_pass = null;
        $("#main").addClass("loaded");
        app.transitionToPanel($("#step_setup"),1); 
        return;
    }

    ,loadProject : function(project){
        var p = project;

        //SEARCH LOCAL USERS DB FOR USERS WITH PARTIAL COLLATED uuid + project_id
        var partial_id  = datastore.pouchCollate([app.cache.uuid, p["project_id"]]);

        app.cache.localusersdb.allDocs({
            // IF NO OPTION, RETURN JUST _id AND _rev (FASTER)
             startkey   : partial_id
            ,endkey     : partial_id + "\ufff0"
        }).then(function (res) {
            // console.log("will always return total docs: " + res["total_rows"]);
            //SET THE NEXT AVAILABLE USER OBJECT _id
            app.cache.proj_id           = p["project_id"];
            app.cache.participant_id    = (res["rows"].length + 1);
            app.cache.next_id           = datastore.pouchCollate([app.cache.uuid, app.cache.proj_id, app.cache.participant_id]);

            //Display This Info
            $("#step_zero b.proj_name").text(p["project_name"]);
            $("#step_zero b.user_id").text(app.cache.participant_id);

            $("select[name='language']").empty();
            for(var l in p["lang"]){
                var l_option = $("<option>").val(p["lang"][l]["lang"]).text(p["lang"][l]["language"]);
                 $("select[name='language']").append(l_option);
            }
            app.updateLanguage(app.cache.proj_id,"en");
        }).then(function(){
            $("select[name='language']").change(function(){
                //REAL TIME LANGUAGE TRANSLATION UPDATES
                var proj_id = app.cache.proj_id;
                var lang_id = $(this).val();
                app.updateLanguage(proj_id,lang_id);
            });
        }).catch(function(err){
            console.log("ERROR localusers tables:");
            datastore.showError(err);
        });
    }

    ,deviceSetup : function(projects){
        //ADMIN SPLASH PAGE LIST ALL PROJETS FOR DEVICE SET UP
        for(var i in projects){
            var p = projects[i];
            var projopt = $("<option>").val(i).text(p["project_name"]);
            $("#admin_proj_list").append(projopt);
        }    
    }

    ,updateLanguage : function(projid,lang){
        lang = !lang ? "en" :lang;
        for(var p in app.cache.projects["project_list"]){
            var project = app.cache.projects["project_list"][p];
            if(project["project_id"] == projid){
                var trans = project["lang"];
                for(var l in trans){
                    var language = trans[l];
                    if(language["lang"]== lang){
                        //GOT THE RIGHT LANGUAGE
                        for(var t in language["translations"]){
                            var translation = language["translations"][t];
                            var datakey = Object.keys(translation).shift();
                            $("[data-translation-key='"+datakey+"']").text(translation[datakey]);
                        }
                        break;
                    }
                }
                break;
            }            
        }
    }

    ,startWatch: function(freq) {
        //SAVE GEO TAGS FOR MAP
        app.trackPosition(); //manually do the first one
        app.cache.positionTrackerId = setInterval(app.trackPosition, freq);
    }

    ,stopWatch: function(){
        clearInterval(app.cache.positionTrackerId);
        app.cache.positionTrackerId = null;
    }
    
    ,trackPosition: function(){
        navigator.geolocation.getCurrentPosition(
            function(position) {
                var lastPos = app.cache.user.geotags[app.cache.user.geotags.length - 1];
                var curdist = app.cache.user.hasOwnProperty("currentDistance") ? app.cache.user.currentDistance : 0;
                var prvLat  = lastPos > 0 ? lastPos.latitude  : position.coords.latitude;
                var prvLong = lastPos > 0 ? lastPos.longitude : position.coords.longitude;
                var curLat  = position.coords.latitude;
                var curLong = position.coords.longitude;
                curdist     = curdist + utils.calculateDistance(prvLat, prvLong, curLat, curLong);
                app.cache.user.currentDistance = curdist;

                var curpos = {
                     "lat"          : curLat
                    ,"lng"          : curLong
                    ,"altitude"     : position.coords.altitude
                    ,"heading"      : position.coords.heading
                    ,"speed"        : position.coords.speed
                    ,"timestamp"    : position.timestamp
                };
                app.cache.user.geotags.push(curpos);

                //SAVE THE POINTS IN GOOGLE FORMAT
                app.cache.currentWalkMap.push(
                    new google.maps.LatLng(curLat, curLong)
                );
                console.log(curLat + " : " + curLong);
                console.log("new geodatapoint : " + app.cache.currentWalkMap.length);
            }
            ,function(err){
                console.log("error?");
                console.log(err);
            }
            ,{
                enableHighAccuracy: true
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
        });
        return curpos;
    }

    ,plotGoogleMap: function(){
        // Create the map
        var myOptions = {
            zoom        : 16,
            center      : app.cache.currentWalkMap[0],
            mapTypeId   : google.maps.MapTypeId.HYBRID
        }
        if(app.cache.curmap != null){
            var map             = app.cache.curmap;
        }else{
            var map             = new google.maps.Map(document.getElementById("google_map"), myOptions);
            app.cache.curmap    = map;
        }

        var latLngBounds    = new google.maps.LatLngBounds();
        var geopoints       = app.cache.currentWalkMap.length; 
        for(var i = 0; i < geopoints; i++) {
          latLngBounds.extend(app.cache.currentWalkMap[i]);
          // Place the marker
          new google.maps.Marker({
            map: map,
            position: app.cache.currentWalkMap[i],
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 3,
                fillColor: "#008800",
                strokeColor: "#0000FF",
                fillOpacity: 1

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

    ,startPlaying : function(){
        app.cache.audioStatus = "playing";
        app.cache.audioObj.play();

        $("#soundwaves").removeClass("pause");

        $("#ctl_stop").removeClass("off");
        $("#ctl_pause").removeClass("off");

        $("#ctl_record").addClass("off");
        $("#ctl_play").addClass("off");

    }

    ,startRecording : function(){
        app.cache.audioStatus = "recording";
        app.cache.audioObj.startRecord();
 
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

        $("#ctl_stop").removeClass("off");
        $("#ctl_pause").removeClass("off");

        $("#ctl_record").addClass("off");
        $("#ctl_play").addClass("off");
    }

    ,stopRecording : function(){
        if (app.cache.audioObj == null){
            return;
        }
        clearInterval(app.cache.audioTimer);

        if (app.cache.audioStatus == 'recording') {
            app.cache.audioObj.stopRecord();
            console.log("Recording stopped");
        } else if (app.cache.audioStatus == 'playing') {
            app.cache.audioObj.stop();            
            console.log("Play stopped");
        }else if(app.cache.audioStatus == "stop_release"){
            app.cache.audioObj.stop();
            $("#audio_time").text("00:00");

            // app.cache.audioObj.release();
            console.log("Recording stopped");
            console.log("Media Released");
        } else {
            console.log("Nothing stopped");
        }

        $("#soundwaves").addClass("pause");

        $("#ctl_stop").addClass("off");
        $("#ctl_pause").addClass("off");
        
        $("#ctl_record").removeClass("off");
        $("#ctl_play").removeClass("off");
        app.cache.audioStatus = 'stopped';
    }

    ,recordAudio: function(){
        //ios requires .wav format, .mp3 for android
        //without full path saves to documents/tmp or LocalFileSystem.TEMPORARY
        //Files can be recorded and played back using the documents URI: var myMedia = new Media("documents://beer.mp3")
        //IOS requires the file to be created if it doesnt exist.
        if(app.cache.audioObj != null) {
            console.log("audioOBJ exists start recording");
            app.startRecording();
            return;
        }

        if(app.cache.platform == "iOS") {
            var recordFileName = "temp_recording.wav";
            //first create file if not exist
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
                fileSystem.root.getFile(recordFileName, {
                    create: true,
                    exclusive: false
                }, function(fileEntry){
                    // [isFile,isDirectory,name,fullPath,filesystem,nativeURL
                    // ,constructor,createWriter,file,getMetadata,setMetadata
                    // ,moveTo,copyTo,toInternalURL,toURL,toNativeURL
                    // ,toURI,remove,getParent]
                    // fileEntry.fullPath
                    app.cache.audioObj = new Media(recordFileName
                    ,  function(){
                        //The callback that executes after a Media object 
                        //has completed the current play, record, or stop action
                        console.log("MediaObject successfully completed the current play, record, or stop action");
                    }, function(err){
                        // The callback that executes if an error occurs.
                        console.log(err.message);
                        console.log(err.code);
                    }, function(){
                        // The callback that executes to indicate status changes.
                        console.log("what does status change mean?");
                    }); //of new Media

                    app.startRecording();
                }, function(err){
                    console.log(err.code +  " : " + err.message);
                    console.log("fileSystem.root error()");
                }); //of getFile
            }, function(){
                console.log("window.requestFileSystem  error()");
            }); //of requestFileSystem
        }else{
            var recordFileName = "temp_recording.mp3";

            app.cache.audioObj = new Media(recordFileName, function(){
                console.log("Media created successfully");
            }, function(err){
                console.log(err.message);
                console.log(err.code);
                console.log("android error");
            }, null); 
            
            app.startRecording();
        }

        console.log("is it recording?");
        return;
    }

    ,takePhoto: function(){
        // take pic
        // save pic filename + geotag location
        navigator.camera.getPicture( 
            function(imageData){
                var fileurl = "data:image/jpeg;base64," + imageData;
                app.cache.user.photos.push({
                         "path"     : fileurl
                        ,"geotag"   : null 
                        ,"synced"   : false
                        ,"audio"    : null
                        ,"goodbad"  : null
                    });
                
                //make sure the audio gets the proper photo to save to
                var thispic_i   = app.cache.user.photos.length - 1;
                var geotag      = app.tagLocation(app.cache.user.photos[thispic_i]);

                //SET UP PHOTO PREVIEW PAGE
                app.previewPhoto(app.cache.user.photos[thispic_i]);

                //ADD LIST ITEM TO REVIEW PAGE
                setTimeout(function(){
                    app.addMediaItem(app.cache.user.photos[thispic_i]);
                },500);
            }
            ,function(err){
                console.log(err);
            }
            ,{ 
                 quality            : 50
                ,destinationType    : Camera.DestinationType.DATA_URL
                ,saveToPhotoAlbum   : false
                ,allowEdit          : true
            }
        );
        return;
    }

    ,previewPhoto: function(_photo){
        var photo_i = app.cache.user.photos.indexOf(_photo);
        var fileurl = _photo["path"];
        var goodbad = _photo["goodbad"];

        $("#pic_review a.vote").removeClass("on").removeClass("off");
        if(goodbad == null){
            //nothin
        }else if(goodbad > 0){
            $("#pic_review a.vote.up").addClass("on");
            $("#pic_review a.vote.down").addClass("off");
        }else{
            $("#pic_review a.vote.up").addClass("off");
            $("#pic_review a.vote.down").addClass("on");
        }

        $(".daction.audio").data("photo_i",photo_i);
        $("#pic_review a.trashit").data("photo_i",photo_i).attr("rel",photo_i);
        $("#pic_review a.vote").data("photo_i",photo_i).attr("rel",photo_i);
        $("#recent_pic").attr("src",fileurl);
    }

    ,addMediaItem:function(_photo){
        var photo_i     = app.cache.user.photos.indexOf(_photo);
        var fileurl     = _photo["path"];
        var geotag      = _photo["geotag"];
        var time        = utils.readableTime(geotag.timestamp);

        //NOW ADD THIS TO THE VIEW #mediacaptured
        var newitem     = $("<li>").addClass("mediaitem").addClass("photo_"+photo_i);
        var newlink     = $("<a>").addClass("previewthumb").attr("href","#").data("photo_i",photo_i).attr("rel",photo_i).html($("<span>").text("@ " + time));
        var newthum     = $("<img>").attr("src",fileurl);
        
        var trash       = $("<a>").addClass("trashit").attr("href","#").data("photo_i",photo_i).html("&#128465;");
        var thumbs      = $("<div>").addClass("votes");
        var thumbsup    = $("<a>").attr("href","#").addClass("vote").addClass("up").data("photo_i",photo_i).attr("rel",photo_i);
        var thumbsdown  = $("<a>").attr("href","#").addClass("vote").addClass("down").data("photo_i",photo_i).attr("rel",photo_i);
        
        var audiorec    = $("<a>").attr("href","#").addClass("audiorec").data("photo_i",photo_i).attr("rel",photo_i).attr("data-next","audio_record");

        thumbs.append(thumbsup);
        thumbs.append(thumbsdown);
        newlink.prepend(newthum);
        newitem.append(newlink);
        newitem.append(audiorec);
        newitem.append(thumbs);
        newitem.append(trash);

        $(".nomedia").hide();
        $("#mediacaptured").append(newitem);
    }

    ,deletePhoto: function(_photo){
        var photo_i = app.cache.user.photos.indexOf(_photo);
        app.cache.user.photos[photo_i] = null;
        $("#mediacaptured a[rel='"+photo_i+"']").parents(".mediaitem").fadeOut("medium").delay(250).queue(function(next){
            $(this).remove();
            next();
        });
        return;
    }
};
