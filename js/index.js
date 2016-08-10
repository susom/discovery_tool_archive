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
        app.cache.currentWalkMap    = [];
        app.cache.curmap            = null;

        app.cache.localusersdb      = null;
        app.cache.localprojdb       = null;
        app.cache.remoteusersdb     = null;
        app.cache.remoteprojdb      = null;

        app.cache.uuid              = null; //DEVICE UNIQUE ID
        app.cache.proj_id           = null; 
        app.cache.next_id           = null; //NEXT USER ID - POUCH COLLATED
        app.cache.participant_id    = null;
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
                app.cache.user.lang          = $("select[name='language']").val();
                app.cache.user.user_id       = app.cache.participant_id;
                app.cache.user._id           = app.cache.next_id; //COLLATED

                if(!$("header hgroup h3").length){
                    $("header hgroup").append($("<h3>").text("Project : " + app.cache.proj_id.toUpperCase() + ", Participant : " + app.cache.participant_id));
                }
            }

            if(next == "step_one" && $(this).hasClass("endwalk")){
                app.stopWatch();
            }

            if(next == "step_two" && !$(this).hasClass("continuewalk")){
                app.startWatch(8000);
            }

            if(next == "step_three"){
                app.plotGoogleMap();
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

            if(app.cache.user.positionTrackerId != null){
                // STOPS THE POSITION TRACKER
                app.stopWatch(app.cache.user.positionTrackerId);
            }

            app.closeCurrentPanel($(".panel.loaded"));
            app.transitionToPanel($("#"+tempnext));
            return false;
        });

        $(".panel").on("click",".votes .vote", function(){
            var curPhoto    = $(this).data("photo_i");
           
            $(".vote.up[rel='" + curPhoto + "'],.vote.down[rel='" + curPhoto + "']").removeClass("on").removeClass("off");
            
            if($(this).hasClass("up")){
                // upvote
                app.cache.user.photos[curPhoto].goodbad = 1;
                $("a.up[rel='" + curPhoto + "']").addClass("on");
                $("a.down[rel='" + curPhoto + "']").addClass("off");
            }else{
                // downvote
                app.cache.user.photos[curPhoto].goodbad = -1;
                $("a.down[rel='" + curPhoto + "']").addClass("on");
                $("a.up[rel='" + curPhoto + "']").addClass("off");
            }
            return false;
        });

        $(".panel").on("click",".trashit", function(){
            var thispic_i  = $(this).data("photo_i");
            app.deletePhoto(app.cache.user.photos[thispic_i]);
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

        $("#mediacaptured").on("click",".photobomb",function(){
            var thispic_i = $(this).data("photo_i");
            app.previewPhoto(app.cache.user.photos[thispic_i]);

            var panel   = $(this).closest(".panel");
            var next    = "pic_review";

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next));
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
        
        var setnext_id              = datastore.pouchCollate([app.cache.uuid, projid, u_opts]);
        app.cache.proj_id           = projid;
        app.cache.participant_id    = u_opts;

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
        //SAVE GEO TAGS FOR MAP
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

                console.log("current distance : "+app.cache.user.currentDistance);
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
                  new google.maps.LatLng( curLat, curLong )
                );

                $('#distance').text(curdist);
                $('#currentLat').text(curLat.toFixed(6));
                $('#currentLon').text(curLong.toFixed(6));
            }
            ,function(err){
                console.log("error?");
                console.log(err);
            }
            ,{
                enableHighAccuracy: true
            });
    }

    ,plotGoogleMap: function(){
        // Create the map
        var myOptions = {
            zoom        : 16,
            center      : app.cache.user.currentWalkMap[0],
            mapTypeId   : google.maps.MapTypeId.ROADMAP
        }

        if(app.cache.curmap != null){
            var map             = app.cache.curmap;
        }else{
            var map             = new google.maps.Map(document.getElementById("google_map"), myOptions);
            app.cache.curmap    = map;
        }

        // Create the array that will be used to fit the view to the points range and
        // place the markers to the polyline's points
        var latLngBounds        = new google.maps.LatLngBounds();
        var numtags             = app.cache.currentWalkMap.length;
        for(var i = 0; i < numtags; i++) {
            latLngBounds.extend(app.cache.currentWalkMap[i]);
            // Place the marker
            new google.maps.Marker({
              map       : map,
              position  : app.cache.user.geotags[i],
              title     : "Point " + (i + 1)
            });
        }

        // Creates the polyline object
        var polyline = new google.maps.Polyline({
            map             : map,
            path            : app.cache.user.geotags,
            strokeColor     : '#0000FF',
            strokeOpacity   : 0.7,
            strokeWeight    : 1
        });
        // Fit the bounds of the generated points
        map.fitBounds(latLngBounds);
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

                app.previewPhoto(app.cache.user.photos[thispic_i]);

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

    ,recordAudio: function(){
        //take audio
        //save audio filename + geotag location
        navigator.device.capture.captureAudio(
            function(mediaFiles){
                console.log("sup audio");
                //make sure the audio gets the proper photo to save to
                var thispic_i = $(".daction.audio").data("photo_i");
                var geotag = app.tagLocation();
                var i, path, len;
                for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                    path = mediaFiles[i].fullPath;
                    app.cache.user.photos[thispic_i].audio = path;
                }
            }
            ,function(error){
                console.log("audio error");
                utils.dump(error);
            }
            ,{
                duration:10
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
        $("#pic_review a.vote").data("photo_i",photo_i).attr("rel",photo_i);
        $("#recent_pic").attr("src",fileurl);
    }

    ,deletePhoto: function(_photo){
        var photo_i = app.cache.user.photos.indexOf(_photo);
        app.cache.user.photos[photo_i] = null;
        $("#mediacaptured a[rel='"+photo_i+"']").parents(".mediaitem").fadeOut("slow",function(){
            var _this = $(this);
            setTimeout(function(){
                _this.remove();
            },1000);
        });
        return;
    }

    ,addMediaItem:function(_photo){
        var photo_i     = app.cache.user.photos.indexOf(_photo);
        var fileurl     = _photo["path"];
        var geotag      = _photo["geotag"];
        var time        = utils.readableTime(geotag.timestamp);

        //NOW ADD THIS TO THE VIEW #mediacaptured
        var newitem     = $("<li>").addClass("mediaitem").addClass("photo_"+photo_i);
        var newlink     = $("<a>").addClass("photobomb").attr("href","#").data("photo_i",photo_i).attr("rel",photo_i).html($("<span>").text("@ " + time));
        var newthum     = $("<img>").attr("src",fileurl);
        
        var trash       = $("<a>").addClass("trashit").attr("href","#").data("photo_i",photo_i).html("&#128465;");
        var thumbs      = $("<div>").addClass("votes");
        var thumbsup    = $("<a>").attr("href","#").addClass("vote").addClass("up").data("photo_i",photo_i).attr("rel",photo_i);
        var thumbsdown  = $("<a>").attr("href","#").addClass("vote").addClass("down").data("photo_i",photo_i).attr("rel",photo_i);
        thumbs.append(thumbsup);
        thumbs.append(thumbsdown);
        newlink.prepend(newthum);
        newitem.append(newlink);
        newitem.append(thumbs);
        newitem.append(trash);

        $(".nomedia").hide();
        $("#mediacaptured").append(newitem);
    }
};
