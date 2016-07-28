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
        app.cache.localdb           = null;
        app.cache.remotedb          = null;
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
    ,onDeviceReady: function(device) {
        //0 CHECK NETWORK STATE
        var networkState    = utils.checkConnection();

        //1) Check if local DB is up/ok
        app.cache.localdb   = datastore.startupDB(config["database"]["test_local"]); 
        app.cache.remotedb  = datastore.startupDB(config["database"]["test_remote"]);

        //2) KICK OFF LIVE SYNC
        if(networkState.online){
            // kick off sync
            // datastore.twoWaySyncDB(app.cache.localdb,app.cache.remotedb);
            // datastore.liveDB(app.cache.localdb);
        }


        var catdb = new PouchDB('http://localhost:5984/kittens'); 




        // datastore.allDocs(app.cache.localdb);
        // datastore.writeDB(app.cache.user,app.cache.localdb);
        
//ALL SET UP NOW Reveal Signin Form 
app.transitionToPanel($("#step_zero"));
return;



        //THIS NEEDS TO BE GOTTEN FROM REMOTE SERVER OR UPON APP DOWNLOAD
        app.cache.projects  = app.getDB("hrp_projects");
        if(!app.cache.projects){
            //THIS SHOULD BE ON DEVICE, BUT IF NOT AJAX TO GET
            app.cache.projects  = config["default_projects"];

            //NOW WRITE THIS TO THE LOCAL DEVICE DB
            app.writeDB(app.cache.projects);
        }
        
        //THERE SHOULD BE AT LEAST 1 PROJECT
        var first_p = app.cache.projects["_projects"][0]["_project_id"];
        app.cache.u_select = {};
        app.cache.l_select = {};
        if(first_p){
            //NOW POPULATE THE POSSIBLE PROJECT OPTIONS + AVAILABLE USERIDs + LANGUAGE CHOICES
            for(var i in app.cache.projects["_projects"]){
                var p = app.cache.projects["_projects"][i];
                var p_option = $("<option>").val(p["_project_id"]).text(p["_project_id"]);
                $("select[name='project_id']").append(p_option);

                var u_temp  = [];
                for(var u in p["_user_ids"]){
                    var u_option = $("<option>").val(p["_user_ids"][u]).text(p["_user_ids"][u]);
                    u_temp.push(u_option);
                }
                app.cache.u_select[p["_project_id"]]  = u_temp;

                var l_temp  = [];
                for(var l in p["_lang"]){
                    var l_option = $("<option>").val(p["_lang"][l]["lang"]).text(p["_lang"][l]["language"]);
                    l_temp.push(l_option);
                }
                app.cache.l_select[p["_project_id"]]  = l_temp;
            }
            app.updateSetup(first_p);
            app.updateLanguage(first_p);

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
        }else{
            //IN CASE THERE are NO PROJECTS
            var cantconnect = $("<h3>").addClass("loadfail").text("Sorry, unable to connect to server.  Please close the app and try again later.");
            $(".title hgroup").append(cantconnect);
            return;
        }

        //ALL SET UP NOW Reveal Signin Form 
        app.transitionToPanel($("#step_zero"));

        //ADD EVENTS TO STEP BUTTONS
        $(".button").click(function(){
            //GET CURRENT PANEL
            var panel   = $(this).closest(".panel");
            var next    = $(this).cache("next");

            //ONE TIME DEAL
            $("#main").addClass("loaded");

            //SPECIAL RULES ENTERING INTO DIFFERNT "PAGES"
            if(next == "consent_one"){
                app.cache.user.project_id    = $("select[name='project_id']").val();
                app.cache.user.user_id       = $("select[name='user_id']").val();
                app.cache.user.lang          = $("select[name='language']").val();

                if(!$("header hgroup h3").length){
                    $("header hgroup").append($("<h3>").text("Project : " + app.cache.user.project_id.toUpperCase() + ", User : " + app.cache.user.user_id));
                }

                //SAVE USER TO DB
                app.writeDB(app.cache.user);
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
                var next    = $(this).cache("next");
                app.takePhoto();

                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#"+next));
            }else{
                app.recordAudio();

                var panel   = $(this).closest(".panel");
                var next    = $(this).cache("next");

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

    ,updateSetup : function(projid){
        var u_opts  = app.cache.u_select[projid];
        var l_opts  = app.cache.l_select[projid];
        $("select[name='user_id']").empty();
        for(var u in u_opts){
            $("select[name='user_id']").append(u_opts[u]);
        }
        $("select[name='language']").empty();
        for(var l in l_opts){
            $("select[name='language']").append(l_opts[l]);
        }
    }

    ,updateLanguage : function(projid,lang){
        lang = !lang ? "en" :lang;
        for(var p in app.cache.projects["_projects"]){
            var project = app.cache.projects["_projects"][p];
            if(project["_project_id"] == projid){
                var trans = project["_lang"];
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
