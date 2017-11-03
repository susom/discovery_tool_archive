// survey.build(project["surveys"], lang);  
var consent = {
	build : function(consentitems, language){
        $(".dynamic_consent").remove();
        var consent_count   = consentitems.length;
        if(consent_count > 0){
            for(var i in consentitems){
                var consent_item    = consentitems[i];
                var div_id          = "consent_" + i;
                var next_i          = parseInt(i) + 1;
                var next_id         = "consent_" + next_i;

                var container       = $("<div>").attr("id", div_id).addClass("panel").addClass("dynamic_consent");
                var header          = consent_item["title"][language] != "" ? $("<h2>").addClass("consent_title").text(consent_item["title"][language]) : $("<span>");
                var content         = $("<div>").addClass("consent"); 
                var bodytext        = consent_item["text"][language].replace(/\r/g,"<br>");
                bodytext            = bodytext.replace(/\*/g,"&middot;");
                var block           = $("<blockquote>").html(bodytext);
                var next            = $("<a>").addClass("button").attr("href","#").data("next", next_id).text(consent_item["button"][language]);

                if(next_i == consent_count){
                    next.data("next","step_one");
                }

                //DONT KNOW WHY THE LIVE EVENT ADDER DOESNT WORK HERE
                next.click(function(){
                    //GET CURRENT PANEL
                    var panel       = $(this).closest(".panel");
                    var next        = $(this).data("next");

                    //TRANSITION TO NEXT PANEL
                    app.closeCurrentPanel(panel);
                    app.transitionToPanel($("#"+next),false);
                    return false;
                });

                content.append(block);
                content.append(next); 
                container.append(header);
                container.append(content);
                $("#project_about").after(container);
            }

            //REPOINT THE PROJECT ABOUT TO POINT TO THIS CONSENT
            $("#step_zero a.button").data("next","consent_0");
        }
        return;
    }
}