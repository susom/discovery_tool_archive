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
        ,"user" : []
        ,"current_session" : 0
        ,"attachment" : {}
        ,"reset_dbs"  : 0
        ,"projectDataChanged" : false
        ,"gps_on" : true
    }

    // Application Constructor
    ,initialize: function() {
        this.bindEvents();
    }
    
    ,initCache : function(){
        app.cache.db_fail_timeout       = null;

        app.cache.online                = false;
        app.cache.positionTrackerId     = null; //ref to setInterval
        app.cache.curmap                = null; //ref to google map
        app.cache.currentWalkMap        = [];   //array of geotags for current walk
        app.cache.history               = ["step_zero"];   //the app usage forward history

        app.cache.next_id               = null; //NEXT USER ID - POUCH COLLATED
        app.cache.participant_id        = null; //JUST SIMPLE INTEGER

        app.cache.audioObj              = {};   //FOR VOICE RECORDINGS
        app.cache.audioStatus           = null;
        app.cache.currentAudio          = null;
        app.cache.playbackTimer         = null;

        app.cache.saveToAlbum           = true;
        app.cache.accuracy_threshold    = 50;
        app.cache.uploadInProgress      = false;
        app.cache.audioPlayer 			= null;
        app.cache.versionCheck			= null;
        app.cache.versionOK             = true;

        app.cache.resumeUploads         = {};

        app.cache.session               = false; //?
        app.cache.reset_active_project  = false;
        app.cache.dynamic_css           = false;
    }

    ,bindEvents: function() {
        // In order to call the 'receivedEvent' we call this.receivedEvent
        // Bind any events that are required on startup. "deviceready" is a must "pause" and "resume" seem useful
        document.addEventListener('deviceready' , this.onDeviceReady,   false);
        document.addEventListener('pause'       , this.onDevicePause,   false);
        document.addEventListener('resume'      , this.onDeviceResume,  false);
    }

    ,onDevicePause: function() {
        //IF THEY PAUSE WHAT SHOULD HAPPEN?
        //KEEP USER INFO IN THE APP/LOCAL
        // app.log("DEVICE PAUSING");
        
        // console.log("pausing device, what happens to uploads? will need to resume for");
        // console.log(app.cache.resumeUploads);

        app.cache.session = Date.now();
        localStorage.setItem("session_pause_start", app.cache.session);

        // console.log("session pause start : " + app.cache.session);
        // console.log("does this fire on SWIPE CLOSE?");
    }

    ,onDeviceResume: function() {
        //IF THEY RESUME, SHOULD PICK UP WHERE THEY LEFT OFF... 
        //SO NO DO NOT RELOAD PROJECT
        // app.log("DEVICE RESUMING"); 
        var GPS_TEST = navigator.geolocation.getCurrentPosition(function(position) {
                console.log("Testing if Location Services On :");
                if(position){
                    app.cache.gps_on = true;
                    $("#main").removeClass("blocking_notif");
                }
            }, function(err){
                if(err.code == 1){
                    app.cache.gps_on = false;
                    app.blockingNotif("Location Services Required", "Please turn on location services in the 'Settings' or 'Privacy' menus to use the Discovery Tool.");
                    return false;
                }
        }); 

        var now_now = Date.now();
        app.cache.session = localStorage.getItem("session_pause_start") ? JSON.parse(localStorage.getItem("session_pause_start")) : 0;

        if(app.cache.session && (now_now - app.cache.session < 86400000) ){
            //androids time stamping is smaller by a factor of 1000)
            if(now_now - app.cache.session > 3600000) {
                app.showToast("Welcome Back");
            }
            // console.log("THIS IS OK STILL WITHIN 24 HOURS");
        }else{
            // console.log("THIS IS OLDER THAN 24 hours now.  SO RESTART!");
            // localStorage.removeItem("session_pause_start");
            $("#resetdevice").click();
        }

        //REMOVE IT INCASE ITS A SWIPE CLOSE AND WONT RESUME
        localStorage.removeItem("session_pause_start");

        // BACK ONLINE, LETS SEE IF ANY UPLOADS NEED RESUMING
        checkResumeUploads();
    }

    ,onDeviceReady: function() {
        // lock the device orientation
        screen.orientation.lock('portrait');

        var GPS_TEST 	= navigator.geolocation.getCurrentPosition(function(position) {
            // OnLOAD DO NOTHING gps on is DEFAULT TRUE
        }, function(err){
            if(err.code == 1){
                // console.log("ERROR PERMISSION DENIED LOCATION SERVICES");
                app.cache.gps_on = false;
                app.blockingNotif("Location Services Required", "Please turn on location services in the 'Settings' or 'Privacy' menus to use the Discovery Tool.");
                return false;
            }
        });

        var version 	= $("#loading_message").data("version");
        $("#loading_message b").text(version);

        //FIRST APP LOAD, SO SET UP NEW USER SESSION
        window.plugins.insomnia.keepAwake();

        //sets up app.cache.current_session for use throughout the session
        ourvoice.newUserSession();

        app.cache.session = localStorage.getItem("session_pause_start") ? JSON.parse(localStorage.getItem("session_pause_start")) : 0;
        // console.log("on clean start should have 0 for session : " + app.cache.session);
        if(!app.cache.session){
            //if session is 0 then reset project, which will be the case if starting app fresh
            app.cache.reset_active_project = true;
        }

        // //START PINGING ONLINE STATE, AND FILL IN OTHER GLOBAL VARIABLES
        app.cache.online                = navigator.onLine;
        // utils.pingNetwork();
        console.log("do i need this fucker oFFline thing?", navigator.onLine);

        app.cache.uuid                  = device.uuid;
        app.cache.platform              = device.platform;
        app.cache.audioformat           = app.cache.platform == "iOS" ? "wav" : "amr";
        // app.cache.saveToAlbum           = app.cache.platform == "iOS" ? true : false;

        //OPEN LOCAL AND REMOTE DB
        app.cache.remoteprojdb          = config["database"]["proj_remote"];
        app.cache.remoteusersdb         = config["database"]["users_remote"];
        app.cache.remoteattachmentdb    = config["database"]["attachment_remote"];
        app.cache.remotelogdb           = config["database"]["log_remote"];  

        app.cache.localprojdb           = datastore.startupDB(config["database"]["proj_local"]);
        app.cache.localusersdb          = datastore.startupDB(config["database"]["users_local"]); 
        app.cache.localattachmentdb     = datastore.startupDB(config["database"]["attachment_local"]);
        app.cache.locallogdb            = datastore.startupDB(config["database"]["log_local"]);

        // CLEAN SLATE 
        // localStorage.clear();
        // ourvoice.deleteLocalDB();

        //Once DB loads, it will cleartimeout (if less than 12 seconds that is)
        // app.cache.db_fail_timeout = setTimeout(function(){
        //     $("#loading_message").text("Could not reach database, try again later");
        //     $("#main").addClass("failed");
        // },12000);

        //iff app online then goahead and try to pull an updated (if exists) copy of project data
        if(app.cache.online){
            app.cache.localprojdb  = datastore.startupDB(config["database"]["proj_local"]);

            if(!app.cache.versionCheck){
                app.cache.versionCheck = true;
                // app.cache.localprojdb.get("all_projects").then(function (doc) {
                //     var doc_version = doc["version"];
                //     var cur_version = $("#loading_message").data("version");
                //     doc_version     = parseInt(doc_version.replace(/\./g,""));
                //     cur_version     = parseInt(cur_version.replace(/\./g,""));
                //
                //     // only show if the app version is less than official one
                //     if(doc_version > cur_version){
                //         var store           = app.cache.platform == "iOS" ? "iOS App Store" : "Google Play Store";
                //         var notice_title    = "Please check the " +store+ " for updates";
                //         var notice_body     = "It is critical to use the latest version of the Discovery Tool.";
                //
                //         app.blockingNotif(notice_title, notice_body);
                //     }
                // });
            }
            // app.addDynamicCss();
            ourvoice.getActiveProject();

            // BACK ONLINE, LETS SEE IF ANY UPLOADS NEED RESUMING
            checkResumeUploads();
        }else{
            // app.addDynamicCss();
            ourvoice.getActiveProject();
        }

        //ADD EVENTS TO VARIOUS BUTTONS/LINKS THROUGH OUT APP
        $(".button[data-next]").not(".audiorec,.camera,.keyboard,.finish").off("click").on("click",function(){
            //GET CURRENT PANEL
            var panel       = $(this).closest(".panel");
            var next        = $(this).data("next");
            var no_history  = false;

            if(next == "admin_view"){

                if($(this).hasClass("uploadbtn")){
                    if(!$(this).hasClass("uploading")){
                        //UPLOAD BUTTON
                        $(this).addClass("uploading");

                        $(".ajaxup").click();
                    }
                }
                return false;
            }

            if(!app.cache.gps_on){
                app.showNotif("Location Services Required", "Please turn on location services so that the app works properly.",function(){});
                return false;
            }

            if(app.cache.versionOK){
            }else{
            }

            if(next == "step_zero"){
                $("#main").removeClass("loaded");

                var pid         = $("#admin_projid").val().toUpperCase();
                var inp_pw      = $("#admin_pw").val();
                var p_pw        = null;

                ourvoice.checkDirtyData();

                var project_snap_ok = app.appLogin(pid, inp_pw , function(response){
                        p_pw = response["project_pass"];

                        $("#main").removeClass("loaded");
                        $("#admin_pw").val("");
                        $("#admin_projid").val("");

                        ourvoice.resetDevice();

                        //THIS WILL SET THE device (local DB) TO USE THIS PROJECT
                        //RECORD THE ACTIVE PROJECT
                        app.cache.localprojdb.get("active_project", function(err,resp){
                            app.cache.projects                  = response["ov_meta"];
                            app.cache.active_project            = response["active_project"];

                            if(!err){
                                app.cache.active_project["_id"]     = resp["_id"]; //"active_project"
                                app.cache.active_project["_rev"]    = resp["_rev"]; //"need this to push a new save revision
                            }
                            datastore.writeDB(app.cache.localprojdb, app.cache.active_project);

                            //LETS RELOAD THE LOCAL DB AT THIS POINT
                            ourvoice.getAllProjects();
                            app.closeCurrentPanel(panel);
                            app.transitionToPanel($("#"+next),no_history);
                        })
                }, function(){
                    $("#main").addClass("loaded");
                    app.showNotif("Please Try Again","Wrong ProjectID or Password", function(){});
                });

                return;
            }else{
                //ONE TIME DEAL if NOT STEP ZERO
                $("#main").addClass("loaded");
            }

            if(next == "consent_0"){
                //THIS IS IMPORTANT
                console.log("active project, will need to revisit this to add diy tagging");
                console.log(app.cache.active_project);

                app.cache.user[app.cache.current_session].project_id    = app.cache.active_project["code"];
                app.cache.user[app.cache.current_session].lang          = $("select[name='language']").val();
                app.cache.user[app.cache.current_session].user_id       = app.cache.participant_id;
                app.cache.user[app.cache.current_session]._id           = app.cache.next_id; //COLLATED
                app.cache.user[app.cache.current_session].device        = {
                      "cordova"         : device.cordova
                     ,"manufacturer"    : device.manufacturer
                     ,"model"           : device.model
                     ,"platform"        : device.platform
                     ,"version"         : device.version
                };

                //TODO
                app.cache.attachment._id        = app.cache.next_id;
                app.cache.attachment.project_id = app.cache.active_project.i;

                app.log("Starting consent process for User " + app.cache.user[app.cache.current_session]._id);
		        $("#mediacaptured .mediaitem").remove();
		        $(".mi_slideout b, .done_photos b, .done_audios_text b").text(0);
            }
            
            if(next == "step_two" && !$(this).hasClass("continuewalk")){
                $(".mi_slideout").addClass("reviewable");
                $(".home").hide();

                ourvoice.startWatch(8000);   
                app.cache.history = [];

                var last4   = app.cache.user[app.cache.current_session]._id.substr(app.cache.user[app.cache.current_session]._id.length - 4);
                var b4      = $("<b>").html(last4);
                var i4      = $("<i>").addClass("delete_on_reset").html("ID : ").append(b4);
                $(".toplogo > div").append(i4);
            }else if($(this).hasClass("continuewalk")){
                $("#recent_pic").attr("src","");
            }

            if(next == "step_three"){
                if(utils.checkConnection()){
                    $("#google_map").show();
                    ourvoice.plotGoogleMap();
                }else{
                    $("#google_map").hide();
                }
            }

            if(next == "finish"){
                ourvoice.stopWatch();

                var audio_text_count = 0;
                for (var i in app.cache.user[app.cache.current_session]["photos"]){
                    var p_obj = app.cache.user[app.cache.current_session]["photos"][i];

                    if(p_obj.hasOwnProperty("audios")){
                        audio_text_count += p_obj["audios"].length;
                    }
                    if(p_obj.hasOwnProperty("text_comment") && p_obj["text_comment"] != ""){
                        audio_text_count += 1;
                    }
                }

                $(".done_audios_text b").text(audio_text_count);
                $(".mi_slideout").removeClass("reviewable");


                //FREE UP THE MEMORY FOR THE MEDIA OBJECTS
                // ourvoice.clearAllAudio();
                // app.log("start survey");
            }

            //TRANSITION TO NEXT PANEL
            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next),no_history);
            return false;
        });
        
        $(".logo").off("click").on("click",function(){
            var clickcount = $(this).data("clickcount");
            if(clickcount < 5){
                var wtf = clickcount+1;
                $(this).data("clickcount",wtf);
            }else{
                $(this).data("clickcount",0);
                
                app.closeCurrentPanel($(".panel.loaded"));
                $("#main").addClass("loaded");

                //SHOW THE DATA ON LOCAL DEVICE
                app.cache.localusersdb.allDocs({
                  include_docs: true
                }).then(function (res) {
                    ourvoice.adminView(res["rows"], true);
                    $("#list_data").css("opacity",1);
                }).catch(function(err){
                    app.log("error allDocs()" + err);
                });

                app.transitionToPanel($("#admin_view"));
                return false;
            }
            
            return false;
        });

        $("#step_zero .datastatus").off("click").on("click", function(){
            app.closeCurrentPanel($("#step_zero"));
            $("#main").addClass("loaded");

            //SHOW THE DATA ON LOCAL DEVICE
            app.cache.localusersdb.allDocs({
                include_docs: true
            }).then(function (res) {
                ourvoice.adminView(res["rows"], true);
                $("#list_data").css("opacity",1);
            }).catch(function(err){
                app.log("error allDocs()" + err);
            });

            app.transitionToPanel($("#admin_view"));
            return false;
        });

        $("#list_data").off("click","a.ajaxup").on("click","a.ajaxup", function(){
            // Update handlers are functions that clients can request to invoke server-side logic that will create or update a document
            var doc_id  = $(this).data("doc_id");
            var apiurl  = config["database"]["upload_endpoint"]; //or use update_handlers design document?

            //replace the upload icon with an animated gif circling a number that counts down!
            var attach_count = $(this).data("attach_count");
            $(this).parent().addClass("uploading");
            // $(this).html(attach_count);

            console.log("there are " + attach_count + " attachements to upload");

            //SHOW PROGRESS BAR
            $("#progressoverlay").addClass("uploading");

            //pull data and prepare it to upload to some other fucking thing.
            app.cache.localusersdb.get(doc_id).then(function (doc) {
                var doc_rev = doc["_rev"];
                if(doc["photos"].length){
                    $.ajax({
                        type      : "POST",
                        url       : apiurl,
                        data      : { doc_id: doc_id , doc: JSON.stringify(doc)},
                        dataType  : "JSON",
                        success   : function(attachments){
                            console.log("uploaded the doc, here are the attachements to upload 1 by 1", doc);
                            console.log(attachments);

                            app.recursiveUpload(doc_id, attachments);
                        },
                        error     : function(err){
                            // console.log("opposite of success, error");
                            console.log(err);
                        }
                    }).fail(function(err){
                        // console.log("ajax upload fail");
                        console.log(err);
                    });
                }else{
                    console.log("no photos, so no actions");
                }
            }).catch(function (err) {
                console.log("error getting doc");
                console.log(err);
            });

            return false;
        });

        $(".home").off("click").on("click",function(){
            if($(".panel.loaded").attr("id") == "step_setup" || $(".panel.loaded").attr("id") == "step_zero" ){
                return false;
            }

            app.closeCurrentPanel($(".panel.loaded"));
            if(app.cache.reset_active_project){
                app.transitionToPanel($("#step_setup"));
            }else{
                app.transitionToPanel($("#step_zero"));
            }

            return false;
        });

        $("#pic_review").on("click",".trashit", function(){
            //DELETE A PHOTO (AND ASSOCIATED GEOTAGS/AUDIO)
            var thispic_i   = $(this).data("photo_i");
            var panel       = $(this).closest(".panel");

            if(panel.attr("id") == "pic_review"){
                var next    = "step_two";
                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#"+next),1);
            }
            app.log("delete photo");

            ourvoice.deletePhoto(app.cache.user[app.cache.current_session].photos[thispic_i]);
            return false;
        });

        $("#mediacaptured").off("click").on("click",".previewthumb",function(){
            //OPEN UP PREVIEW PAGE FOR PHOTO
            var thispic_i   = $(this).data("photo_i");
            var fileurl     = $(this).find("img").attr("src");
            ourvoice.previewPhoto(app.cache.user[app.cache.current_session].photos[thispic_i], fileurl);

            $("#mediacaptured").removeClass("preview");

            var panel       = $(".panel.loaded");
            var next        = "pic_review";
            if(panel.attr("id") == next){
                return;
            }

            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next));

            return false;
        });

        $("#mediacaptured").on("click", ".single_upload", function(){
            // Update handlers are functions that clients can request to invoke server-side logic that will create or update a document
            var _this   = $(this).parent();

            var doc_id      = _this.data("doc_id");  //IRV_64f5ab9426bb455d_2_1591297088501
            var attach_id   = _this.data("attach_id");
            var attach_name = _this.data("attach_name");
            var attachments = [{"_id": attach_id, "name": attach_name}];
            
            //SHOW PROGRESS BAR
            _this.addClass("uploading");
            $("#progressoverlay").addClass("uploading");

            //recursive function but only passing in one item
            console.log("upload single file " , attach_name, " to " , attach_id);
            app.recursiveUpload(doc_id, attachments);
            return false;
        });

        $("#mediacaptured").off("click",".audiorec").on("click",".audiorec", function(){
            var attach_id   = $(this).data("attach_id");
            var file_i      = $(this).data("file_i");
            var el 			= $(this);

            if( el.hasClass("hasAudio") ){
                el.addClass("playing");
                app.cache.localattachmentdb.getAttachment(attach_id, file_i).then(function(blob){
                    var tmpurl 	= window.URL.createObjectURL(blob);
                    if(!app.cache.audioPlayer){
                        app.cache.audioPlayer = new Audio();
                    }
                    var audio 	= app.cache.audioPlayer;
                    audio.src 	= tmpurl;
                    audio.play();
                    console.log("play!");
                    console.log(tmpurl);
                    setTimeout(function(){
                        el.removeClass("playing");
                    },1500);
                });
            }

            return false;
        });

        $("#mediacaptured .slideclose").off("click").on("click",function(){
            $("#mediacaptured").removeClass("preview").removeClass("review").removeClass("upload");;
            return false;
        });

        $(".panel").off("click",".listen").on("click",".listen", function(){
            var url = $(this).attr("href");
            var my_media = new Media(url,
                function () {
                    // console.log("playAudio():Audio Success");
                }
                ,function (err) {
                    app.log(err.message);
                }
            );
            // app.log("play audio");

            my_media.play();
            my_media.release();
            return false;
        });

        $(".panel").off("click",".daction,.record_another").on("click",".daction,.record_another",function(){
            var panel   = $(this).closest(".panel");
            var next    = $(this).data("next");

            var savehistory = false;
            if($(this).hasClass("camera")) {
                //GET CURRENT PANEL
                $(this).find("b").first().addClass("reset_later");
                ourvoice.takePhoto(function(){
                    //on success go to pic review
                    var panel = $("#loading");
                    app.closeCurrentPanel(panel);
                    app.transitionToPanel($("#" + next), savehistory);
                });
                app.transitionToPanel($("#loading"), savehistory);
                app.closeCurrentPanel(panel);
                // app.log("take photo");

            }else if($(this).hasClass("keyboard")){
                $(".text_comment").slideDown("fast");
                $("#text_comment").focus();
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

        $(".panel .votes").on("click",".vote", function(){
            //VOTE GOOD AND/OR BAD
            var curPhoto = $(this).data("photo_i");

            var updown = "up";
            // 0/null = no votes, 1 = bad vote, 2 = good vote, 3 = both votes WTF

            if($(this).hasClass("up")){
                $(".votes a.up[rel='" + curPhoto + "']").toggleClass("on");
                var value = $(".votes a.up[rel='" + curPhoto + "']").hasClass("on") ? 2 : -2;
                app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad + value;
            }
            if($(this).hasClass("down")){
                updown = "down";
                $(".votes a.down[rel='" + curPhoto + "']").toggleClass("on");
                var value = $(".votes a.down[rel='" + curPhoto + "']").hasClass("on") ? 1 : -1;
                app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad + value;
            }

            //RECORD THE VOTE
            datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);
            return false;
        });

        $(".panel").off("blur").on("blur","#text_comment",function(){
            $(this).css("height","initial");
            //save it
            var curPhoto = $(this).data("photo_i");
            app.cache.user[app.cache.current_session].photos[curPhoto].text_comment  = $(this).val();
            $(".text_comment").slideUp("slow");
            return false;
        });

        $("#audio_controls").off("click","a").on("click","a", function(){
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

        $("#walk_survey").off("change",":input").on("change",":input",function(){
            //STORE SURVEY ANSWERS
            var val = $(this).val();
            var nam = $(this).attr("name");
            app.cache.user[app.cache.current_session].survey.push({"name" : nam , "value" : val});

            //RECORD SURVEY INPUT
            datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);
            return;
        });

        $("#resetdevice").off("click").on("click",function(){
            //DITCH USER TOO
            $("#admin_null").show();
            $("#admin_passed").hide();

            app.closeCurrentPanel($(".panel").not("#step_setup"));
            ourvoice.adminSetup();
            return false;
        });

        $("#progressoverlay").off("click","#cancel_upload").on("click","#cancel_upload", function(){
            $(".uploading").removeClass("uploading");
            $("#progressbar span").width(0);
            $("#progressoverlay b").text(0);
            return false;
        });

        $("#list_data").off("click","a.resync").on("click","a.resync", function(event){
            event.preventDefault();
            var doc_id  = $(this).data("docid");

            //DIRTY THIS DATA BY REMOVING THE FLAG HAHA!
            app.cache.localusersdb.get(doc_id).then(function (doc) {
                // handle doc
                delete doc["uploaded"];  //IF IT HAS BEEN UPLOADED PREVIOULSY IT WIL HAVE THIS
                
                //THIS IS HOW WE DIRTY IT
                if(doc.hasOwnProperty("upload_try")){
                    doc["upload_try"] = parseInt(doc["upload_try"]) + 1;
                }else{
                    doc["upload_try"] = 2;
                }
               
                app.cache.localusersdb.put(doc).then(function (new_o) {
                    app.log("TRY A RESYNC ON RECORD " + doc_id);
                }).catch(function (err) {
                    app.log("ERROR WRITING TO A DB", "Error");
                    datastore.showError(err);
                });

                for(var p in doc["photos"]){
                    var photo = doc["photos"][p];
                    var ph_id = doc_id + "_" + photo["name"];
                    
                    app.cache.localattachmentdb.get(ph_id).then(function (pdoc) {
                        // handle doc
                        delete pdoc["uploaded"];  //IF IT HAS BEEN UPLOADED PREVIOULSY IT WIL HAVE THIS
                        
                        //THIS IS HOW WE DIRTY IT
                        if(pdoc.hasOwnProperty("upload_try")){
                            pdoc["upload_try"] = parseInt(pdoc["upload_try"]) + 1;
                        }else{
                            pdoc["upload_try"] = 2;
                        }
                       
                        app.cache.localattachmentdb.put(pdoc).then(function (new_o) {
                            console.log("TRY A RESYNC ON RECORD " + ph_id);
                        }).catch(function (err) {
                            console.log("ERROR WRITING TO A DB", "Error");
                            datastore.showError(err);
                        });
                    }).catch(function (err) {
                      console.log(err);
                    });

                    var audios = photo["audios"];
                    for(var a in audios){
                        var au_id = doc_id + "_" + audios[a];
                        app.cache.localattachmentdb.get(au_id).then(function (adoc) {
                            // handle doc
                            delete adoc["uploaded"];  //IF IT HAS BEEN UPLOADED PREVIOULSY IT WIL HAVE THIS
                            
                            //THIS IS HOW WE DIRTY IT
                            if(adoc.hasOwnProperty("upload_try")){
                                adoc["upload_try"] = parseInt(adoc["upload_try"]) + 1;
                            }else{
                                adoc["upload_try"] = 2;
                            }
                           
                            app.cache.localattachmentdb.put(adoc).then(function (new_o) {
                                console.log("TRY A RESYNC ON RECORD " + au_id);
                            }).catch(function (err) {
                                console.log("ERROR WRITING TO A DB", "Error");
                                datastore.showError(err);
                            });
                        }).catch(function (err) {
                          console.log(err);
                        });
                    }
                }
            }).catch(function (err) {
              console.log(err);
            });

            $("#datastatus").removeClass("synced");
            $(this).closest(".row").removeClass("uploaded");
            $("a[data-doc_id='"+doc_id+"']").removeClass("uploaded");
            return false;
        });

        $("#list_data").off("click","a.trash").on("click","a.trash", function(){
            var doc_id  = $(this).data("docid");

            // FIND THE DATA IN disc_users AND ALL ATTACHMENTS in disc_attachment
            // HIDE THIS FUNCtionality for now
            if(1==2){
                app.cache.localusersdb.get(doc_id).then(function (doc) {
                    if(doc["photos"].length){
                        //DELETE PHOTOS AND AUDIO ATTACHMENTS
                        for(var p in doc["photos"]){
                            var photo = doc["photos"][p];
                            var ph_id = doc_id + "_" + photo["name"];
                            
                            app.cache.localattachmentdb.get(ph_id).then(function (pdoc) {
                                // delete this attachment
                                pdoc["_deleted"] = true;
                                app.cache.localattachmentdb.put(pdoc).then(function (new_o) {
                                    console.log("DELETEING ATTACHMENT : " + ph_id);
                                }).catch(function (err) {
                                    datastore.showError(err);
                                });
                            }).catch(function (err) {
                              console.log(err);
                            });

                            var audios = photo["audios"];
                            for(var a in audios){
                                var au_id = doc_id + "_" + audios[a];
                                app.cache.localattachmentdb.get(au_id).then(function (adoc) {
                                    // delete this attachment
                                    adoc["_deleted"] = true;
                                   
                                    app.cache.localattachmentdb.put(adoc).then(function (new_o) {
                                        console.log("DELETEING ATTACHMENT : " + au_id);
                                    }).catch(function (err) {
                                        datastore.showError(err);
                                    });
                                }).catch(function (err) {
                                  console.log(err);
                                });
                            }
                        }
                    }

                    // NOW DELETE THE DOC FROM local disc_users
                    doc["_deleted"] = true;
                    app.cache.localusersdb.put(doc).then(function (new_o) {
                        app.log("Deleting the doc: " + doc_id);
                    }).catch(function (err) {
                        app.log("ERROR WRITING TO A DB", "Error");
                        datastore.showError(err);
                    });
                }).catch(function (err) {
                  console.log(err);
                });

                $(this).closest("tr").remove();
            }
            return false;
        });

        $(".help").off("click").on("click", function(){
            app.closeCurrentPanel($(".panel.loaded"));
            app.transitionToPanel($("#help"));
            return false;
        });

        $(".back").off("click").on("click",function(){
            app.goBack();
        });

        $(".list").off("click").on("click",function(){
            app.closeCurrentPanel($(".panel.loaded"));
            $("#admin_master").show();
            $("#list_data").css("opacity",0);
            app.transitionToPanel($("#admin_view"));
        });

        $(".mi_slideout").off("click").on("click",function(){
            $("#mediacaptured").addClass("preview");
            return false;
        });

        $(document).off("click").on("click", function(event){
            if (!$(event.target).closest('#mediacaptured').length) {
                $("#mediacaptured").removeClass("preview").removeClass("review");
            }
        });

        $("#end_session").off("click").on("click",function(){
            //THIS DEVICE HAS BEEN SET UP TO USE A PROJECT
            ourvoice.resetDevice();   
            ourvoice.checkDirtyData();

            ourvoice.loadProject(app.cache.active_project);

            $("#pic_review li.good_or_bad").show();

            app.closeCurrentPanel($("#finish"));
            app.transitionToPanel($("#step_zero"),true);

            ourvoice.newUserSession();
            app.log("ending session");
            return false;
        });
        
        $("#reset_dbs").off("click").on("click",function(){
            var clickcount = $(this).data("clickcount");
            if(clickcount < 13){
                var wtf = clickcount+1;
                $(this).data("clickcount",wtf);
            }else if(clickcount < 14){
                $(this).addClass("active");
                var wtf = clickcount+1;
                $(this).data("clickcount",wtf);
            }else{
                $(this).removeClass("active");
                $(this).data("clickcount",0);
                
                // click on the copyright 5 x to reset all 3 local databases
                navigator.notification.confirm(
                    'All Discovery Tool data saved on this device will be deleted and reset. Click \'Continue\' to proceed.', // message
                     function(i){
                        if(i == 1){
                            //the button label indexs start from 1 = 'Cancel'
                            return;
                        }
                        datastore.deleteDB(app.cache.localusersdb, function(){
                            app.cache.localusersdb          = datastore.startupDB(config["database"]["users_local"]); 
                        });

                        datastore.deleteDB(app.cache.localattachmentdb, function(){
                            app.cache.localattachmentdb    = datastore.startupDB(config["database"]["attachment_local"]);
                        });

                        datastore.deleteDB(app.cache.locallogdb, function(){
                            app.cache.locallogdb            = datastore.startupDB(config["database"]["log_local"]);
                        });
                        app.showNotif("Databases Reset and Data Erased","", function(){
                            $("#list_data tbody").empty();
                        });

                        localStorage.clear();
                     },            // callback to invoke with index of button pressed
                    'Reset Databases?',           // title
                    ['Cancel','Continue']     // buttonLabels
                );

                return false;
            }
        });

        // var myElement   = document.getElementById('main');
        // var hammertime  = new Hammer(myElement);
        // // hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
        // hammertime.on('swipeleft', function(ev) {
        //     //swipe left go to forward?
        //     console.log("swiped left");
        // });
        // hammertime.on('swiperight',function(){
        //     //swipe right to go back
        //     console.log("swiped right");
        //     // app.goBack()
        // });
    }

    ,recursiveUpload : function(walk_id , attachments_array, resuming){
        if(resuming === undefined){
            resuming = false;
        }

        // EVERY ROUND THROUGH THIS LETS UPDATE THE resumeArray
        //SAVE current state of attachments_array && walk_id TO LOCAL STORAGE in resumeUploads
        app.cache.resumeUploads[walk_id]  = attachments_array;
        console.log("updateing needResuming array");
        console.log(app.cache.resumeUploads[walk_id]);
        localStorage.setItem("resumeUploads",JSON.stringify(app.cache.resumeUploads)); 

        var attachment  = attachments_array.pop();
        var attach_id   = attachment["_id"];
        var attach_name = attachment["name"]; 
        var apiurl      = config["database"]["upload_endpoint"]; 
        console.log("single attaachement to upload", attachment);
        app.cache.localattachmentdb.getAttachment(attach_id, attach_name).then(function(blob){
            // AM I DOING ALL THIS JUST TO HAVE A FILE INPUT ELEMENT TO USE FOR THE PLUGIN?
            $("#fileform").remove();
            $("#fileupload").remove();
            
            var fileform   = $("<form>");
            fileform.attr("id","fileform");
            fileform.attr("action",apiurl + "?walk_id=" + walk_id);

            var fileupload = $("<input>");
            fileupload.attr("id","fileupload");
            fileupload.attr("type","file");
            fileupload.attr("name","files[]");
            fileupload.attr("multiple","");
            fileupload.css("opacity","0").css("position","absolute").css("left","-5000px");

            fileform.append(fileupload);
            $("#admin_view").append(fileform);

            // RESET PROGRESS BAR
            var max_width       = 280;
            $("#progressbar span").width(0);
            $("#progressoverlay h3").text("Uploading " + attach_name);

            // THIS WORKS FOR THE JSON WALK META, BUT NOT ACTUAL FILES WTPHO
            $('#fileupload').fileupload({
                url: apiurl + "?walk_id=" + walk_id,
                dataType: 'JSON',
                maxChunkSize: 100000,
                maxRetries  : 3600,
                retryTimeout: 1000,
                success : function(e, data){
                    // NOW THIS MEANS CHUNKS NOT ENTIRE FILE
                    // console.log("UPLOAD PROCESS CHUNK SUCCESS?");
                    // var current_count = parseInt($(".alternate_upload.uploading a").html());
                    // $(".alternate_upload.uploading a").html(current_count-1);        
                },
                error : function(e, data){
                    // console.log("UPLOAD PROCESS ERROR OR CHUNK UPLOAD ERROR?");
                },
                done: function (e, data) {
                    // console.log("UPLOAD PROCESS FILE DONE " + attach_name );
                    attachmentUploadDone(attachments_array,walk_id,resuming);
                },
                progressall: function (e, data) {
                    // THIS HAPPENS PERIODICALY DURING CHUNK UPLOAD
                    var progress        = parseInt(data.loaded / data.total * 100, 10);
                    var current_width   = Math.round(max_width * (progress/100));
                    $("#progressbar span").width(current_width);
                    $("#percent_uploaded").text(progress);
                    // "recalculateProgress":true,
                    // "progressInterval":100,
                    // "bitrateInterval":500,
                    // {"loaded":32687,"total":3891200,"bitrate":52299200} = 0%
                    // {"loaded":100000,"total":3891200,"bitrate":52299200} = 2%
                },
                progress: function(e,data){
                    // NOT SURE WHAT EXACTLY IS THE DIFFERENCE HERE
                    // showlog(data);
                },
                chunkdone: function(e,data){
                    // CHUNK UPLOAD SUCESS , SAME AS REGULAR success() WHEN IN CHUNK MODE
                    // showlog(data);
                },
                chunkfail: function(e,data){
                    // CHUNK UPLOAD FAIL
                    // showlog(data);
                },
                chunkalways: function(e,data){
                    // CHUNK UPLOAD SUCCESS OR FAIL, FIRES EVERYTIME
                    // showlog(data);
                },
                fail: function (e, data) {
                    // console.log("UPLOAD PROCESS FAIL, WHY NOT RETRY?");
                    var fu  = $(this).data('blueimp-fileupload') || $(this).data('fileupload');

                    // IT IS FAILING HERE
                    var retries = data.retries || 0;
                    // console.log(retries);

                    var retry   = function () {
                        // console.log("retry function");
                        $.getJSON(apiurl+ "?walk_id=" + walk_id, {file: data.files[0].name})
                            .done(function (result) {
                                console.log("retry done: succesful file upload");
                                var file = result.file;
                                data.uploadedBytes = file && file.size;
                                // clear the previous data:
                                data.data = null;
                                data.submit();

                                console.log("IF any files left to upload, continue recursively");
                                attachmentUploadDone(attachments_array,walk_id,resuming);
                            })
                            .fail(function () {
                                console.log("retry failure?");
                                fu._trigger('fail', e, data);
                            });
                    };

                    console.log("error thrown: " + data.errorThrown);
                    if (data.errorThrown !== 'abort' 
                        && data.uploadedBytes < data.files[0].size 
                        && retries < fu.options.maxRetries) {
                        
                        retries += 1;
                        console.log("retrying:" + retries);

                        data.retries = retries;
                        window.setTimeout(retry, retries * fu.options.retryTimeout);
                        return;
                    }

                    delete data["retries"];
                }
            });

            blob['name'] = attach_id;
            $('#fileupload').fileupload("send",{"files" : [blob] });
        });
    }

    ,addDynamicCss: function(){
        if(!$("link[rev='index.css']").length) {
            console.log("adding dynamic css now");
            return;
            app.cache.localprojdb.getAttachment('all_projects', 'index.css').then(function (blobOrBuffer) {
                var blobURL = URL.createObjectURL(blobOrBuffer);
                var cssTag = $("<link>");
                cssTag.attr("rel", "stylesheet");
                cssTag.attr("type", "text/css");
                cssTag.attr("href", blobURL);
                cssTag.attr("rev", "index.css")
                $("head").append(cssTag);
                app.cache.dynamic_css = true;
            }).catch(function (err) {
                console.log(err);
            });
        }
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

        if(panel.attr("id") !== "step_zero" && panel.attr("id") !== "step_setup"){
            $(".home").addClass("on");
        }else{
            $(".home").removeClass("on");
        }

        panel.show().delay(250).queue(function(next){
            $(this).addClass("loaded");
            window.scrollTo(0,0);
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

        // app.log("Showing Notif : " + bodytext);
        return;
    }

    ,log : function(msg,type){
        // var msg_type    = !type ? "INFO" : type;
        // var timestamp   = Date.now();
        // var proj_id     = app.cache.active_project.hasOwnProperty("i") ? app.cache.projects["project_list"][app.cache.active_project.i]["project_id"] : "GENERAL";
        // var msg_id      = datastore.pouchCollate([
        //      proj_id
        //     ,msg_type
        //     ,app.cache.uuid
        //     ,timestamp
        // ]);
        // var log_obj     = {
        //      "_id"      : msg_id
        //     ,"type"     : msg_type
        //     ,"timestamp": timestamp
        //     ,"msg"      : msg
        //     ,"user_id"  : app.cache.user[app.cache.current_session].user_id
        //     ,"platform" : app.cache.platform
        // }

        //RECORD LOG MESSAGE
        // datastore.writeDB(app.cache.locallogdb, log_obj);
        console.log(msg);
    }

    ,showToast : function (text) {
        setTimeout(function () {
          window.plugins.toast.showShortBottom(text);
        }, 500);
    }

    ,blockingNotif : function(title,body){
        $("#main").addClass("blocking_notif");
        $("#notice h3").text(title);
        $("#notice p").text(body);
    }

    ,appLogin : function(pcode, ppass, _cb_success, _cb_fail){
        var apiurl      = config["database"]["app_login"];

        $.ajax({
            type        : "POST",
            url         : apiurl,
            data        : { proj_id: pcode, proj_pw: ppass },
            dataType    : "json",
            success   : function(response){
                if(response.hasOwnProperty("active_project") && response["active_project"].hasOwnProperty("code")) {
                    console.log("pcode found!", pcode);
                    _cb_success(response);
                }else{
                    console.log("pcode or ppass wrong", pcode, ppass);
                    _cb_fail();
                }
            },
            error     : function(err){
                console.log("something wrong happened with app_login");
            }
        });
    }
};

function checkResumeUploads(){
    if (typeof(Storage) !== "undefined") {
        // CHECK FOR localStorage
        if(localStorage.getItem("resumeUploads")){
            app.cache.resumeUploads = JSON.parse(localStorage.getItem("resumeUploads"));
            for(var walk_id in app.cache.resumeUploads){
                attachments_array = app.cache.resumeUploads[walk_id];
                var resuming = true;

                var abbrev_walkid = walk_id.substr(walk_id.length -4);
                console.log("resuming upload for walkid:" + abbrev_walkid);
                console.log(attachments_array);
                app.showToast("resuming upload for walkid : " + abbrev_walkid);
                attachmentUploadDone(attachments_array,walk_id,resuming);
            }
        }else{
            console.log("no uploads need resuming");
        }
    } else {
        // Sorry! No Web Storage support..
        console.log("No local storage support");
    }
}

function attachmentUploadDone(attachments_array,walk_id,resuming){
    //IF WE ARE RESUMING DONT BOTHER DOING UI/PROGRESS BAR UPDATES
    if (resuming === undefined){
        resuming = false;
    }

    if(attachments_array.length){
        // IF THERE ARE ATTACHMENTS LEFT KEEP GOING
        app.recursiveUpload(walk_id, attachments_array, resuming);
    }else{
        console.log("done with all attachments");
        
        //TODO, REMOVE THE RESUMABLE UPLOADS STORED IN LOCALDB
        // console.log("whats left in the attachments array for walkid:" + walk_id);
        // console.log(app.cache.resumeUploads);
        delete app.cache.resumeUploads[walk_id];
        // console.log("after deleting walk id from resumeuploads");
        // console.log(app.cache.resumeUploads);
        localStorage.setItem("resumeUploads",JSON.stringify(app.cache.resumeUploads)); 
        
        if(resuming){
            var abbrev_walkid = walk_id.substr(walk_id.length -4);
            app.showToast("Uploads for " + abbrev_walkid + " complete.");
        }

        // CLOSE PROGRESS BAR
        $("#cancel_upload").trigger("click");

        // OK LETS MARK IT AS UPLOADED SO NO MORE ERRORS NEXT TIME
        app.cache.localusersdb.get(walk_id).then(function (doc) {
            doc.uploaded = true;
            app.cache.localusersdb.put(doc);

            //CHANGE SYNC INDICATOR TO THUMBS UP
            console.log("change x to check");
            $("a.ajaxup[data-doc_id='"+walk_id+"']").addClass("uploaded");
            // $("i[data-docid='"+walk_id+"']").closest("tr").addClass("uploaded");
            
            // AJAX HIT THE SERVER TO CREATE THUMBNAILS
            $.ajax({
              type      : "POST",
              url       : config["database"]["hook_thumbs"],
              data      : { walk_id : walk_id },
              dataType  : "JSON",
              success   : function(response){
                //don't need to do anything pass or fail, but will pass back the ids for thumbnails that were created
                console.log("what is this hook_thumbs");
                // console.log(response);
              }
            });
        }).catch(function (werr) {
            app.log("syncLocalData error UPDATING USER DATA " + walk_id, Error);
            datastore.showError(werr);
        });

        // THE WALK JSON and ALL THE ATTACHMENTS HAVE RECURSIVELY SAVED TO THE SERVER!!!
        // NOW HIT UPLOAD PING TO ALERT THE ADMIN EMAIL
        console.log("UPLOAD PING SSEMS TO BE THE PING THAT TELLS THE SERVER TO PUSH ALL THE UPLOADED STUFF TO COUCH");
        var apiurl      = config["database"]["upload_ping"];
        $.ajax({
            type        : "POST",
            url         : apiurl,
            data        : { uploaded_walk_id: walk_id, project_email: app.cache.active_project["email"] },
            // dataType    : "JSON",
            success   : function(response){
                console.log("upload_ping for walk meta succesffuly.. pinged");
                console.log(response);
                
                // $("a.ajaxup[data-doc_id='"+walk_id+"']").addClass("uploaded");
                // console.log($("a.ajaxup[data-doc_id='"+walk_id+"']").length);
                return;


                app.cache.localusersdb.allDocs({
                  include_docs: true
                }).then(function (res) {
                    var all_synced = true;
                    var rows = res["rows"];
                    for(var i in rows){
                        var r_d     = rows[i]["doc"];
                        var synced  = r_d.hasOwnProperty("uploaded") ? 1 : 0;
                        if(!synced){
                            all_synced = false;
                        }
                    }

                    console.log("does it get in here?");
                    //CHANGE SYNC INDICATOR TO THUMBS UP IF ALL SYNCED
                    if(all_synced){
                        console.log("its all synced man");
                        $(".datastatus").addClass("synced");
                    }else{
                        console.log("no its not all synced.. wut");
                    }
                }).catch(function(err){
                    app.log("error allDocs()" + err);
                });
            },
            error     : function(err){
                console.log("An Error in Upload Ping?");
                // console.log(err);
            }
        });

        $(".alternate_upload.uploading a").html('&#8686;');
        $(".alternate_upload.uploading").removeClass("uploading");
    }
}

function showlog(obj){
    var seen    = [];
    var sheet   = JSON.stringify(obj, function(key, val) {
       if (val != null && typeof val == "object") {
            if (seen.indexOf(val) >= 0) {
                return;
            }
            seen.push(val);
        }
        return val;
    });
    console.log(sheet);
}