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
        app.initCache();

        app.cache.localusersdb      = null; //ref to local users DB
        app.cache.localprojdb       = null; //ref to local copy of projects DB
        app.cache.remoteusersdb     = null; //ref to remote users DB
        app.cache.remoteprojdb      = null; //ref to remote projects DB

        app.cache.projects          = null; //ref to projects list from local proj DB
        app.cache.active_project    = { "_id" : "active_project" }; //active project ID

        app.cache.uuid              = null; //DEVICE UNIQUE ID
        app.cache.platform          = null; //IOS/ANDROID ETC
    }
    
    ,initCache : function(){
        app.cache.user              = null;
        app.cache.user              = config["default_user"]; //NEED TO USE COLLATE
        app.cache.user["_attachments"] = {};
        app.cache.user["photos"]    = [];
        app.cache.user["geotags"]   = [];
        app.cache.user["survey"]    = [];

        app.cache.positionTrackerId = null; //ref to setInterval
        app.cache.curmap            = null; //ref to google map
        app.cache.currentWalkMap    = [];   //array of geotags for current walk
        app.cache.history           = [];   //the app usage forward history

        app.cache.next_id           = null; //NEXT USER ID - POUCH COLLATED
        app.cache.participant_id    = null; //JUST SIMPLE INTEGER

        app.cache.audioObj          = null; //FOR VOICE RECORDINGS
        app.cache.audioStatus       = null;
        app.cache.currentAudio      = null;
    }

    ,bindEvents: function() {
        // The scope of 'this' is the event. 
        // In order to call the 'receivedEvent' we call this.receivedEvent
        // Bind any events that are required on startup. "deviceready" is a must "pause" and "resume" seem useful
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause'  , this.onDevicePause, false);
        document.addEventListener('resume' , this.onDeviceResume, false);
    }

    ,onDevicePause: function() {
        //IF THEY PAUSE WHAT SHOULD HAPPEN?
        //KEEP USER INFO IN THE APP/LOCAL
        console.log("pausing the device ... do anything?");
    }

    ,onDeviceResume: function() {
        //IF THEY RESUME, SHOULD PICK UP WHERE THEY LEFT OFF... 
        //SO NO DO NOT RELOAD PROJECT
        console.log("resuming device ... update anything?");
    }

    ,onDeviceReady: function() {
        //0 CHECK NETWORK STATE, AND GET UUID
        alert("maybe got a problem here");
        var networkState        = utils.checkConnection();
        app.cache.uuid          = device.uuid;
        app.cache.platform      = device.platform;

        //1) (RE)OPEN LOCAL DB
        app.cache.localusersdb  = datastore.startupDB(config["database"]["users_local"]); 
        app.cache.localprojdb   = datastore.startupDB(config["database"]["proj_local"]);
        
        app.cache.remoteusersdb = datastore.startupDB(config["database"]["users_remote"]);
        app.cache.remoteprojdb  = datastore.startupDB(config["database"]["proj_remote"]);

        // DELETE!
        // datastore.deleteLocalDB();
        // return;
        
        //2) KICK OFF LIVE REMOTE SYNCING - WORKS EVEN IF STARTING IN OFFLINE
        datastore.localSyncDB(app.cache.localusersdb,app.cache.remoteusersdb);
        datastore.remoteSyncDB(app.cache.localprojdb,app.cache.remoteprojdb);

        //3) CHECK IF THERE IS AN ACTIVE PROJECT SET UP YET
        app.cache.localprojdb.get("active_project").then(function (doc) {
            //LOCAL DB ONLY, SET CURRENT ACTIVE PROJECT ARRAY KEY
            app.cache.active_project = doc;
            throw err;
        }).catch(function (err) {
            //EITHER WAY END UP  HERE, USING THIS MORE LIKE A then but also else and error catch
            ourvoice.getAllProjects();
        });

        //4) ADD EVENTS TO VARIOUS BUTTONS/LINKS THROUGH OUT APP
        $(".button[data-next]").not(".camera,.audiorec").click(function(){
            //GET CURRENT PANEL
            var panel       = $(this).closest(".panel");
            var next        = $(this).data("next");
            var no_history  = false;

            if(next == "step_zero"){
                var pid         = $("#admin_projid").val().toUpperCase();
                var pid_correct = null;
                var p_pw        = null;

                for(var i in app.cache.projects["project_list"]){
                    var p = app.cache.projects["project_list"][i];
                    if(pid == p.project_id){
                        p_pw        = app.cache.projects["project_list"][i]["project_pass"]; 
                        pid_correct = i;
                    }
                }

                if(p_pw != null && $("#admin_pw").val() == p_pw && pid_correct != null){
                    $("#main").removeClass("loaded"); 
                    $("#admin_pw").val(null);
                    $("#admin_projid").val(null);

                    app.initCache();
                    ourvoice.resetDevice();

                    //THIS WILL SET THE device (local DB) TO USE THIS PROJECT
                    app.cache.active_project["i"] = pid_correct;
                    datastore.writeDB(app.cache.localprojdb, app.cache.active_project);

                    //LETS RELOAD THE LOCAL DB AT THIS POINT
                    ourvoice.getAllProjects();
                }else{
                    app.showNotif("Wrong ProjectID or Password");
                    return false;
                }
            }else{
                //ONE TIME DEAL if NOT STEP ZERO
                $("#main").addClass("loaded");
            }

            //SPECIAL RULES ENTERING INTO DIFFERNT "PAGES"
            if(next == "consent_one"){
                app.cache.user.project_id    = app.cache.active_project.i;
                app.cache.user.lang          = $("select[name='language']").val();
                app.cache.user.user_id       = app.cache.participant_id;
                app.cache.user._id           = app.cache.next_id; //COLLATED

                if(!$("header hgroup h3").length){
                    $("header hgroup").append($("<h3>").addClass("delete_on_reset").text("Project : " + app.cache.active_project["proj_id"].toUpperCase() + ", Participant : " + app.cache.participant_id));
                }
            }

            if(next == "step_two" && !$(this).hasClass("continuewalk")){
                ourvoice.startWatch(8000);
            }

            if(next == "step_three"){
                ourvoice.plotGoogleMap();
            }

            if(next == "survey"){
                ourvoice.stopWatch();
                $("nav").hide();
            }

            if(next == "finish"){
                no_history = true;
            
                //STORE THE USER AND THEN WIPE THE CACHE
                // console.log("SAVING THE USER NOW!!!");
                // console.log(app.cache.user.survey);
                // console.log(app.cache.user.photos);
                // console.log(app.cache.user.geotags);

                console.log("finished! show user obj to be saved");
                console.log(app.cache.user);
                datastore.writeDB(app.cache.localusersdb , app.cache.user);
            }

            //TRANSITION TO NEXT PANEL
            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next),no_history);
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

            ourvoice.deletePhoto(app.cache.user.photos[thispic_i]);
            return false;
        });

        $(".panel").on("click",".previewthumb",function(){
            //OPEN UP PREVIEW PAGE FOR PHOTO
            var thispic_i   = $(this).data("photo_i");
            var fileurl     = $(this).find("img").attr("src");
            ourvoice.previewPhoto(app.cache.user.photos[thispic_i], fileurl);

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

        //ADD EVENTS TO device Actions
        $(".panel").on("click",".daction",function(){
            var panel   = $(this).closest(".panel");
            var next    = $(this).data("next");

            var savehistory = false;
            if($(this).hasClass("camera")){
                //GET CURRENT PANEL
                ourvoice.takePhoto();
            }else{
                var photo_i = $(this).data("photo_i");
                ourvoice.recordAudio(photo_i);
                savehistory = true;
            }

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next),savehistory);
            return false;
        });

        $("#mediacaptured").on("click",".audiorec", function(){
            var panel   = $(this).closest(".panel");
            var next    = "audio_record";
            var photo_i = $(this).data("photo_i");

            if( $(this).hasClass("hasAudio") ){
                ourvoice.startPlaying(photo_i);
            }else{
                ourvoice.recordAudio(photo_i);
            }

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next), true);

            //I WANT THEM BOTH TO GO TO THE AUDIO PAGE, THEN RETURN
            return false;
        });

        $("#audio_controls").on("click","a", function(){
            var ctl_id  = $(this).attr("id");
            var photo_i = $(this).data("photo_i");

            switch(ctl_id){
                case "ctl_stop":                 
                    app.cache.audioStatus = "stop_release";
                    ourvoice.stopRecording(photo_i);
                    var panel = $(this).closest(".panel");
                    var next  = "step_two";
                    //CHANGE THE RECORD BUTTON IN PIC PREVIEW
                    $("#pic_review .device_actions").addClass("has_audio");

                    //TO PLAY or RECORD NEW
                    app.closeCurrentPanel(panel);
                    app.transitionToPanel($("#"+next),true);
                break

                default:
                break;
            }

            return false;
        });

        $("#walk_survey").on("change",":input",function(){
            //STORE SURVEY ANSWERS
            var val = $(this).val();
            var nam = $(this).attr("name");
            app.cache.user.survey.push({"name" : nam , "value" : val});
            return;
        });

        $("#resetdevice").click(function(){
            //DITCH USER TOO
            $("#admin_null").show();
            $("#admin_passed").hide();

            app.closeCurrentPanel($("#step_zero"));
            ourvoice.adminSetup();
            return false;
        });

        $(".help").click(function(){
            app.closeCurrentPanel($(".panel.loaded"));
            app.transitionToPanel($("#help"));
            return false;
        });

        $(".back").click(function(){
            app.goBack();
        });

        var myElement   = document.getElementById('main');
        var hammertime  = new Hammer(myElement);
        hammertime.on('swipeleft', function(ev) {
            //swipe left go to forward?
            console.log("swiped left");
        });
        hammertime.on('swiperight',function(){
            //swipe right to go back
            app.goBack()
        });

        //pic review media items.
        $(".mi_slideout").click(function(){
            $("#mediacaptured").addClass("preview");
            return false;
        });
        $("#mediacaptured .slideclose").click(function(){
            $("#mediacaptured").removeClass("preview");
        });

        $(document).on("click", function(event){
            if (!$(event.target).closest('#notif').length) {
                $("#notif").fadeOut("fast");
            }

            if (!$(event.target).closest('#mediacaptured').length) {
                $("#mediacaptured").removeClass("preview");
            }
        });

        $("#end_session").click(function(){
            //THIS DEVICE HAS BEEN SET UP TO USE A PROJECT
            ourvoice.resetDevice();            
            ourvoice.loadProject(app.cache.projects["project_list"][app.cache.active_project.i]);

            app.closeCurrentPanel($("#finish"));
            app.transitionToPanel($("#step_zero"),1);
            return false;
        });
    }

    ,goBack : function(){
        if(app.cache.history.length <= 1){
            //NO HISTORY TO GO BACK TO
            return false;
        }
        var mostrecent  = app.cache.history.pop(); //not the most recent one.
        var tempnext    = app.cache.history.pop(); //this is the one we want
        if(tempnext == "step_zero"){
            $("#main").removeClass("loaded");
        }

        app.closeCurrentPanel($(".panel.loaded"));
        app.transitionToPanel($("#"+tempnext));
        return false;
    }

    ,closeCurrentPanel: function(panel){
        panel.removeClass("loaded").delay(50).queue(function(next){
            $(this).hide();
            next();
        });
        return;
    }

    ,transitionToPanel: function(panel,nosave){
        if(!nosave){
            //SOME THINGS WE DONT WANT TO SAVE TO HISTORY
            app.cache.history.push(panel.attr("id"));
        }
        panel.show().delay(250).queue(function(next){
            $(this).addClass("loaded");
            next();
        });
        return;
    }

    ,showNotif : function(title,bodytext){
        $("#notif h3").text(title);
        if(bodytext){
            $("#notif p").text(bodytext);
        }
        $("#notif").fadeIn("fast");
        return;
    }
};
