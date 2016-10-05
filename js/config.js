var config = {
    database : {
         "users_local"     : "disc_users"
        ,"users_remote"    : "http://cdbadm:AsoupedUp784U@cci-hrp-cdb.stanford.edu/disc_users"

        ,"proj_local"      : "disc_projects"
        ,"proj_remote"     : "http://cdbadm:AsoupedUp784U@cci-hrp-cdb.stanford.edu/disc_projects"
    
        ,"log_local"       : "disc_log"
        ,"log_remote"      : "http://cdbadm:AsoupedUp784U@cci-hrp-cdb.stanford.edu/disc_log"
    }

    ,default_user : {
        // myDoc._id = pouchCollate.toIndexableString([myDoc.age, myDoc.male, mydoc.lastName, mydoc.firstName]);
        
         "_id"                  : null
        ,"project_id"           : null
        ,"user_id"              : null
        ,"lang"                 : null
        ,"photos"               : []
        ,"geotags"              : []
        ,"survey"               : []
        ,"_attachments"         : {}
    }
    
    ,default_projects  : {
         "_id"          : "all_projects"
        ,"project_list"     : [
             {
                 "project_id"  : "XYZ"
                ,"project_name": "The XYZ Project"
                ,"project_pass": "discxyz"
                ,"thumbs"      : true
                ,"lang"        : [
                     { "lang" : "en"
                      ,"language" : "English" 
                      ,"translations" : [
                         { "project_about" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project."}
                        ,{ "main_title" : "Discovery Tool" }
                        ,{ "help" : "Help"}
                        ,{ "back" : "Back" }
                        ,{ "letsgo" : "Let's Go!"}
                        ,{ "consent_title_1"  : "DESCRIPTION"}
                        ,{ "consent_block_1"  : "You are invited to participate in Our Voice as part of a project to understand what happens when community members gather information about their neighborhoods and use that information to advocate for positive changes."}
                        ,{ "consent_title_2"  : ""}
                        ,{ "consent_block_2"  : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk."}
                        ,{ "consent_title_3"  : ""}
                        ,{ "consent_block_3"  : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy."}
                        ,{ "consent_title_4"  : "TIME INVOLVEMENT"}
                        ,{ "consent_block_4"  : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours."}
                        ,{ "consent_title_5"  : "RISKS AND BENEFITS"}
                        ,{ "consent_block_5"  : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits."}
                        ,{ "consent_title_6"  : "PAYMENTS"}
                        ,{ "consent_block_6"  : "You will receive no payments for your participation."}
                        ,{ "consent_title_7"  : "SUBJECT’S RIGHTS"}
                        ,{ "consent_block_7"  : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time."}
                        ,{ "consent_title_8"  : "Questions"}
                        ,{ "consent_block_8"  : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)."}
                        ,{ "consent_title_9"  : "Independent Contact"}
                        ,{ "consent_block_9"  : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306."}
                        ,{ "next" : "Next"}
                        ,{ "i_understand"   : "I Understand"}
                        ,{ "step_1" : "Step 1 - Go for a walk" }
                        ,{ "step_2" : "Step 2 - Take Photos..."}
                        ,{ "start" : "Start"}
                        ,{ "done_walk" : "Done with my walk"}
                        ,{ "review_pics" : "Review Photos"}
                        ,{ "photos_here" : "Your photos will show here..."}                

                        ,{ "photo_detail" : "Photo Preview"}
                        ,{ "why_audio" : "Tell us why you took this photo."}
                        ,{ "good_or_bad" : "Is this good or bad for the community?"}
                        ,{ "review_done" : "Done with photo!"}
                        ,{ "you_recording" : "You are recording..."}
                        ,{ "you_playing" : "Audio playback..."}
                        ,{ "done_recording" : "Done Recording"}
                        ,{ "done_playing" : "End Playback"}

                        ,{ "almost_there" : "Almost there..."}
                        ,{ "please_answer" : "Please answer a few questions."}
                        ,{ "submit_answers" : "Submit Answers"}
                        ,{ "confirm_end" : "End Current Walk?"} 
                        ,{ "dist_traveled" : "Distance Traveled"} 
                        ,{ "yes_done": "Yes, I am done with my walk"}
                        ,{ "no_continue": "No, I want to continue my walk"} 
                        ,{ "thank_you_participant" : "Thank you for sharing your neighborhood with us!" }
                        ,{ "finish_return" : "Finish and Return Device"}
                        
                        ,{ "audio_instructions" : "Audio Instructions" }
                        ,{ "audio_1" : "The purpose of this tool."}
                        ,{ "audio_2" : "How to use it."} 
                        ,{ "audio_3" : "What to look out for."}
                        ,{ "audio_4" : "Getting ready for review."}
                        ,{ "audio_5" : "How to review pictures."}
                        ,{ "audio_6" : "How to review audio."}
                        ,{ "audio_7" : "Getting ready for the survey."}
                        ,{ "audio_8" : "How to move through the survey."}
                        ,{ "audio_9" : "How to complete the survey questions."}                
                     ]}
                    ,{   "lang" : "es"
                        ,"language" : "Spanish"
                        ,"translations" : [
                         { "project_about" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project."}
                        ,{ "main_title"     : "La Herramienta de Descubrimiento"}
                        ,{ "help"           : "Ayuda"}
                        ,{ "back"           : "Regresar" }
                        ,{ "letsgo"         : "¡Vamos!"}
                        ,{ "consent_title_1"  : "DESCRIPTION"}
                        ,{ "consent_block_1"  : "La Herramienta de Descubrimiento le ayudará a capturar  información importante para que entonces pueda colaborar con otros para hacer cambios positivos en su comunidad."}
                        ,{ "consent_title_2"  : ""}
                        ,{ "consent_block_2"  : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk."}
                        ,{ "consent_title_3"  : ""}
                        ,{ "consent_block_3"  : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy."}
                        ,{ "consent_title_4"  : "TIME INVOLVEMENT"}
                        ,{ "consent_block_4"  : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours."}
                        ,{ "consent_title_5"  : "RISKS AND BENEFITS"}
                        ,{ "consent_block_5"  : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits."}
                        ,{ "consent_title_6"  : "PAYMENTS"}
                        ,{ "consent_block_6"  : "You will receive no payments for your participation."}
                        ,{ "consent_title_7"  : "SUBJECT’S RIGHTS"}
                        ,{ "consent_block_7"  : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time."}
                        ,{ "consent_title_8"  : "Questions"}
                        ,{ "consent_block_8"  : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)."}
                        ,{ "consent_title_9"  : "Independent Contact"}
                        ,{ "consent_block_9"  : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306."}
                        ,{ "next"           : "Próximo"}
                        ,{ "i_understand"   : "Entiendo"}
                        ,{ "step_1"         : "Paso 1 - Dar una caminata" }
                        ,{ "step_2"         : "Paso 2 - Tomar Fotografías"}
                        ,{ "start"          : "INICIO"}
                        ,{ "done_walk"      : "He terminado mi caminata"}
                        ,{ "review_pics" : "Review Photos"}
                        ,{ "photos_here" : "Your photos will show here..."}                

                        ,{ "photo_detail" : "Photo Preview"}
                        ,{ "why_audio"      : "¿Porqué tomó esta fotografía."}
                        ,{ "good_or_bad"    : "¿Es algo bueno o malo para la comunidad?"}
                        ,{ "review_done" : "Done with photo!"}
                        ,{ "you_recording" : "You are recording..."}
                        ,{ "you_playing" : "Audio playback..."}
                        ,{ "done_recording" : "Done Recording"}
                        ,{ "done_playing" : "End Playback"}

                        ,{ "almost_there" : "Almost there..."}
                        ,{ "please_answer" : "Please answer a few questions."}
                        ,{ "submit_answers" : "Submit Answers"}
                        ,{ "confirm_end" : "End Current Walk?"} 
                        ,{ "dist_traveled" : "Distance Traveled"} 
                        ,{ "yes_done"       : "Sí, he terminado con mi caminata"}
                        ,{ "no_continue"    : "No, quiero continuar con mi caminata"} 
                        ,{ "thank_you_participant" : "Thank you for sharing your neighborhood with us!" }
                        ,{ "finish_return" : "Finish and Return Device"}
                        
                        ,{ "audio_instructions" : "Audio Instructions" }
                        ,{ "audio_1" : "The purpose of this tool."}
                        ,{ "audio_2" : "How to use it."} 
                        ,{ "audio_3" : "What to look out for."}
                        ,{ "audio_4" : "Getting ready for review."}
                        ,{ "audio_5" : "How to review pictures."}
                        ,{ "audio_6" : "How to review audio."}
                        ,{ "audio_7" : "Getting ready for the survey."}
                        ,{ "audio_8" : "How to move through the survey."}
                        ,{ "audio_9" : "How to complete the survey questions."}  
                    ]}
                ]
                ,"surveys"     : [
                    { "type"        : "radio"
                      ,"name"       : "gender"
                      ,"label"      : [
                         {"lang" : "en", "text" : "Are you male or female?"}
                        ,{"lang" : "es", "text" : "Tu es stupido?"} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Male", "value" : "m"}
                            ,{"lang" : "es", "text" : "Male", "value" : "m" }
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Female", "value" : "f"}
                            ,{"lang" : "es", "text" : "Female", "value" : "f"}
                         ] 
                      ] 
                    }
                    ,{ "type"       : "select"
                      ,"name"       : "birthplace"
                      ,"label"      : [
                         {"lang" : "en", "text" : "Were you born in the USA?"}
                        ,{"lang" : "es", "text" : "Vamos la puerta da recha?"} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Yes", "value" : "Yes"}
                            ,{"lang" : "es", "text" : "Si" , "value" : "Si" }
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "No", "value" : "No"}
                            ,{"lang" : "es", "text" : "No", "value" : "No"}
                         ] 
                      ] 
                    }
                    ,{ "type"       : "text"
                      ,"name"       : "neighborhood_name" 
                      ,"label"      : [
                         {"lang" : "en", "text" : "What is your neighborhood name?"}
                        ,{"lang" : "es", "text" : "Donde es la biblioteca?"} 
                      ] 
                    }
                    ,{ "type"       : "number"
                      ,"name"       : "age" 
                      ,"label"      : [
                         {"lang" : "en", "text" : "What is your age?"}
                        ,{"lang" : "es", "text" : "Yo quiero taco bell?"} 
                      ] 
                    }

                    ,{ "type"        : "radio"
                      ,"name"       : "close_knit"
                      ,"label"      : [
                         {"lang" : "en", "text" : "This is a close-knit neighborhood."}
                        ,{"lang" : "es", "text" : "This is a close-knit neighborhood."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "influence"
                      ,"label"      : [
                         {"lang" : "en", "text" : "I can influence decisions that affect my community."}
                        ,{"lang" : "es", "text" : "I can influence decisions that affect my community."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "community"
                      ,"label"      : [
                         {"lang" : "en", "text" : "BY working together with others in my community, I can influence decisions that affect my community."}
                        ,{"lang" : "es", "text" : "BY working together with others in my community, I can influence decisions that affect my community."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "connections"
                      ,"label"      : [
                         {"lang" : "en", "text" : "PEople in my community have connections to people who can influence what happens in my community."}
                        ,{"lang" : "es", "text" : "PEople in my community have connections to people who can influence what happens in my community."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ] 
                    }
                ]
             }

             ,{
                 "project_id"  : "ABC"
                ,"project_name": "The ABC Project"
                ,"project_pass": "discabc"
                ,"thumbs"      : false
                ,"lang"        : [
                     { "lang" : "en"
                      ,"language" : "English" 
                      ,"translations" : [
                         { "project_about" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project."}
                        ,{ "main_title" : "Discovery Tool" }
                        ,{ "help" : "Help"}
                        ,{ "back" : "Back" }
                        ,{ "letsgo" : "Let's Go!"}
                        ,{ "consent_title_1"  : "DESCRIPTION"}
                        ,{ "consent_block_1"  : "You are invited to participate in Our Voice as part of a project to understand what happens when community members gather information about their neighborhoods and use that information to advocate for positive changes."}
                        ,{ "consent_title_2"  : ""}
                        ,{ "consent_block_2"  : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk."}
                        ,{ "consent_title_3"  : ""}
                        ,{ "consent_block_3"  : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy."}
                        ,{ "consent_title_4"  : "TIME INVOLVEMENT"}
                        ,{ "consent_block_4"  : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours."}
                        ,{ "consent_title_5"  : "RISKS AND BENEFITS"}
                        ,{ "consent_block_5"  : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits."}
                        ,{ "consent_title_6"  : "PAYMENTS"}
                        ,{ "consent_block_6"  : "You will receive no payments for your participation."}
                        ,{ "consent_title_7"  : "SUBJECT’S RIGHTS"}
                        ,{ "consent_block_7"  : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time."}
                        ,{ "consent_title_8"  : "Questions"}
                        ,{ "consent_block_8"  : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)."}
                        ,{ "consent_title_9"  : "Independent Contact"}
                        ,{ "consent_block_9"  : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306."}
                        ,{ "next" : "Next"}
                        ,{ "i_understand"   : "I Understand"}
                        ,{ "step_1" : "Step 1 - Go for a walk" }
                        ,{ "step_2" : "Step 2 - Take Photos..."}
                        ,{ "start" : "Start"}
                        ,{ "done_walk" : "Done with my walk"}
                        ,{ "review_pics" : "Review Photos"}
                        ,{ "photos_here" : "Your photos will show here..."}                

                        ,{ "photo_detail" : "Photo Preview"}
                        ,{ "why_audio" : "Tell us why you took this photo."}
                        ,{ "good_or_bad" : "Is this good or bad for the community?"}
                        ,{ "review_done" : "Done with photo!"}
                        ,{ "you_recording" : "You are recording..."}
                        ,{ "you_playing" : "Audio playback..."}
                        ,{ "done_recording" : "Done Recording"}
                        ,{ "done_playing" : "End Playback"}

                        ,{ "almost_there" : "Almost there..."}
                        ,{ "please_answer" : "Please answer a few questions."}
                        ,{ "submit_answers" : "Submit Answers"}
                        ,{ "confirm_end" : "End Current Walk?"} 
                        ,{ "dist_traveled" : "Distance Traveled"} 
                        ,{ "yes_done": "Yes, I am done with my walk"}
                        ,{ "no_continue": "No, I want to continue my walk"} 
                        ,{ "thank_you_participant" : "Thank you for sharing your neighborhood with us!" }
                        ,{ "finish_return" : "Finish and Return Device"}
                        
                        ,{ "audio_instructions" : "Audio Instructions" }
                        ,{ "audio_1" : "The purpose of this tool."}
                        ,{ "audio_2" : "How to use it."} 
                        ,{ "audio_3" : "What to look out for."}
                        ,{ "audio_4" : "Getting ready for review."}
                        ,{ "audio_5" : "How to review pictures."}
                        ,{ "audio_6" : "How to review audio."}
                        ,{ "audio_7" : "Getting ready for the survey."}
                        ,{ "audio_8" : "How to move through the survey."}
                        ,{ "audio_9" : "How to complete the survey questions."} 
                     ]}
                    ,{   "lang" : "es"
                        ,"language" : "Spanish"
                        ,"translations" : [
                         { "project_about" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project."}
                        ,{ "main_title"     : "La Herramienta de Descubrimiento"}
                        ,{ "help"           : "Ayuda"}
                        ,{ "back"           : "Regresar" }
                        ,{ "letsgo"         : "¡Vamos!"}
                        ,{ "consent_title_1"  : "DESCRIPTION"}
                        ,{ "consent_block_1"  : "La Herramienta de Descubrimiento le ayudará a capturar  información importante para que entonces pueda colaborar con otros para hacer cambios positivos en su comunidad."}
                        ,{ "consent_title_2"  : ""}
                        ,{ "consent_block_2"  : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk."}
                        ,{ "consent_title_3"  : ""}
                        ,{ "consent_block_3"  : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy."}
                        ,{ "consent_title_4"  : "TIME INVOLVEMENT"}
                        ,{ "consent_block_4"  : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours."}
                        ,{ "consent_title_5"  : "RISKS AND BENEFITS"}
                        ,{ "consent_block_5"  : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits."}
                        ,{ "consent_title_6"  : "PAYMENTS"}
                        ,{ "consent_block_6"  : "You will receive no payments for your participation."}
                        ,{ "consent_title_7"  : "SUBJECT’S RIGHTS"}
                        ,{ "consent_block_7"  : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time."}
                        ,{ "consent_title_8"  : "Questions"}
                        ,{ "consent_block_8"  : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)."}
                        ,{ "consent_title_9"  : "Independent Contact"}
                        ,{ "consent_block_9"  : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306."}
                        ,{ "next"           : "Próximo"}
                        ,{ "i_understand"   : "Entiendo"}
                        ,{ "step_1"         : "Paso 1 - Dar una caminata" }
                        ,{ "step_2"         : "Paso 2 - Tomar Fotografías"}
                        ,{ "start"          : "INICIO"}
                        ,{ "done_walk"      : "He terminado mi caminata"}
                        ,{ "review_pics" : "Review Photos"}
                        ,{ "photos_here" : "Your photos will show here..."}                

                        ,{ "photo_detail" : "Photo Preview"}
                        ,{ "why_audio"      : "¿Porqué tomó esta fotografía."}
                        ,{ "good_or_bad"    : "¿Es algo bueno o malo para la comunidad?"}
                        ,{ "review_done" : "Done with photo!"}
                        ,{ "you_recording" : "You are recording..."}
                        ,{ "you_playing" : "Audio playback..."}
                        ,{ "done_recording" : "Done Recording"}
                        ,{ "done_playing" : "End Playback"}

                        ,{ "almost_there" : "Almost there..."}
                        ,{ "please_answer" : "Please answer a few questions."}
                        ,{ "submit_answers" : "Submit Answers"}
                        ,{ "confirm_end" : "End Current Walk?"} 
                        ,{ "dist_traveled" : "Distance Traveled"} 
                        ,{ "yes_done"       : "Sí, he terminado con mi caminata"}
                        ,{ "no_continue"    : "No, quiero continuar con mi caminata"} 
                        ,{ "thank_you_participant" : "Thank you for sharing your neighborhood with us!" }
                        ,{ "finish_return" : "Finish and Return Device"}
                        
                        ,{ "audio_instructions" : "Audio Instructions" }
                        ,{ "audio_1" : "The purpose of this tool."}
                        ,{ "audio_2" : "How to use it."} 
                        ,{ "audio_3" : "What to look out for."}
                        ,{ "audio_4" : "Getting ready for review."}
                        ,{ "audio_5" : "How to review pictures."}
                        ,{ "audio_6" : "How to review audio."}
                        ,{ "audio_7" : "Getting ready for the survey."}
                        ,{ "audio_8" : "How to move through the survey."}
                        ,{ "audio_9" : "How to complete the survey questions."}                    
                    ]}
                    ,{   "lang" : "ch"
                        ,"language" : "Chinese"
                        ,"translations" : [
                         { "project_about" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project."}
                        ,{ "main_title" : "Discovery Tool" }
                        ,{ "help" : "Help"}
                        ,{ "back" : "Back" }
                        ,{ "letsgo" : "Let's Go!"}
                        ,{ "consent_title_1"  : "DESCRIPTION"}
                        ,{ "consent_block_1"  : "You are invited to participate in Our Voice as part of a project to understand what happens when community members gather information about their neighborhoods and use that information to advocate for positive changes."}
                        ,{ "consent_title_2"  : ""}
                        ,{ "consent_block_2"  : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk."}
                        ,{ "consent_title_3"  : ""}
                        ,{ "consent_block_3"  : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy."}
                        ,{ "consent_title_4"  : "TIME INVOLVEMENT"}
                        ,{ "consent_block_4"  : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours."}
                        ,{ "consent_title_5"  : "RISKS AND BENEFITS"}
                        ,{ "consent_block_5"  : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits."}
                        ,{ "consent_title_6"  : "PAYMENTS"}
                        ,{ "consent_block_6"  : "You will receive no payments for your participation."}
                        ,{ "consent_title_7"  : "SUBJECT’S RIGHTS"}
                        ,{ "consent_block_7"  : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time."}
                        ,{ "consent_title_8"  : "Questions"}
                        ,{ "consent_block_8"  : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)."}
                        ,{ "consent_title_9"  : "Independent Contact"}
                        ,{ "consent_block_9"  : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306."}
                        ,{ "next" : "Next"}
                        ,{ "i_understand"   : "I Understand"}
                        ,{ "step_1" : "Step 1 - Go for a walk" }
                        ,{ "step_2" : "Step 2 - Take Photos..."}
                        ,{ "start" : "Start"}
                        ,{ "done_walk" : "Done with my walk"}
                        ,{ "review_pics" : "Review Photos"}
                        ,{ "photos_here" : "Your photos will show here..."}                

                        ,{ "photo_detail" : "Photo Preview"}
                        ,{ "why_audio" : "Tell us why you took this photo."}
                        ,{ "good_or_bad" : "Is this good or bad for the community?"}
                        ,{ "review_done" : "Done with photo!"}
                        ,{ "you_recording" : "You are recording..."}
                        ,{ "you_playing" : "Audio playback..."}
                        ,{ "done_recording" : "Done Recording"}
                        ,{ "done_playing" : "End Playback"}

                        ,{ "almost_there" : "Almost there..."}
                        ,{ "please_answer" : "Please answer a few questions."}
                        ,{ "submit_answers" : "Submit Answers"}
                        ,{ "confirm_end" : "End Current Walk?"} 
                        ,{ "dist_traveled" : "Distance Traveled"} 
                        ,{ "yes_done": "Yes, I am done with my walk"}
                        ,{ "no_continue": "No, I want to continue my walk"} 
                        ,{ "thank_you_participant" : "Thank you for sharing your neighborhood with us!" }
                        ,{ "finish_return" : "Finish and Return Device"}
                        
                        ,{ "audio_instructions" : "Audio Instructions" }
                        ,{ "audio_1" : "The purpose of this tool."}
                        ,{ "audio_2" : "How to use it."} 
                        ,{ "audio_3" : "What to look out for."}
                        ,{ "audio_4" : "Getting ready for review."}
                        ,{ "audio_5" : "How to review pictures."}
                        ,{ "audio_6" : "How to review audio."}
                        ,{ "audio_7" : "Getting ready for the survey."}
                        ,{ "audio_8" : "How to move through the survey."}
                        ,{ "audio_9" : "How to complete the survey questions."}                      
                    ]}
                ]
                ,"surveys"     : [
                    { "type"        : "radio"
                      ,"name"       : "gender"
                      ,"label"      : [
                         {"lang" : "en", "text" : "Are you male or female?" }
                        ,{"lang" : "es", "text" : "Tu es stupido?"          } 
                        ,{"lang" : "ch", "text" : "CH Tu es stupido?"       } 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Male", "value" : "m"}
                            ,{"lang" : "es", "text" : "Male", "value" : "m" }
                            ,{"lang" : "ch", "text" : "Male", "value" : "m"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Female", "value" : "f"}
                            ,{"lang" : "es", "text" : "Female", "value" : "f"}
                            ,{"lang" : "ch", "text" : "Female", "value" : "f"}
                         ] 
                      ] 
                    }
                    ,{ "type"       : "select"
                      ,"name"       : "birthplace"
                      ,"label"      : [
                         {"lang" : "en", "text" : "Were you born in the USA?"   }
                        ,{"lang" : "es", "text" : "Vamos la puerta da recha?"   } 
                        ,{"lang" : "ch", "text" : "CH Vamos la puerta da recha?"} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Yes", "value" : "Yes"}
                            ,{"lang" : "es", "text" : "Si" , "value" : "Si" }
                            ,{"lang" : "ch", "text" : "Hai", "value" : "Hai"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "No", "value" : "No"}
                            ,{"lang" : "es", "text" : "No", "value" : "No"}
                            ,{"lang" : "ch", "text" : "BU", "value" : "BU"}
                         ] 
                      ] 
                    }
                    ,{ "type"       : "text"
                      ,"name"       : "neighborhood_name" 
                      ,"label"      : [
                         {"lang" : "en", "text" : "What is your neighborhood name?"}
                        ,{"lang" : "es", "text" : "Donde es la biblioteca?"} 
                        ,{"lang" : "ch", "text" : "CH Donde es la biblioteca?"} 
                      ] 
                    }
                    ,{ "type"       : "number"
                      ,"name"       : "age" 
                      ,"label"      : [
                         {"lang" : "en", "text" : "What is your age?"}
                        ,{"lang" : "es", "text" : "Yo quiero taco bell?"} 
                        ,{"lang" : "ch", "text" : "CH Yo quiero taco bell?"} 
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "close_knit"
                      ,"label"      : [
                         {"lang" : "en", "text" : "THis is a close-knit neighborhood."}
                        ,{"lang" : "es", "text" : "THis is a close-knit neighborhood."} 
                        ,{"lang" : "ch", "text" : "THis is a close-knit neighborhood."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                            ,{"lang" : "ch", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "ch", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "ch", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "ch", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "ch", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "influence"
                      ,"label"      : [
                         {"lang" : "en", "text" : "I can influence decisions that affect my community."}
                        ,{"lang" : "es", "text" : "I can influence decisions that affect my community."} 
                        ,{"lang" : "ch", "text" : "I can influence decisions that affect my community."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                            ,{"lang" : "ch", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "ch", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "ch", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "ch", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "ch", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ]
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "community"
                      ,"label"      : [
                         {"lang" : "en", "text" : "BY working together with others in my community, I can influence decisions that affect my community."}
                        ,{"lang" : "es", "text" : "BY working together with others in my community, I can influence decisions that affect my community."} 
                        ,{"lang" : "ch", "text" : "BY working together with others in my community, I can influence decisions that affect my community."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                            ,{"lang" : "ch", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "ch", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "ch", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "ch", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "ch", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ]
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "connections"
                      ,"label"      : [
                         {"lang" : "en", "text" : "PEople in my community have connections to people who can influence what happens in my community."}
                        ,{"lang" : "es", "text" : "PEople in my community have connections to people who can influence what happens in my community."} 
                        ,{"lang" : "ch", "text" : "PEople in my community have connections to people who can influence what happens in my community."} 
                      ] 
                      ,"options"    : [
                         [  
                             {"lang" : "en", "text" : "Strongly Disagree", "value" : "1"}
                            ,{"lang" : "es", "text" : "Strongly Disagree" , "value" : "1"}
                            ,{"lang" : "ch", "text" : "Strongly Disagree" , "value" : "1"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "es", "text" : "Somewhat Disagree", "value" : "2"}
                            ,{"lang" : "ch", "text" : "Somewhat Disagree", "value" : "2"}
                         ]
                         ,[  
                             {"lang" : "en", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "es", "text" : "Neutral", "value" : "3"}
                            ,{"lang" : "ch", "text" : "Neutral", "value" : "3"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "es", "text" : "Somewhat agree", "value" : "4"}
                            ,{"lang" : "ch", "text" : "Somewhat agree", "value" : "4"}
                         ] 
                         ,[  
                             {"lang" : "en", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "es", "text" : "Strongly agree", "value" : "5"}
                            ,{"lang" : "ch", "text" : "Strongly agree", "value" : "5"}
                         ]  
                      ] 
                    }
                ]
             }
        ]
    }
};
