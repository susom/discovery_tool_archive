var survey = {
	build : function(surveyitems, language){
        for(var i in surveyitems){
            var inp = surveyitems[i];

            var name 		= inp["name"];
            var label       = inp["label"];
            var labeltxt    = null; 
            for(var l in label){
                var lang = label[l]["lang"];
                if(lang == language){
                    labeltxt = label[l]["text"];
                    break;
                }
            }

            var opts    = null; 
            var type    = inp["type"];

            var div     = $("<div>").addClass("inputs");
            var span    = $("<span>").text(labeltxt);
            var label   = $("<label>");
            var input   = $("<input>").attr("type","text").attr("name",name);

            div.append(span);
            switch(type){
                case "radio":
                    opts = inp["options"]; 

                    for(var o in opts){
                        var opt     = opts[o];
                        var optxt   = null;
                        var optval 	= null;
                        for(var l in opt){
                            var lang = opt[l]["lang"];
                            if(lang == language){
                                optxt	= opt[l]["text"];
                                optval 	= opt[l]["value"];
                                break;
                            }
                        }

                        var label   = $("<label>");
                        var input   = $("<input>").attr("type","radio").attr("name",name).val(optval);
                        label.text(optxt);
                        label.prepend(input);
                        div.append(label);
                    }
                break;

                case "select":
                    opts        = inp["options"]; 
                    var select  = $("<select>");
                    select.attr("name",name);

                    //always need at least one blank
                    var option = $("<option>").val(null).text("-");
                    select.append(option);

                    for(var o in opts){
                        var opt     = opts[o];
                        var optxt   = null;
                        var optval 	= null;
                        for(var l in opt){
                            var lang = opt[l]["lang"];
                            if(lang == language){
                                optxt 	= opt[l]["text"];
                                optval 	= opt[l]["value"];
                                break;
                            }
                        }
                        var option = $("<option>").val(optval).text(optxt);
                        select.append(option);
                    }

                    label.append(select);
                    div.append(label);
                break;

                case "number":
                    input.attr("type","tel").attr("name",name);
                default:
                    label.append(input);
                    div.append(label);
                break;
            }

            div.addClass("delete_on_reset")
            $("#survey fieldset").append(div);
        }
        return;
    }
}