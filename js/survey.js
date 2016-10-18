var survey = {
	build : function(surveyitems, language){

        for(var i in surveyitems){
            var inp = surveyitems[i];

            var name 		= inp["name"];
            var labeltxt    = inp["label"][language];
            var opts        = null; 
            var type        = inp["type"];
            var div         = $("<div>").addClass("inputs");

            //SET FIRST QUESTION AS FIRST ACTIVE PANEL
            if(i == 0){
                div.addClass("active");
            }

            var span    = $("<span>").text(labeltxt).addClass("survey_q");
            var label   = $("<label>");
            var input   = $("<input>").attr("type","text").attr("name",name);
            var labelclass = "touchify_radio";

            div.append(span);
            switch(type){
                case "checkbox":
                labelclass = "touchify_checkbox";
                case "radio":
                    opts = inp["options"]; 
                    for(var o in opts){
                        var opt     = opts[o];
                        var optxt   = opt[language];
                        var optval 	= opt["value"];
                        
                        var label   = $("<label>");
                        var input   = $("<input>").attr("type","radio").attr("name",name).val(optval);
                        label.text(optxt);
                        label.addClass(labelclass);
                        label.prepend(input);
                        label.append($("<span>"));
                        div.append(label);
                    }
                break;

                case "select":
                    labelclass  = "touchify_select";
                    opts        = inp["options"]; 
                    var select  = $("<select>");
                    select.attr("name",name);

                    //always need at least one blank
                    var option = $("<option>").val(null).text("-");
                    select.append(option);

                    for(var o in opts){
                        var opt     = opts[o];
                        var optxt   = opt[language];
                        var optval  = opt["value"];
                        
                        var option = $("<option>").val(optval).text(optxt);
                        select.append(option);
                    }
                    label.addClass(labelclass);
                    label.append(select);
                    div.append(label);
                break;

                case "number":
                    input.attr("type","tel").attr("name",name);
                default:
                    labelclass = "touchify_text";
                    label.addClass(labelclass);
                    label.append(input);
                    div.append(label);
                break;
            }


            div.addClass("delete_on_reset");
            var nextbtn = $("<a>").addClass("button").text("Next").data("next_q", i+1);   
            div.append(nextbtn);
            $("#survey fieldset").append(div);
        }

        survey.addEvents();
        return;
    }

    ,addEvents : function(){
        $("#survey fieldset .button").on("click", function(){
            $("#survey_please").fadeOut();

            var this_q = $(this).closest("div.inputs");
            var next_q = this_q.next();

            this_q.addClass("off");
            if(next_q.length){
                next_q.addClass("active");
            }else{
                var panel = $(this).closest(".panel");
                ourvoice.finished();
                
                //TRANSITION TO NEXT PANEL
                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#finish"),1);
            }
        });
    }   
}