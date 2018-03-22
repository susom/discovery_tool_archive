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
    }

    ,bindEvents: function() {
        // In order to call the 'receivedEvent' we call this.receivedEvent
        // Bind any events that are required on startup. "deviceready" is a must "pause" and "resume" seem useful
        document.addEventListener('deviceready' , this.onDeviceReady,   false);
        document.addEventListener('pause'       , this.onDevicePause,   false);
        document.addEventListener('resume'      , this.onDeviceResume,  false);
    }

    ,onDeviceReady: function() {
        //FIRST APP LOAD, SO SET UP NEW USER SESSION
        window.plugins.insomnia.keepAwake();

        //sets up app.cache.current_session for use throughout the session
        ourvoice.newUserSession();

        // //START PINGING ONLINE STATE, AND FILL IN OTHER GLOBAL VARIABLES
        app.cache.online                = navigator.onLine;
        utils.pingNetwork();

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
        app.cache.db_fail_timeout = setTimeout(function(){
            $("#loading_message").text("Could not reach database, try again later");
            $("#main").addClass("failed");
        },12000);

        //iff app online then goahead and try to pull an updated (if exists) copy of project data
        if(app.cache.online){
            datastore.remoteSyncDB(app.cache.localprojdb, app.cache.remoteprojdb, function(change){
                //REFRESH REFERENCE TO LOCAL DB AFTER REMOTE SYNC, SINCE NOT ALWAYS RELIABLE ("Null object error")
                app.cache.localprojdb  = datastore.startupDB(config["database"]["proj_local"]);
                app.addDynamicCss();
                
                ourvoice.getActiveProject();
            });
        }else{
            app.addDynamicCss();
            ourvoice.getActiveProject();
        }

        //ADD EVENTS TO VARIOUS BUTTONS/LINKS THROUGH OUT APP
        $(".button[data-next]").not(".audiorec,.camera,.finish").on("click",function(){
            //GET CURRENT PANEL
            var panel       = $(this).closest(".panel");
            var next        = $(this).data("next");
            var no_history  = false;

            if(next == "admin_view"){
                if($(this).hasClass("uploadbtn")){
                    if(!$(this).hasClass("uploading")){
                        //UPLOAD BUTTON
                        $(this).addClass("uploading");

                        var needUpdating = 0;
                        app.cache.localattachmentdb.allDocs({
                          include_docs: true
                        }).then(function (res) {
                            var rows = res["rows"];
                            for(var i in rows){
                                var r_d = rows[i]["doc"];
                                if(!r_d.hasOwnProperty("uploaded")){
                                  needUpdating++;
                                }
                            }

                            app.showNotif("Uploading Data", "Please be patient and leave this app open until data upload is complete.",function(){
                                
                                $("#progressoverlay").addClass("uploading"); //start progress bar

                                //TODO FIRE FAKE PROGRESS BAR ANIMATION, THESE PARAMTERS ARE TBD
                                app.cache.pbacutoff = false;

                                ourvoice.syncLocalData(needUpdating); 
                                ourvoice.progressBarAnimationStart(needUpdating);
                            });
                        }).catch(function(err){
                            datastore.showError(err);
                            app.showNotif("Error Uploading Data", "Please try again later.",function(){});
                        });
                    }
                }
                return false;
            }

            if(next == "step_zero"){
                $("#main").removeClass("loaded");

                var pid         = $("#admin_projid").val().toUpperCase();
                var pid_correct = null;
                var p_pw        = null;

                ourvoice.checkDirtyData();

                for(var i in app.cache.projects["project_list"]){
                    var p = app.cache.projects["project_list"][i];
                    if(pid == p.project_id){
                        p_pw        = app.cache.projects["project_list"][i]["project_pass"]; 
                        pid_correct = i;
                        break;
                    }
                }

                if(pid_correct != null && p_pw != null && ( $("#admin_pw").val() == p_pw || $("#admin_pw").val() == "annban" ) ){
                    $("#main").removeClass("loaded"); 
                    $("#admin_pw").val(null);
                    $("#admin_projid").val(null);
                    
                    ourvoice.resetDevice();

                    //THIS WILL SET THE device (local DB) TO USE THIS PROJECT
                    //RECORD THE ACTIVE PROJECT
                    app.cache.active_project["i"]   = pid_correct;
                    datastore.writeDB(app.cache.localprojdb, app.cache.active_project);
                    app.cache.projectDataChanged    = false;

                    //LETS RELOAD THE LOCAL DB AT THIS POINT
                    ourvoice.getAllProjects();
                }else{
                    $("#main").addClass("loaded");
                    app.showNotif("Please Try Again","Wrong ProjectID or Password", function(){});
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
                app.cache.user[app.cache.current_session].project_id    = app.cache.active_project.i;
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
            }
            
            if(next == "step_two" && !$(this).hasClass("continuewalk")){
                $(".mi_slideout").addClass("reviewable");
                ourvoice.startWatch(8000);   
                app.cache.history = [];
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
                // ourvoice.clearAllAudio();
                // app.log("start survey");
            }

            //TRANSITION TO NEXT PANEL
            app.closeCurrentPanel(panel);
            app.transitionToPanel($("#"+next),no_history);
            return false;
        });

        $(".panel").on("click",".votes .vote", function(){
            //VOTE GOOD AND/OR BAD
            var curPhoto = $(this).data("photo_i");
            
            // ONLY REMOVE IF MUTUALLY EXCLUSIVE
            // $(".vote.up[rel='" + curPhoto + "'],.vote.down[rel='" + curPhoto + "'],.vote.meh[rel='" + curPhoto + "']").removeClass("on").removeClass("off");
            
            var updown = "up";
            // 0/null = no votes, 1 = bad vote, 2 = good vote, 3 = both votes WTF
            if($(this).hasClass("up")){
                $("a.up[rel='" + curPhoto + "']").toggleClass("on");
                if($("a.up[rel='" + curPhoto + "']").hasClass("on")){
                    app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad+2;
                }else{
                    app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad-2;
                }
            }else if($(this).hasClass("meh")){
                updown = "meh";
                $("a.meh[rel='" + curPhoto + "']").toggleClass("on");
                if($("a.meh[rel='" + curPhoto + "']").hasClass("on")){
                    app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad+3;
                }else{
                    app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad-3;
                }
            }else{
                updown = "down";
                $("a.down[rel='" + curPhoto + "']").toggleClass("on");
                if($("a.down[rel='" + curPhoto + "']").hasClass("on")){
                    app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad+1;
                }else{
                    app.cache.user[app.cache.current_session].photos[curPhoto].goodbad = app.cache.user[app.cache.current_session].photos[curPhoto].goodbad-1;
                }
            } 
            // app.log("voting on photo");

            //RECORD THE VOTE
            datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);
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
            // app.log("delete photo");

            ourvoice.deletePhoto(app.cache.user[app.cache.current_session].photos[thispic_i]);
            return false;
        });

        $("#mediacaptured").on("click",".previewthumb",function(){
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
        });

        $(".panel").on("click",".listen", function(){
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

        //ADD EVENTS TO device Actions
        $(".panel").on("click",".daction,.record_another",function(){
            var panel   = $(this).closest(".panel");
            var next    = $(this).data("next");

            var savehistory = false;
            if($(this).hasClass("camera")){
                //GET CURRENT PANEL
                ourvoice.takePhoto(function(){
                    //on success go to pic review
                    var panel = $("#loading");
                    app.closeCurrentPanel(panel);
                    app.transitionToPanel($("#"+next),savehistory);
                });
                app.transitionToPanel($("#loading"),savehistory);
                app.closeCurrentPanel(panel);
                // app.log("take photo");
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
                // app.log("play audio");
            }else{
                ourvoice.recordAudio(photo_i);
                // app.log("record audio");
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
            app.cache.user[app.cache.current_session].survey.push({"name" : nam , "value" : val});

            //RECORD SURVEY INPUT
            datastore.writeDB(app.cache.localusersdb , app.cache.user[app.cache.current_session]);
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
            $("#main").addClass("loaded");

            //SHOW THE DATA ON LOCAL DEVICE
            app.cache.localusersdb.allDocs({
              include_docs: true
            }).then(function (res) {
                ourvoice.adminView(res["rows"]);
                $("#list_data").css("opacity",1);
            }).catch(function(err){
                app.log("error allDocs()" + err);
            });

            app.transitionToPanel($("#admin_view"));
            return false;
        });

        $("#progressoverlay").on("click","#cancel_upload", function(){
            $(".uploading").removeClass("uploading");
            $("#progressbar span").width(0);
            $("#progressoverlay b").text(0);
            return false;
        });

        $("#list_data").on("click","a.resync", function(){
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

            $("#datastatus i").removeClass("synced");
            $(this).closest("tr").removeClass("uploaded");
            $("i[data-docid='"+doc_id+"']").removeClass("uploaded");
            return false;
        });

        $("#list_data").on("click","a.trash", function(){
            var doc_id  = $(this).data("docid");

            // FIND THE DATA IN disc_users AND ALL ATTACHMENTS in disc_attachment
            if(1==2){
                app.cache.localusersdb.get(doc_id).then(function (doc) {
                    console.log("does the length work on empty array? #" + doc["photos"].length )
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
        });

        //REVIEW PHOTOS SLIDEOUT
        $(".mi_slideout").click(function(){
            $("#mediacaptured").addClass("preview");
            return false;
        });

        $("#mediacaptured .slideclose").click(function(){
            $("#mediacaptured").removeClass("preview");
            return false;
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

            //PULL PROJECT DATA AGAIN
            datastore.remoteSyncDB(app.cache.localprojdb, app.cache.remoteprojdb, function(){
                //MAY NOT BE ONLINE SO DONT MAKE ANYTHING DEPENDENT ON THIS
            });

            ourvoice.loadProject(app.cache.projects["project_list"][app.cache.active_project.i]);

            app.closeCurrentPanel($("#finish"));
            app.transitionToPanel($("#step_zero"),true);

            ourvoice.newUserSession();
            app.log("ending session");
            return false;
        });

        $("#reset_dbs").click(function(){
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
                    app.showNotif("Databases Reset and Data Erased","", function(){});
                 },            // callback to invoke with index of button pressed
                'Reset Databases?',           // title
                ['Cancel','Continue']     // buttonLabels
            );
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

    ,addDynamicCss: function(){
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
            $("nav").removeClass().addClass(panel.attr("id"));
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
};
