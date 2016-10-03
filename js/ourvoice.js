var ourvoice = {
    adminSetup : function(){
        app.cache.admin_pass = null;
        $("#main").addClass("loaded");
        app.transitionToPanel($("#step_setup")); 
        return;
    }

    ,getAllProjects : function(){
        //LOAD UP PROJECTS FROM LOCAL DB
        app.cache.localprojdb.get("all_projects").then(function (doc) {
            app.cache.projects = doc;
            
            //THERE SHOULD BE AT LEAST 1 PROJECT
            if(app.cache.projects["project_list"] < 1){
                //DELIBERATLEY THROW ERROR, NO PROJECTS IN THE LOCAL DB
                throw err;
            } 
            //CHECK TO SEE IF THERE IS AN "active_project" SET YET
            if(app.cache.active_project.hasOwnProperty("i")){
                //THIS DEVICE HAS BEEN SET UP TO USE A PROJECT
                ourvoice.loadProject(app.cache.projects["project_list"][app.cache.active_project.i]);
                app.transitionToPanel($("#step_zero"));
            }else{
                //SHOW ADMIN DEVICE SET UP 
                ourvoice.adminSetup();
            }
        }).catch(function (err) {
            console.log("ALL ERRORS (EVEN FROM .then() PROMISES) FLOW THROUGH TO BE CAUGHT HERE");

            //IF NO PROJECTS THEN PUT UP THIS LOADING ERROR
            var cantconnect = $("<h3>").addClass("loadfail").addClass("delete_on_reset").text("Sorry, unable to connect to server.  Please close the app and try later.");
            $(".title hgroup").append(cantconnect);
        });
    }

    ,loadProject : function(project){
        var p = project;

        //SEARCH LOCAL USERS DB FOR USERS WITH PARTIAL COLLATED uuid + project_id
        var partial_id  = datastore.pouchCollate([app.cache.uuid,  p["project_id"]]);
        var partial_end = partial_id + "\uffff";
        app.cache.localusersdb.allDocs({
            // IF NO OPTION, RETURN JUST _id AND _rev (FASTER)
             startkey   : partial_id
            ,endkey     : partial_end
        }).then(function (res) {
            app.initCache();

            //SET THE NEXT AVAILABLE USER OBJECT _id
            app.cache.active_project["proj_id"] = p["project_id"];
            app.cache.participant_id            = (res["rows"].length + 1);
            app.cache.next_id                   = datastore.pouchCollate([app.cache.uuid,   app.cache.active_project["proj_id"],   app.cache.participant_id]);
            app.cache.proj_thumbs               = p["thumbs"];

            //Display This Info
            $("#step_zero b.proj_name").text(p["project_name"]);
            $("#step_zero b.user_id").text(app.cache.participant_id);
            if(!app.cache.proj_thumbs){
                $("#pic_review li.good_or_bad").hide();
            }else{
                $("#pic_review li.good_or_bad").show();
            }

            $("select[name='language']").empty();
            for(var l in p["lang"]){
                var l_option = $("<option>").val(p["lang"][l]["lang"]).text(p["lang"][l]["language"]);
                 $("select[name='language']").append(l_option);
            }
            ourvoice.updateLanguage(app.cache.active_project["proj_id"],"en");
        }).then(function(){
            $("select[name='language']").change(function(){
                //REAL TIME LANGUAGE TRANSLATION UPDATES
                var lang_id = $(this).val();
                ourvoice.updateLanguage(app.cache.active_project["proj_id"],lang_id);
            });
        }).catch(function(err){
            console.log("ERROR localusers tables:");
            datastore.showError(err);
        });
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

        //OK JUST REDO THE SURVEY EVERYTIME
        $("#survey fieldset").empty();
        survey.build(app.cache.projects["project_list"][app.cache.active_project.i]["surveys"], lang);           
    }

    ,startWatch: function(freq) {
        //SAVE GEO TAGS FOR MAP
        ourvoice.trackPosition(); //manually do the first one
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
            }
            ,function(err){
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

    ,startPlaying : function(photo_i){
        $("#audio_record").addClass("playing");
        var attref          = "audio_" + photo_i + ".wav";
        var base64_or_arbuf = app.cache.user["_attachments"][attref]["data"];
            
        // TODO /9/30/16
        // GOTTA FIGURE OUT IF THE BASE64 AUDIO IS VIABLE 
        // BY SEEING IF IT CAN BE REPLAYED
        // var strip_typedata  = base64_or_arbuf.replace("data:audio/wav;base64,","");
        // var snd             = new Audio(strip_typedata);
        // snd.play();

        // console.log(strip_typedata);
        // var decodedData     = window.atob(strip_typedata);
        // console.log("this dont work?");
        // console.log(decodedData);

        // window.AudioContext = window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
        // var context         = new AudioContext();

        // //this represents the audio source. We need to now populate it with binary data.
        // var source          = context.createBufferSource(); 

        // //populate audio source from the retrieved binary data. This can be done using decodeAudioData function.
        // //first parameter of decodeAudioData needs to be array buffer type. 
        // //So from wherever you retrieve binary data make sure you get in form of array buffer type.
        // context.decodeAudioData(base64_or_arbuf, function(buffer) {
        //     source.buffer   = buffer;

        //     //destination property is reference the default audio device
        //     source.connect(context.destination);

        //     //now play the sound.
        //     source.start(0);
        // }, null);
        // console.log("neighter audiocontext");

        $("#soundwaves").removeClass("pause");
        $("#ctl_stop").removeClass("off");
        return;
    }

    ,stopRecording : function(photo_i){
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

            app.cache.audioObj.release();
        }else if(app.cache.audioStatus == "stop_release"){
            app.cache.audioObj.stop();
            $("#audio_time").text("00:00");

            app.cache.user.photos[photo_i]["audio"] = true;
            $(".mediaitem .audiorec[rel='"+photo_i+"']").addClass("hasAudio");
            $("#pic_review .daction.audio").addClass("hasAudio");

            //NOW SAVE IT AS AN INLINE ATTACHMENT
            var fileEntry   = app.cache.currentAudio ; 
            var attref      = "audio_" + photo_i + ".wav";
            fileEntry.file(function(file) {
                    var reader       = new FileReader();
                    reader.onloadend = function(e) {
                        var base64_or_arbuf = this.result;
                        var strip_typedata  = base64_or_arbuf.replace("data:audio/wav;base64,","");
                        var blobit          = new Blob([base64_or_arbuf], {type: 'audio/wav'})
                        app.cache.user._attachments[attref] = { "content_type": "audio/wav" , "data" : blobit };
                    };
                    // reader.readAsArrayBuffer(file);
                    reader.readAsDataURL(file);
                }
                ,function(err){
                    console.log(err);
                    // console.log("ERROR FILE");                
                }
            );
            app.cache.audioObj.release();
            app.cache.audioObj = null;
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

    ,startRecording : function(photo_i){
        $("#audio_record").removeClass("playing");
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
        $("#ctl_stop").data("photo_i",photo_i).removeClass("off");
        return;
    }

    ,recordAudio: function(photo_i){
        //ios requires .wav format, .mp3 for android
        //without full path saves to documents/tmp or LocalFileSystem.TEMPORARY
        //Files can be recorded and played back using the documents URI: var myMedia = new Media("documents://beer.mp3")
        //IOS requires the file to be created if it doesnt exist.
        
        if(app.cache.audioObj != null) {
            ourvoice.startRecording(photo_i);
            return;
        }

        if(app.cache.platform == "iOS") {
            var recordFileName = "audio_"+ photo_i +".wav";
            var recordFileName = "temp_recording.wav";

            //first create file if not exist
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0
                ,function(fileSystem){
                    fileSystem.root.getFile(recordFileName, {
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
                            app.cache.audioObj      = new Media(recordFileName
                                ,function(){
                                    // console.log(fileEntry);
                                    // console.log("MediaObject successfully completed play, record, or stop action");
                                }
                                ,function(err){
                                    console.log(err.code +  " : " + err.message);
                                }
                                ,function(){
                                    // The callback that executes to indicate status changes.
                                }); //of new Media
                        }
                        ,function(err){
                            console.log("IOS FUCKING ERROR");
                            console.log(err.code +  " : " + err.message);
                        }); //of getFile
                }
                ,function(){
                    // console.log("window.requestFileSystem  error()");
                }
            ); //of requestFileSystem

            ourvoice.startRecording(photo_i);
        }else{
            var recordFileName = "temp_recording.mp3";
            app.cache.audioObj = new Media(recordFileName, function(){
                // console.log("Media created successfully");
            }, function(err){
                //ANDROID ERROR
                console.log("ANDROID FUCKING ERROR?");
                console.log(err.code +  " : " + err.message);
            }, null); 

            ourvoice.startRecording(photo_i);
        }
        return;
    }

    ,takePhoto: function(){
        // take pic
        // save pic filename + geotag location
        navigator.camera.getPicture( 
            function(imageData){
                var fileurl = "data:image/jpeg;base64," + imageData;

                app.cache.user.photos.push({
                         "audio"    : false
                        ,"geotag"   : null 
                        ,"goodbad"  : null
                    });

                //make sure the audio gets the proper photo to save to
                var thispic_i   = app.cache.user.photos.length - 1;
                var geotag      = ourvoice.tagLocation(app.cache.user.photos[thispic_i]);

                //PREPARE ATTACHEMENT
                var attref      = "photo_" + thispic_i + ".jpg";
                app.cache.user._attachments[attref] = { "content_type": "image/jpeg" , "data" : imageData };

                //SET UP PHOTO PREVIEW PAGE
                ourvoice.previewPhoto(app.cache.user.photos[thispic_i], fileurl);

                //ADD LIST ITEM TO REVIEW PAGE
                setTimeout(function(){
                    ourvoice.addMediaItem(app.cache.user.photos[thispic_i], fileurl);
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

    ,previewPhoto: function(_photo,fileurl){
        var photo_i = app.cache.user.photos.indexOf(_photo);
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
        if(_photo["audio"]){
            $(".daction.audio").addClass("hasAudio");
        }else{
            $(".daction.audio").removeClass("hasAudio");
        }

        $("#pic_review a.trashit").data("photo_i",photo_i).attr("rel",photo_i);
        $("#pic_review a.vote").data("photo_i",photo_i).attr("rel",photo_i);
        $("#recent_pic").attr("src",fileurl);
        return;
    }

    ,addMediaItem:function(_photo,fileurl){
        var photo_i     = app.cache.user.photos.indexOf(_photo);
        var geotag      = _photo["geotag"];
        var time        = utils.readableTime(geotag.timestamp);

        //NOW ADD THIS TO THE VIEW #mediacaptured
        var newitem     = $("<li>").addClass("mediaitem").addClass("photo_"+photo_i);
        var newlink     = $("<a>").addClass("previewthumb").attr("href","#").data("photo_i",photo_i).attr("rel",photo_i).html($("<span>").text("@ " + time));
        var newthum     = $("<img>").attr("src",fileurl);
        
        var trash       = $("<a>").addClass("trashit").attr("href","#").data("photo_i",photo_i).html("&#128465;");
        var audiorec    = $("<a>").attr("href","#").addClass("audiorec").data("photo_i",photo_i).attr("rel",photo_i).attr("data-next","audio_record");
        if(_photo["audio"]){
            //IF HAS AUDIO THEN SHOW PLAY BUTTON
            audiorec.addClass("hasAudio");
        }
        newlink.prepend(newthum);
        newitem.append(newlink);
        newitem.append(audiorec);
        
        if(app.cache.proj_thumbs){
            var thumbs      = $("<div>").addClass("votes");
            var thumbsup    = $("<a>").attr("href","#").addClass("vote").addClass("up").data("photo_i",photo_i).attr("rel",photo_i);
            var thumbsdown  = $("<a>").attr("href","#").addClass("vote").addClass("down").data("photo_i",photo_i).attr("rel",photo_i);
            thumbs.append(thumbsup);
            thumbs.append(thumbsdown);
            newitem.append(thumbs);
        }
        newitem.append(trash);

        $(".nomedia").hide();
        newitem.addClass("delete_on_reset");
        $("#mediacaptured").append(newitem);

        var pic_count   = $(".mi_slideout b").text();
        pic_count       = parseInt(pic_count) + 1;
        $(".mi_slideout b").text(pic_count);
        return;
    }

    ,deletePhoto: function(_photo){
        confirm("Delete this photo?");
        
        var photo_i = app.cache.user.photos.indexOf(_photo);
        app.cache.user.photos[photo_i] = null;
        $("#mediacaptured a[rel='"+photo_i+"']").parents(".mediaitem").fadeOut("medium").delay(250).queue(function(next){
            $(this).remove();
            var pic_count   = $(".mi_slideout b").text();
            pic_count       = parseInt(pic_count) - 1;
            $(".mi_slideout b").text(pic_count);
            next();
        });
        return;
    }

    ,resetDevice : function(){
        $(".loaded").removeClass("loaded");
        $(".mi_slideout b").text(0);
        $(".nomedia").show();
        $(".delete_on_reset").remove();
        app.initCache();

        return;
    }
};