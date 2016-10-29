var survey = {
	build : function(surveyitems, language){
        for(var i in surveyitems){
            var inp = surveyitems[i];

            var name 		= inp["name"];
            var labeltxt    = inp["label"][language];
            var opts        = null; 
            var type        = inp["type"];
            var div         = $("<div>").addClass("inputs").data("qnum",parseInt(i));

            var transQ      = $("<b data-translation-key='question'>").text("text");
            var transNext   = $("<b data-translation-key='next'>").text("text");
            var transBack   = $("<b data-translation-key='back'>").text("text");

            var questionnum = parseInt(i)+1;
            div.append($("<i class='qnum'>").text(" " + questionnum + "/" + surveyitems.length).prepend(transQ));

            //SET FIRST QUESTION AS FIRST ACTIVE PANEL
            if(i == 0){
                div.addClass("active");
            }else{
                div.find('.qnum').prepend($("<a>").attr("href","#").addClass("surveyback").data("qnum",parseInt(i)).text("« ").append(transBack));
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
            var nextbtn = $("<a>").addClass("button").data("next_q", i+1).append(transNext);   
            div.append(nextbtn);
            $("#survey fieldset").append(div);
        }

        survey.addEvents();
        return;
    }

    ,addEvents : function(){
        $("#survey fieldset .button").on("click", function(){
            $("#survey_please").fadeOut("fast");

            var this_q = $(this).closest("div.inputs");
            var next_q = this_q.next();

            this_q.addClass("off");
            if(next_q.length){
                next_q.removeClass("off").addClass("active");
            }else{
                var panel = $(this).closest(".panel");
                app.initCache();
                ourvoice.finished();
                
                //TRANSITION TO NEXT PANEL
                app.closeCurrentPanel(panel);
                app.transitionToPanel($("#finish"),1);
            }

            return false;
        });

        $(".surveyback").click(function(){
            var prev_q = $(this).data("qnum") - 1;

            var this_q = $(this).closest("div.inputs");
            var prev_q = this_q.prev();

            this_q.addClass("off").removeClass("active");
            prev_q.addClass("active").removeClass("off");
            return false;
        });
    }   
}