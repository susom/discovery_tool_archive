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
    cache : {
        "active_project" : { "_id" : "active_project" }
    }

    // Application Constructor
    ,initialize: function() {
        this.initCache();
        this.bindEvents();
    }
    
    ,initCache : function(){
        app.cache.db_fail_timeout       = null;
        app.cache.testgoodbad           = null;

        app.cache.user                  = null;
        app.cache.user                  = config["default_user"]; //NEED TO USE COLLATE
        app.cache.user["_attachments"]  = {};
        app.cache.user["photos"]        = [];
        app.cache.user["geotags"]       = [];
        app.cache.user["survey"]        = [];

        delete app.cache.user._id;
        delete app.cache.user._rev;

        app.cache.positionTrackerId     = null; //ref to setInterval
        app.cache.curmap                = null; //ref to google map
        app.cache.currentWalkMap        = [];   //array of geotags for current walk
        app.cache.history               = ["step_zero"];   //the app usage forward history

        app.cache.next_id               = null; //NEXT USER ID - POUCH COLLATED
        app.cache.participant_id        = null; //JUST SIMPLE INTEGER

        app.cache.audioObj              = {}; //FOR VOICE RECORDINGS
        app.cache.audioStatus           = null;
        app.cache.currentAudio          = null;
        app.cache.playbackTimers        = {};
        app.log("init app()");
    }

    ,bindEvents: function() {
        // The scope of 'this' is the event. 
        // In order to call the 'receivedEvent' we call this.receivedEvent
        // Bind any events that are required on startup. "deviceready" is a must "pause" and "resume" seem useful
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause'  , this.onDevicePause, false);
        document.addEventListener('resume' , this.onDeviceResume, false);
        app.log("bindEvents()");
    }

    ,onDevicePause: function() {
        //IF THEY PAUSE WHAT SHOULD HAPPEN?
        //KEEP USER INFO IN THE APP/LOCAL
        // app.log("DEVICE PAUSING");
    }

    ,onDeviceResume: function() {
        //IF THEY RESUME, SHOULD PICK UP WHERE THEY LEFT OFF... 
        //SO NO DO NOT RELOAD PROJECT
        // app.log("DEVICE RESUMING");
    }

    ,onDeviceReady: function() {
        //0 CHECK NETWORK STATE, AND GET UUID
        var networkState        = utils.checkConnection();
        app.cache.uuid          = device.uuid;
        app.cache.platform      = device.platform;
        app.cache.audioformat   = app.cache.platform == "iOS" ? "wav" : "mp3";

        //1) OPEN LOCAL AND REMOTE DB
        app.cache.remoteusersdb = config["database"]["users_remote"];
        app.cache.remotelogdb   = config["database"]["log_remote"];  
        app.cache.remoteprojdb  = config["database"]["proj_remote"];

        app.cache.locallogdb    = datastore.startupDB(config["database"]["log_local"]);
        app.cache.localusersdb  = datastore.startupDB(config["database"]["users_local"]); 
        app.cache.localprojdb   = datastore.startupDB(config["database"]["proj_local"]);

        // CLEAN SLATE 
        // datastore.deleteLocalDB();
        // return;

        //2) PUSH ONCE 
        ourvoice.syncLocalData(); //LOCAL DATA TO REMOTE
        // return;
        
        app.cache.db_fail_timeout = setTimeout(function(){
            $("#loading_message").text("Could not reach database, try again later");
            $("#main").addClass("failed");
        },8000);

        if(networkState){
            // $("#loading_message").text("Online");
            datastore.remoteSyncDB(app.cache.localprojdb, app.cache.remoteprojdb, function(){
                //REFRESH REFERENCE TO LOCAL DB AFTER REMOTE SYNC, SINCE NOT ALWAYS RELIABLE ("Null object error")
                app.cache.localprojdb  = datastore.startupDB(config["database"]["proj_local"]);
                app.cache.localprojdb.getAttachment('all_projects', 'index.css').then(function (blobOrBuffer) {
                    var blobURL = URL.createObjectURL(blobOrBuffer);
                    var cssTag  = $("<link>");
                    cssTag.attr("rel" , "stylesheet");
                    cssTag.attr("type", "text/css");
                    cssTag.attr("href", blobURL);
                    $("head").append(cssTag);
                }).catch(function (err) {
                    console.log(err);
                });
                
                //LOOK FOR AN ACTIVE PROJECT IF AVAIALABLE, THEN GET ALL PROJECTS
                ourvoice.getActiveProject();
            });
        }else{
            //JESUS CHRIST
            // $("#loading_message").text("Offline");
            ourvoice.getActiveProject();
        }

        //5) ADD EVENTS TO VARIOUS BUTTONS/LINKS THROUGH OUT APP
        $(".button[data-next]").not(".audiorec,.camera").on("click",function(){
            //GET CURRENT PANEL
            var panel       = $(this).closest(".panel");
            var next        = $(this).data("next");
            var no_history  = false;

            if(next == "admin_view"){
                if($(this).hasClass("uploadbtn")){
                    $(this).addClass("uploading");

                    ourvoice.syncLocalData(); 
                }else{
                    var pw      = $("#admin_master_pw").val();
                    if(pw  == app.cache.projects["project_list"][app.cache.active_project.i]["project_pass"]){
                        $("#admin_master").hide();
                        $("#admin_master_pw").val("");

                        app.cache.localusersdb.allDocs({
                          include_docs: true
                        }).then(function (res) {
                            ourvoice.adminView(res["rows"]);
                            $("#list_data").css("opacity",1);
                        }).catch(function(err){
                            app.log("error allDocs()" + err);
                        });
                    }else{
                        app.showNotif("Oh No!", "Wrong Master Password", function(){});
                        $("#admin_master_pw").val("");
                        return false;
                    }
                }
                return false;
            }

            if(next == "step_zero"){
                var pid         = $("#admin_projid").val().toUpperCase();
                var pid_correct = null;
                var p_pw        = null;

                ourvoice.checkDirtyData();

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

                    navigator.notification.confirm(
                        'Setup of a new project will erase any Discovery Tool data previously saved on this device. Click \'Continue\' to proceed.', // message
                         function(i){
                            if(i == 1){
                                //the button label indexs start from 1 = 'Cancel'
                                return;
                            }
                            ourvoice.resetDevice();

                            // EMPTY LOCAL DATABASE.... 
                            datastore.emptyUsersDB();
                            datastore.emptyLogsDB();

                            //THIS WILL SET THE device (local DB) TO USE THIS PROJECT
                            //RECORD THE ACTIVE PROJECT
                            app.cache.active_project["i"] = pid_correct;
                            datastore.writeDB(app.cache.localprojdb, app.cache.active_project);

                            //LETS RELOAD THE LOCAL DB AT THIS POINT
                            ourvoice.getAllProjects();
                            app.log("Setting up Device with " + app.cache.projects["project_list"][pid_correct]["project_id"]);
                         },            // callback to invoke with index of button pressed
                        'Project Setup',           // title
                        ['Cancel','Continue']     // buttonLabels
                    );
                }else{
                    app.showNotif("Uh Oh!","Wrong ProjectID or Password", function(){});
                    return false;
                }
            }else{
                //ONE TIME DEAL if NOT STEP ZERO
                $("#main").addClass("loaded");
            }

            //SPECIAL RULES ENTERING INTO DIFFERNT "PAGES"
            if(next == "project_about"){}

            if(next == "consent_0"){
                //THIS IS IMPORTANT
                app.cache.user.project_id    = app.cache.active_project.i;
                app.cache.user.lang          = $("select[name='language']").val();
                app.cache.user.user_id       = app.cache.participant_id;
                app.cache.user._id           = app.cache.next_id; //COLLATED
                
                app.log("Starting consent process for User " + app.cache.user._id);
            }
            
            if(next == "step_two" && !$(this).hasClass("continuewalk")){
                $(".mi_slideout").addClass("reviewable");
                ourvoice.startWatch(8000);
                app.log("start  walk");
            }else if($(this).hasClass("continuewalk")){
                $("#recent_pic").attr("src","");
            }

            if(next == "step_three"){
                $(".mi_slideout").addClass("reviewable");
                if(utils.checkConnection()){
                    $("#google_map").show();
                    ourvoice.plotGoogleMap();
                }else{
                    $("#google_map").hide();
                }
            }

            if(next == "survey"){
                ourvoice.stopWatch();

                //FREE UP THE MEMORY FOR THE MEDIA OBJECTS
                ourvoice.clearAllAudio();

                $("nav").hide();
                app.log("start survey");
            }

            if(next == "finish"){
                no_history = true;
                ourvoice.finished();
                app.log("finish with walk/survey");

            }

            //TRANSITION TO NEXT PANEL
            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next),no_history);
            return false;
        });

        $(".panel").on("click",".votes .vote", function(){
            //VOTE GOOD AND/OR BAD
            var curPhoto    = $(this).data("photo_i");
            
            // ONLY REMOVE IF MUTUALLY EXCLUSIVE
            // $(".vote.up[rel='" + curPhoto + "'],.vote.down[rel='" + curPhoto + "']").removeClass("on").removeClass("off");
            
            var updown = "up";
            // 0/null = no votes, 1 = bad vote, 2 = good vote, 3 = both votes WTF
            if($(this).hasClass("up")){
                $("a.up[rel='" + curPhoto + "']").toggleClass("on");
                if($("a.up[rel='" + curPhoto + "']").hasClass("on")){
                    app.cache.user.photos[curPhoto].goodbad = app.cache.user.photos[curPhoto].goodbad+2;
                }else{
                    app.cache.user.photos[curPhoto].goodbad = app.cache.user.photos[curPhoto].goodbad-2;
                }
            }else{
                updown = "down";
                $("a.down[rel='" + curPhoto + "']").toggleClass("on");
                if($("a.down[rel='" + curPhoto + "']").hasClass("on")){
                    app.cache.user.photos[curPhoto].goodbad = app.cache.user.photos[curPhoto].goodbad+1;
                }else{
                    app.cache.user.photos[curPhoto].goodbad = app.cache.user.photos[curPhoto].goodbad-1;
                }
            } 
            
            app.log("voting on photo");

            //RECORD THE VOTE
            datastore.writeDB(app.cache.localusersdb , app.cache.user);
            return false;
        });

        $("#mediacaptured,#pic_review").on("click",".trashit", function(){
            //DELETE A PHOTO (AND ASSOCIATED GEOTAGS/AUDIO)
            var thispic_i   = $(this).data("photo_i");
            var panel       = $(this).closest(".panel");

            if(panel.attr("id") == "pic_review"){
                var next    = "step_two";
                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#"+next),1);
            }

            app.log("delete photo");

            ourvoice.deletePhoto(app.cache.user.photos[thispic_i]);
            return false;
        });

        $("#mediacaptured").on("click",".previewthumb",function(){
            //OPEN UP PREVIEW PAGE FOR PHOTO
            var thispic_i   = $(this).data("photo_i");
            var fileurl     = $(this).find("img").attr("src");
            ourvoice.previewPhoto(app.cache.user.photos[thispic_i], fileurl);

            $("#mediacaptured").removeClass("preview");

            var panel       = $(".panel.loaded");
            var next        = "pic_review";
            if(panel.attr("id") == next){
                return;
            }

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next));
        });

        $(".panel").on("click",".listen", function(){
            var url = $(this).attr("href");
            var my_media = new Media(url,
                 function () {  
                    console.log("playAudio():Audio Success"); 
                }
                ,function (err) { 
                    app.log(err.message); 
                }
            );

            app.log("play audio");

            my_media.play();
            my_media.release();
            return false;
        });

        //ADD EVENTS TO device Actions
        $(".panel").on("click",".daction,.record_another",function(){
            var panel   = $(this).closest(".panel");
            var next    = $(this).data("next");

            var savehistory = false;
            if($(this).hasClass("camera")){
                //GET CURRENT PANEL
                ourvoice.takePhoto(function(){
                    app.closeCurrentPanel(panel);
                    app.transitionToPanel($("#"+next),savehistory);
                });
                app.log("take photo");
            
            }else{
                var photo_i = $(this).data("photo_i");
                ourvoice.recordAudio(photo_i,function(){
                    app.closeCurrentPanel(panel);
                    app.transitionToPanel($("#"+next),savehistory);
                });
                savehistory = true;
            }
            return false;
        });

        $("#mediacaptured").on("click",".audiorec", function(){
            var panel   = $(this).closest(".panel");
            var next    = "audio_record";
            var photo_i = $(this).data("photo_i");

            if( $(this).hasClass("hasAudio") ){
                ourvoice.startPlaying(photo_i);
                app.log("play audio");
            }else{
                ourvoice.recordAudio(photo_i);
                app.log("record audio");
            }

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next), true);

            //I WANT THEM BOTH TO GO TO THE AUDIO PAGE, THEN RETURN
            return false;
        });

        $("#audio_controls").on("click","a", function(){
            var ctl_id  = $(this).attr("id");
            var photo_i = $(this).data("photo_i");
            var recordFileName = $(this).data("recordFileName");

            switch(ctl_id){
                case "ctl_stop":                 
                    app.cache.audioStatus = "stop_release";
                    ourvoice.stopRecording(photo_i,recordFileName);
                    var panel = $(this).closest(".panel");
                    var next  = "pic_review";
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

            //RECORD SURVEY INPUT
            datastore.writeDB(app.cache.localusersdb , app.cache.user);
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

        $("#datastatus").click(function(){
            app.closeCurrentPanel($("#step_zero"));
            $("#admin_master").show();
            $("#list_data").css("opacity",0);
            $("#main").addClass("loaded");
            app.transitionToPanel($("#admin_view"));
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

        $(".list").click(function(){
            app.closeCurrentPanel($(".panel.loaded"));
            $("#admin_master").show();
            $("#list_data").css("opacity",0);
            app.transitionToPanel($("#admin_view"));

            app.log("Clicking review thumb");
        });

        var myElement   = document.getElementById('main');
        var hammertime  = new Hammer(myElement);
        // hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
        hammertime.on('swipeleft', function(ev) {
            //swipe left go to forward?
            console.log("swiped left");
        });
        hammertime.on('swiperight',function(){
            //swipe right to go back
            console.log("swiped right");
            // app.goBack()
        });

        //REVIEW PHOTOS SLIDEOUT
        $(".mi_slideout").click(function(){
            $("#mediacaptured").addClass("preview");

            app.log("calling slideout Preview");
            return false;
        });
        $("#mediacaptured .slideclose").click(function(){
            $("#mediacaptured").removeClass("preview");
        });

        //DOCUMENT CLICKS FOR CLOSING POPUPS
        $(document).on("click", function(event){
            if (!$(event.target).closest('#mediacaptured').length) {
                $("#mediacaptured").removeClass("preview");
            }
        });

        $("#end_session").click(function(){
            //THIS DEVICE HAS BEEN SET UP TO USE A PROJECT
            ourvoice.resetDevice();   
            ourvoice.checkDirtyData();

            ourvoice.loadProject(app.cache.projects["project_list"][app.cache.active_project.i]);

            app.closeCurrentPanel($("#finish"));
            app.transitionToPanel($("#step_zero"),1);

            app.log("ending session");
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

        app.log("goBack() to : " + tempnext);
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

    ,showNotif : function(title, bodytext, _callback){
        navigator.notification.alert(
             bodytext
            ,function(){
               _callback();
            }
            ,title
            ,"Close");

        app.log("Showing Notif : " + bodytext);
        return;
    }

    ,log : function(msg,type){
        var msg_type    = !type ? "INFO" : type;
        var timestamp   = Date.now();
        var proj_id     = app.cache.active_project.hasOwnProperty("i") ? app.cache.projects["project_list"][app.cache.active_project.i]["project_id"] : "GENERAL";
        var msg_id      = datastore.pouchCollate([
             proj_id
            ,msg_type
            ,app.cache.uuid
            ,timestamp
        ]);
        var log_obj     = {
             "_id"      : msg_id
            ,"type"     : msg_type
            ,"timestamp": timestamp
            ,"msg"      : msg
            ,"user_id"  : app.cache.user.user_id
            ,"platform" : app.cache.platform
        }

        console.log(msg);
        //RECORD LOG MESSAGE
        // datastore.writeDB(app.cache.locallogdb, log_obj);
    }
};
