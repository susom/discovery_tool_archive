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
    //app cache
    cache : {}

    // Application Constructor
    ,initialize: function() {
        this.bindEvents();
        app.cache.user              = config["default_user"];
        app.cache.positionTrackerId = null;

        app.cache.localusersdb      = null;
        app.cache.localprojdb       = null;
        app.cache.remoteusersdb     = null;
        app.cache.remoteprojdb      = null;

        app.cache.uuid              = null;
        app.cache.p_id              = null;
        app.cache.next_id           = null;
        app.cache.pu_id             = null;
    }
    
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    ,bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // document.addEventListener('offline'              , this.CallBackFunctionName, false);
        // document.addEventListener('online'               , this.CallBackFunctionName, false);
        // document.addEventListener('load'                 , this.CallBackFunctionName, false);
        // document.addEventListener('pause'                , this.CallBackFunctionName, false);
        // document.addEventListener('resume'               , this.CallBackFunctionName, false);
        // document.addEventListener('backbutton'           , this.CallBackFunctionName, false);
        // document.addEventListener('menubutton'           , this.CallBackFunctionName, false);
        // document.addEventListener('searchbutton'         , this.CallBackFunctionName, false);
        // document.addEventListener('startcallbutton'      , this.CallBackFunctionName, false);
        // document.addEventListener('endcallbutton'        , this.CallBackFunctionName, false);
        // document.addEventListener('volumedownbutton'     , this.CallBackFunctionName, false);
        // document.addEventListener('volumeupbutton'       , this.CallBackFunctionName, false);
        // document.addEventListener('batterystatus'        , this.CallBackFunctionName, false);
        // document.addEventListener('batterycritical'      , this.CallBackFunctionName, false);
        // document.addEventListener('batterylow'           , this.CallBackFunctionName, false);
    }

    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    ,onDeviceReady: function() {
        //0 CHECK NETWORK STATE, AND GET UUID
        var networkState    = utils.checkConnection();
        app.cache.uuid      = device.uuid;

        //1) (RE)OPEN LOCAL DB
        app.cache.localusersdb  = datastore.startupDB(config["database"]["users_local"]); 
        app.cache.localprojdb   = datastore.startupDB(config["database"]["proj_local"]);
        app.cache.remoteusersdb = datastore.startupDB(config["database"]["users_remote"]);
        app.cache.remoteprojdb  = datastore.startupDB(config["database"]["proj_remote"]);

        //2) KICK OFF LIVE REMOTE SYNCING - WORKS EVEN IF STARTING IN OFFLINE
        // datastore.twoWaySyncDB(app.cache.localdb,app.cache.remoteusersdb);
        datastore.localSyncDB(app.cache.localusersdb,app.cache.remoteusersdb);
        datastore.remoteSyncDB(app.cache.localprojdb,app.cache.remoteprojdb);

        //3) THIS NEEDS TO BE GOTTEN FROM LOCAL PROJECTS OR SERVER
        app.cache.localprojdb.get("hrp_projects").then(function (doc) {
            app.cache.projects = doc;

            //THERE SHOULD BE AT LEAST 1 PROJECT
            if(0 in app.cache.projects["projects"]){
                app.loadProjects(app.cache.projects["projects"]);

                //ALL SET UP NOW Reveal Signin Form 
                app.transitionToPanel($("#step_zero"));
            }else{
                //DELIBERATLEY THROW ERROR
                throw err;
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

            //ONE TIME DEAL
            $("#main").addClass("loaded");
            //SPECIAL RULES ENTERING INTO DIFFERNT "PAGES"
            if(next == "consent_one"){
                app.cache.user.project_id    = $("select[name='project_id']").val();
                app.cache.user.user_id       = $("select[name='user_id']").val();
                app.cache.user.lang          = $("select[name='language']").val();

                if(!$("header hgroup h3").length){
                    $("header hgroup").append($("<h3>").text("Project : " + app.cache.p_id.toUpperCase() + ", Participant : " + app.cache.pu_id));
                }

                //SAVE USER TO DB
                // app.writeDB(app.cache.user);
            }

            if(next == "step_one" && $(this).hasClass("endwalk")){
                app.stopWatch(app.cache.user.positionTrackerId);
            }

            if(next == "step_two" && !$(this).hasClass("continuewalk")){
                //THIS KICKS OFF THE POSITION TRACKER
                app.cache.user.positionTrackerId = app.startWatch(8000);
            }

            if(next == "finish"){
                $("nav").hide();
            }

            //TRANSITION TO NEXT PANEL
            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next));
            return false;
        });

        //ADD EVENTS TO device Actions
        $(".daction").click(function(){
            if($(this).hasClass("camera")){
                //GET CURRENT PANEL
                var panel   = $(this).closest(".panel");
                var next    = $(this).data("next");
                app.takePhoto();

                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#"+next));
            }else{
                app.recordAudio();

                var panel   = $(this).closest(".panel");
                var next    = $(this).data("next");

                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#"+next));
                $(".vote.up").removeClass("on").removeClass("off");
                $(".vote.down").removeClass("on").removeClass("off");
            }
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

            if(tempnext == "step_two"){
                $(".vote.up").removeClass("on").removeClass("off");
                $(".vote.down").removeClass("on").removeClass("off");
            }

            if(app.cache.user.positionTrackerId != null){
                // STOPS THE POSITION TRACKER
                app.stopWatch(app.cache.user.positionTrackerId);
            }

            app.closeCurrentPanel($(".panel.loaded"));
            app.transitionToPanel($("#"+tempnext));
            return false;
        });

        $(".vote").click(function(){
            var curPhoto = app.cache.user.photos.length-1;
            $(".vote.up").removeClass("on").removeClass("off");
            $(".vote.down").removeClass("on").removeClass("off");
            if($(this).hasClass("up")){
                // upvote
                app.cache.user.photos[curPhoto].goodbad = 1;
                $(".vote.up").addClass("on");
                $(".vote.down").addClass("off");
            }else{
                // downvote
                app.cache.user.photos[curPhoto].goodbad = -1;
                $(".vote.down").addClass("on");
                $(".vote.up").addClass("off");
            }
            return false;
        });

        $(".listen").click(function(){
            var url = $(this).attr("href");
            var my_media = new Media(url,
                 function () { console.log("playAudio():Audio Success"); }
                ,function (err) { console.log(err.message); }
            );

            my_media.play();
            my_media.release();
            return false;
        });
    }

    ,closeCurrentPanel: function(panel){
        panel.removeClass("loaded").delay(50).queue(function(next){
            $(this).hide();
            next();
        });
    }

    ,transitionToPanel: function(panel,nosave){
        app.cache.user.history.push(panel.attr("id"));
        panel.show().delay(250).queue(function(next){
            $(this).addClass("loaded");
            next();
        });
    }

    ,loadProjects : function(projects){
        app.cache.u_select  = {};
        app.cache.l_select  = {};
        var first_pid       = false;

        //NOW POPULATE THE POSSIBLE PROJECT OPTIONS + AVAILABLE USERIDs + LANGUAGE CHOICES
        for(var i in projects){
            var p = projects[i];
            if(!first_pid){
                first_pid   = p["project_id"];
            } 

            //SEARCH LOCAL USERS DB FOR USERS WITH PARTIAL COLLATED uuid + project_id
            var partial_id  = datastore.pouchCollate([app.cache.uuid, p["project_id"]]);

            app.cache.localusersdb.allDocs({
                // IF NO OPTION, RETURN JUST _id AND _rev (FASTER)
                 startkey   : partial_id
                ,endkey     : partial_id + "\ufff0"
            }).then(function (res) {
                // console.log("will always return total docs: " + res["total_rows"]);
                //SET THE NEXT AVAILABLE USER OBJECT _id
                app.cache.u_select[p["project_id"]] = (res["rows"].length + 1);

                var p_option = $("<option>").val(p["project_id"]).text(p["project_id"]);
                $("select[name='project_id']").append(p_option);

                var l_temp  = [];
                for(var l in p["lang"]){
                    var l_option = $("<option>").val(p["lang"][l]["lang"]).text(p["lang"][l]["language"]);
                    l_temp.push(l_option);
                }
                app.cache.l_select[p["project_id"]]  = l_temp;
            }).then(function(){
                //SET UP THE OPTIONS FOR THE FIRST PROJECT
                app.updateSetup(first_pid);
                app.updateLanguage(first_pid);

                //SET UP PROJECT SPECIFIC OPTIONS
                $("select[name='project_id']").change(function(){
                    //ON PROJECT CHANGE, UPDATE USERID CHOICES + LANGUAGE CHOICES AND INITIAL ENGLISH TRANSLATION
                    var proj_id = $(this).val();
                    app.updateSetup(proj_id);
                    app.updateLanguage(proj_id);
                });
                $("select[name='language']").change(function(){
                    //REAL TIME LANGUAGE TRANSLATION UPDATES
                    var proj_id = $("select[name='project_id']").val();
                    var lang_id = $(this).val();
                    app.updateLanguage(proj_id,lang_id);
                });
            }).catch(function(err){
                console.log("ERROR localusers tables:");
                datastore.showError(err);
            });
        }    
    }

    ,updateSetup : function(projid){
        var u_opts  = app.cache.u_select[projid];
        var l_opts  = app.cache.l_select[projid];
        
        var setnext_id      = datastore.pouchCollate([app.cache.uuid, projid, u_opts]);
        app.cache.p_id      = projid;
        app.cache.pu_id     = u_opts;

        //SET NEXT AVAILABLE USER OBJ _id FOR PROJECT
        app.cache.next_id   = setnext_id;
        $("b.user_id").text(u_opts);

        //UPDATE LANGUAGE OPTIONS BY PROJECT
        $("select[name='language']").empty();
        for(var l in l_opts){
            $("select[name='language']").append(l_opts[l]);
        }
    }

    ,updateLanguage : function(projid,lang){
        lang = !lang ? "en" :lang;
        for(var p in app.cache.projects["projects"]){
            var project = app.cache.projects["projects"][p];
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
        // keep this var in data store so it can be cleared on logout (or whenever).
        var activeWatch = setInterval(app.trackPosition, freq);
        return activeWatch;
    }

    ,stopWatch: function(activeWatch){
        clearInterval(activeWatch);
        app.cache.user.positionTrackerId = null;
    }
    
    ,trackPosition: function(){
        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log("fire getCurrentPosition");
                var lastPos = app.cache.user.geotags[app.cache.user.geotags.length - 1];
                var curdist = app.cache.user.hasOwnProperty("currentDistance") ? app.cache.user.currentDistance : 0;
                var prvLat  = lastPos > 0 ? lastPos.latitude  : position.coords.latitude;
                var prvLong = lastPos > 0 ? lastPos.longitude : position.coords.longitude;
                var curLat  = position.coords.latitude;
                var curLong = position.coords.longitude;
                curdist     = curdist + calculateDistance(prvLat, prvLong, curLat, curLong);
                app.cache.user.currentDistance = curdist;

                var curpos          = {};
                curpos.lng          = curLong;
                curpos.lat          = curLat;
                curpos.altitude     = position.coords.altitude;
                curpos.heading      = position.coords.heading;
                curpos.speed        = position.coords.speed;
                curpos.timestamp    = position.timestamp;
                app.cache.user.geotags.push(curpos);

                $('#distance').text(curdist);
                $('#currentLat').text(curLat.toFixed(6));
                $('#currentLon').text(curLong.toFixed(6));

                // Create the map
                var myOptions = {
                    zoom : 16,
                    center : app.cache.user.geotags[0],
                    mapTypeId : google.maps.MapTypeId.ROADMAP
                }

                if(app.cache.curmap != null){
                    var map = app.cache.curmap;
                }else{
                    var map         = new google.maps.Map(document.getElementById("map"), myOptions);
                    app.cache.curmap = map;
                }

                // Uncomment this block if you want to set a path
                // Create the polyline's points
                for(var i = 0; i < 5; i++) {
                    // Create a random point using the user current position and a random generated number.
                    // The number will be once positive and once negative using based on the parity of i
                    // and to reduce the range the number is divided by 10
                    app.cache.user.geotags.push(
                      new google.maps.LatLng(
                        position.coords.latitude + (Math.random() / 10 * ((i % 2) ? 1 : -1)),
                        position.coords.longitude + (Math.random() / 10 * ((i % 2) ? 1 : -1))
                      )
                    );
                }
                
                // // Create the array that will be used to fit the view to the points range and
                // // place the markers to the polyline's points
                // var latLngBounds = new google.maps.LatLngBounds();
                // for(var i = 0; i < app.cache.user.geotags.length; i++) {
                //     latLngBounds.extend(app.cache.user.geotags[i]);
                //     // Place the marker
                //     new google.maps.Marker({
                //       map: map,
                //       position: app.cache.user.geotags[i],
                //       title: "Point " + (i + 1)
                //     });
                // }
                // // Creates the polyline object
                // var polyline = new google.maps.Polyline({
                //     map: map,
                //     path: app.cache.user.geotags,
                //     strokeColor: '#0000FF',
                //     strokeOpacity: 0.7,
                //     strokeWeight: 1
                // });
                // // Fit the bounds of the generated points
                // map.fitBounds(latLngBounds);
                
                //SAVE USER TO DB
                app.writeDB(app.cache.user);
            }
            ,function(err){
                console.log("error?");
                console.log(err);
            }
            ,{
                enableHighAccuracy: true
            });
    }

    ,tagLocation: function(){
        //GEOLOCATION
        var curpos = {};
        navigator.geolocation.getCurrentPosition(function(position) {
            curpos.longitude    = position.coords.longitude;
            curpos.latitude     = position.coords.latitude;
            curpos.altitude     = position.coords.altitude;
            curpos.heading      = position.coords.heading;
            curpos.speed        = position.coords.speed;
            curpos.timestamp    = position.timestamp;
        });
        return curpos;
    }

    ,takePhoto: function(){
        // take pic
        // save pic filename + geotag location
        navigator.camera.getPicture( 
            function(fileurl){
                fileurl = "data:image/jpeg;base64," + fileurl;

                var geotag = app.tagLocation();
                app.cache.user.photos.push({
                         "path"     : fileurl
                        ,"geotag"   : geotag 
                        ,"synced"   : false
                        ,"audio"    : null
                        ,"goodbad"  : null
                    });
                
                //make sure the audio gets the proper photo to save to
                var thispic_i = app.cache.user.photos.length - 1;
                $(".daction.audio").cache("photo_i",thispic_i);

                //SAVE USER TO DB
                app.writeDB(app.cache.user);

                $("#recent_pic").attr("src",fileurl);
                
                //NOW ADD THIS TO THE VIEW #mediacaptured
                var newitem = $("<li>").addClass("mediaitem");
                var newlink = $("<a>").attr("href","#").html($("<span>").text("Add geo/time + sync status?"));
                var newthum = $("<img>").attr("src",fileurl);
                newlink.prepend(newthum);
                newitem.append(newlink);
                $(".nomedia").hide();
                $("#mediacaptured").append(newitem);
            }
            ,function(errmsg){
                console.log(errmsg);
            }
            ,{ 
                 quality: 50
                ,destinationType: Camera.DestinationType.CACHE_URL
                ,saveToPhotoAlbum: false
                ,allowEdit: true
            }
        );
        return;
    }

    ,recordAudio: function(){
        //take audio
        //save audio filename + geotag location
        navigator.device.capture.captureAudio(
            function(mediaFiles){
                console.log("sup audio");
                //make sure the audio gets the proper photo to save to
                var thispic_i = $(".daction.audio").cache("photo_i");
                var geotag = app.tagLocation();
                var i, path, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    path = mediaFiles[i].fullPath;
                    app.cache.user.photos[thispic_i].audio = path;
                }
            }
            ,function(error){
                console.log("audio error");
                console.log(error);
            }
            ,{
                duration:10
            }
        );
        return;
    }
};
