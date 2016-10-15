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
                ,"app_lang"        : [
                     { "lang" : "en" ,"language" : "English" }
                    ,{ "lang" : "es" ,"language" : "Spanish" }
                ]
                ,"app_text" : [
                   { "key" : "project_about"         , "val" : {
                       "en" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project." 
                      ,"es" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project." 
                    }
                  }
                  ,{ "key" : "main_title"            , "val" : {
                       "en" : "Discovery Tool" 
                      ,"es" : "La Herramienta de Descubrimiento" 
                    }
                  }
                  ,{ "key" : "help"                  , "val" : {
                       "en" : "Help" 
                      ,"es" : "Ayuda" 
                    }
                  }
                  ,{ "key" : "back"                  , "val" : {
                       "en" : "Back" 
                      ,"es" : "Regresar" 
                    }
                  }
                  ,{ "key" : "letsgo"                , "val" : {
                       "en" : "Let's Go!" 
                      ,"es" : "¡Vamos!" 
                    }
                  }
                  ,{ "key" : "consent_title_1"       , "val" : {
                       "en" : "DESCRIPTION" 
                      ,"es" : "DESCRIPTION" 
                    }
                  }
                  ,{ "key" : "consent_block_1"       , "val" : {
                       "en" : "You are invited to participate in Our Voice as part of a project to understand what happens when community members gather information about their neighborhoods and use that information to advocate for positive changes." 
                      ,"es" : "La Herramienta de Descubrimiento le ayudará a capturar  información importante para que entonces pueda colaborar con otros para hacer cambios positivos en su comunidad." 
                    }
                  }
                  ,{ "key" : "consent_title_2"       , "val" : {
                       "en" : "" 
                      ,"es" : "" 
                    }
                  }
                  ,{ "key" : "consent_block_2"       , "val" : {
                       "en" : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk." 
                      ,"es" : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk."
                    }
                  }
                  ,{ "key" : "consent_title_3"       , "val" : {
                       "en" : "" 
                      ,"es" : "" 
                    }
                  }
                  ,{ "key" : "consent_block_3"       , "val" : {
                       "en" : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy." 
                      ,"es" : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy." 
                    }
                  }
                  ,{ "key" : "consent_title_4"       , "val" : {
                       "en" : "TIME INVOLVEMENT" 
                      ,"es" : "TIME INVOLVEMENT" 
                    }
                  }
                  ,{ "key" : "consent_block_4"       , "val" : {
                       "en" : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours." 
                      ,"es" : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours." 
                    }
                  }
                  ,{ "key" : "consent_title_5"       , "val" : {
                       "en" : "RISKS AND BENEFITS" 
                      ,"es" : "RISKS AND BENEFITS" 
                    }
                  }
                  ,{ "key" : "consent_block_5"       , "val" : {
                       "en" : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits." 
                      ,"es" : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits." 
                    }
                  }
                  ,{ "key" : "consent_title_6"       , "val" : {
                       "en" : "PAYMENTS" 
                      ,"es" : "PAYMENTS" 
                    }
                  }
                  ,{ "key" : "consent_block_6"       , "val" : {
                       "en" : "You will receive no payments for your participation." 
                      ,"es" : "You will receive no payments for your participation." 
                    }
                  }
                  ,{ "key" : "consent_title_7"       , "val" : {
                       "en" : "SUBJECT’S RIGHTS" 
                      ,"es" : "SUBJECT’S RIGHTS" 
                    }
                  }
                  ,{ "key" : "consent_block_7"       , "val" : {
                       "en" : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time." 
                      ,"es" : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time." 
                    }
                  }
                  ,{ "key" : "consent_title_8"       , "val" : {
                       "en" : "Questions" 
                      ,"es" : "Questions" 
                    }
                  }
                  ,{ "key" : "consent_block_8"       , "val" : {
                       "en" : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)." 
                      ,"es" : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)." 
                    }
                  }
                  ,{ "key" : "consent_title_9"       , "val" : {
                       "en" : "Independent Contact" 
                      ,"es" : "Independent Contact" 
                    }
                  }
                  ,{ "key" : "consent_block_9"       , "val" : {
                       "en" : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306." 
                      ,"es" : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306." 
                    }
                  }
                  ,{ "key" : "next"                  , "val" : {
                       "en" : "Next" 
                      ,"es" : "Próximo" 
                    }
                  }
                  ,{ "key" : "i_understand"          , "val" : {
                       "en" : "I Understand" 
                      ,"es" : "Entiendo" 
                    }
                  }
                  ,{ "key" : "step_1"                , "val" : {
                       "en" : "Step 1 - Go for a walk"  
                      ,"es" : "Paso 1 - Dar una caminata" 
                    }
                  }
                  ,{ "key" : "step_2"                , "val" : {
                       "en" : "Step 2 - Take Photos..." 
                      ,"es" : "Paso 2 - Tomar Fotografías" 
                    }
                  }
                  ,{ "key" : "start"                 , "val" : {
                       "en" : "Start" 
                      ,"es" : "INICIO" 
                    }
                  }
                  ,{ "key" : "done_walk"             , "val" : {
                       "en" : "Done with my walk" 
                      ,"es" : "He terminado mi caminata" 
                    }
                  }
                  ,{ "key" : "review_pics"           , "val" : {
                       "en" : "Review Photos" 
                      ,"es" : "Review Photos" 
                    }
                  }
                  ,{ "key" : "photos_here"           , "val" : {
                       "en" : "Your photos will show here..." 
                      ,"es" : "Your photos will show here..." 
                    }
                  }
                  ,{ "key" : "photo_detail"          , "val" : {
                       "en" : "Photo Preview" 
                      ,"es" : "Photo Preview" 
                    }
                  }
                  ,{ "key" : "why_audio"             , "val" : {
                       "en" : "Tell us why you took this photo." 
                      ,"es" : "¿Porqué tomó esta fotografía." 
                    }
                  }
                  ,{ "key" : "good_or_bad"           , "val" : {
                       "en" : "Is this good or bad for the community?" 
                      ,"es" : "¿Es algo bueno o malo para la comunidad?" 
                    }
                  }
                  ,{ "key" : "review_done"           , "val" : {
                       "en" : "Done with photo!" 
                      ,"es" : "Done with photo!" 
                    }
                  }
                  ,{ "key" : "you_recording"         , "val" : {
                       "en" : "You are recording..." 
                      ,"es" : "You are recording..." 
                    }
                  }
                  ,{ "key" : "you_playing"           , "val" : {
                       "en" : "Audio playback..." 
                      ,"es" : "Audio playback..." 
                    }
                  }
                  ,{ "key" : "done_recording"        , "val" : {
                       "en" : "Done Recording" 
                      ,"es" : "Done Recording" 
                    }
                  }
                  ,{ "key" : "done_playing"          , "val" : {
                       "en" : "End Playback" 
                      ,"es" : "End Playback" 
                    }
                  }
                  ,{ "key" : "almost_there"          , "val" : {
                       "en" : "Almost there..." 
                      ,"es" : "Almost there..." 
                    }
                  }
                  ,{ "key" : "please_answer"         , "val" : {
                       "en" : "Please answer a few questions." 
                      ,"es" : "Please answer a few questions." 
                    }
                  }
                  ,{ "key" : "submit_answers"        , "val" : {
                       "en" : "Submit Answers" 
                      ,"es" : "Submit Answers" 
                    }
                  }
                  ,{ "key" : "confirm_end"           , "val" : {
                       "en" : "End Current Walk?" 
                      ,"es" : "End Current Walk?" 
                    }
                  }
                  ,{ "key" : "dist_traveled"         , "val" : {
                       "en" : "Distance Traveled" 
                      ,"es" : "Distance Traveled" 
                    }
                  }
                  ,{ "key" : "yes_done"              , "val" : {
                       "en" : "Yes, I am done with my walk" 
                      ,"es" : "Sí, he terminado con mi caminata" }
                  }
                  ,{ "key" : "no_continue"           , "val" : {
                       "en" : "No, I want to continue my walk" 
                      ,"es" : "No, quiero continuar con mi caminata" 
                    }
                  }
                  ,{ "key" : "thank_you_participant" , "val" : {
                       "en" : "Thank you for sharing your neighborhood with us!" 
                      ,"es" : "Thank you for sharing your neighborhood with us!" }
                  }
                  ,{ "key" : "finish_return"         , "val" : {
                       "en" : "Finish and Return Device" 
                      ,"es" : "Finish and Return Device" 
                    }
                  }
                  ,{ "key" : "audio_instructions"    , "val" : {
                       "en" : "Audio Instructions"  
                      ,"es" : "Audio Instructions" 
                    }
                  }
                  ,{ "key" : "audio_1"               , "val" : {
                       "en" : "The purpose of this tool." 
                      ,"es" : "The purpose of this tool." 
                    }
                  }
                  ,{ "key" : "audio_2"               , "val" : {
                       "en" : "How to use it." 
                      ,"es" : "How to use it." 
                    }
                  }
                  ,{ "key" : "audio_3"               , "val" : {
                       "en" : "What to look out for." 
                      ,"es" : "What to look out for." 
                    }
                  }
                  ,{ "key" : "audio_4"               , "val" : {
                       "en" : "Getting ready for review." 
                      ,"es" : "Getting ready for review." 
                    }
                  }
                  ,{ "key" : "audio_5"               , "val" : {
                       "en" : "How to review pictures." 
                      ,"es" : "How to review pictures." 
                    }
                  }
                  ,{ "key" : "audio_6"               , "val" : {
                       "en" : "How to review audio." 
                      ,"es" : "How to review audio." 
                    }
                  }
                  ,{ "key" : "audio_7"               , "val" : {
                       "en" : "Getting ready for the survey." 
                      ,"es" : "Getting ready for the survey." 
                    }
                  }
                  ,{ "key" : "audio_8"               , "val" : {
                       "en" : "How to move through the survey." 
                      ,"es" : "How to move through the survey." 
                    }
                  }
                  ,{ "key" : "audio_9"               , "val" : {
                       "en" : "How to complete the survey questions." 
                      ,"es" : "How to complete the survey questions." 
                    }
                  }
                ]
                ,"surveys"     : [
                    { "type"        : "radio"
                      ,"name"       : "gender"
                      ,"label"      : {
                         "en" : "Are you male or female?"
                        ,"es" : "Tu es stupido?"
                      }  
                      ,"options"    : [
                          {  
                             "en" : "Male"
                            ,"es" : "Hombre"
                            ,"value" : "m" 
                          }
                         ,{  
                             "en" : "Female"
                            ,"es" : "Chica"
                            ,"value" : "f"
                          }
                      ] 
                    }
                    ,{ "type"       : "select"
                      ,"name"       : "birthplace"
                      ,"label"      : {
                         "en" : "Were you born in the USA?"
                        ,"es" : "Vamos la puerta da recha?"
                      } 
                      ,"options"    : [
                        {
                           "en" : "Yes"
                          ,"es" : "Si" 
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "No"
                          ,"es" : "No"
                          ,"value" : "0"
                        }
                      ]
                    }
                    ,{ "type"       : "text"
                      ,"name"       : "neighborhood_name" 
                      ,"label"      : { 
                         "en" : "What is your neighborhood name?"
                        ,"es" : "Donde es la biblioteca?"
                      } 
                    }
                    ,{ "type"       : "number"
                      ,"name"       : "age" 
                      ,"label"      : { 
                         "en" : "What is your age?"
                        ,"es" : "Yo quiero taco bell?"
                      } 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "close_knit"
                      ,"label"      : { 
                         "en" : "This is a close-knit neighborhood."
                        ,"es" : "This is a close-knit neighborhood."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "influence"
                      ,"label"      : { 
                         "en" : "I can influence decisions that affect my community."
                        ,"es" : "I can influence decisions that affect my community."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "community"
                      ,"label"      : {
                         "en" : "By working together with others in my community, I can influence decisions that affect my community."
                        ,"es" : "By working together with others in my community, I can influence decisions that affect my community."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ] 
                    }
                    ,{ "type"       : "radio"
                      ,"name"       : "connections"
                      ,"label"      : { 
                         "en" : "People in my community have connections to people who can influence what happens in my community."
                        ,"es" : "People in my community have connections to people who can influence what happens in my community."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ]  
                    }
                ]
             }
             ,{
                 "project_id"  : "ABC"
                ,"project_name": "The ABC Project"
                ,"project_pass": "discabc"
                ,"thumbs"      : false
                ,"app_lang"        : [
                     { "lang" : "en" ,"language" : "English" }
                    ,{ "lang" : "es" ,"language" : "Spanish" }
                ]
                ,"app_text" : [
                   { "key" : "project_about"         , "val" : {
                       "en" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project." 
                      ,"es" : "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project." 
                    }
                  }
                  ,{ "key" : "main_title"            , "val" : {
                       "en" : "Discovery Tool" 
                      ,"es" : "La Herramienta de Descubrimiento" 
                    }
                  }
                  ,{ "key" : "help"                  , "val" : {
                       "en" : "Help" 
                      ,"es" : "Ayuda" 
                    }
                  }
                  ,{ "key" : "back"                  , "val" : {
                       "en" : "Back" 
                      ,"es" : "Regresar" 
                    }
                  }
                  ,{ "key" : "letsgo"                , "val" : {
                       "en" : "Let's Go!" 
                      ,"es" : "¡Vamos!" 
                    }
                  }
                  ,{ "key" : "consent_title_1"       , "val" : {
                       "en" : "DESCRIPTION" 
                      ,"es" : "DESCRIPTION" 
                    }
                  }
                  ,{ "key" : "consent_block_1"       , "val" : {
                       "en" : "You are invited to participate in Our Voice as part of a project to understand what happens when community members gather information about their neighborhoods and use that information to advocate for positive changes." 
                      ,"es" : "La Herramienta de Descubrimiento le ayudará a capturar  información importante para que entonces pueda colaborar con otros para hacer cambios positivos en su comunidad." 
                    }
                  }
                  ,{ "key" : "consent_title_2"       , "val" : {
                       "en" : "" 
                      ,"es" : "" 
                    }
                  }
                  ,{ "key" : "consent_block_2"       , "val" : {
                       "en" : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk." 
                      ,"es" : "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk."
                    }
                  }
                  ,{ "key" : "consent_title_3"       , "val" : {
                       "en" : "" 
                      ,"es" : "" 
                    }
                  }
                  ,{ "key" : "consent_block_3"       , "val" : {
                       "en" : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy." 
                      ,"es" : "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy." 
                    }
                  }
                  ,{ "key" : "consent_title_4"       , "val" : {
                       "en" : "TIME INVOLVEMENT" 
                      ,"es" : "TIME INVOLVEMENT" 
                    }
                  }
                  ,{ "key" : "consent_block_4"       , "val" : {
                       "en" : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours." 
                      ,"es" : "The walk will take approximately 1 hour and the community meetings will take approximately 2-4 hours." 
                    }
                  }
                  ,{ "key" : "consent_title_5"       , "val" : {
                       "en" : "RISKS AND BENEFITS" 
                      ,"es" : "RISKS AND BENEFITS" 
                    }
                  }
                  ,{ "key" : "consent_block_5"       , "val" : {
                       "en" : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits." 
                      ,"es" : "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits." 
                    }
                  }
                  ,{ "key" : "consent_title_6"       , "val" : {
                       "en" : "PAYMENTS" 
                      ,"es" : "PAYMENTS" 
                    }
                  }
                  ,{ "key" : "consent_block_6"       , "val" : {
                       "en" : "You will receive no payments for your participation." 
                      ,"es" : "You will receive no payments for your participation." 
                    }
                  }
                  ,{ "key" : "consent_title_7"       , "val" : {
                       "en" : "SUBJECT’S RIGHTS" 
                      ,"es" : "SUBJECT’S RIGHTS" 
                    }
                  }
                  ,{ "key" : "consent_block_7"       , "val" : {
                       "en" : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time." 
                      ,"es" : "The results of this study may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time." 
                    }
                  }
                  ,{ "key" : "consent_title_8"       , "val" : {
                       "en" : "Questions" 
                      ,"es" : "Questions" 
                    }
                  }
                  ,{ "key" : "consent_block_8"       , "val" : {
                       "en" : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)." 
                      ,"es" : "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu)." 
                    }
                  }
                  ,{ "key" : "consent_title_9"       , "val" : {
                       "en" : "Independent Contact" 
                      ,"es" : "Independent Contact" 
                    }
                  }
                  ,{ "key" : "consent_block_9"       , "val" : {
                       "en" : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306." 
                      ,"es" : "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306." 
                    }
                  }
                  ,{ "key" : "next"                  , "val" : {
                       "en" : "Next" 
                      ,"es" : "Próximo" 
                    }
                  }
                  ,{ "key" : "i_understand"          , "val" : {
                       "en" : "I Understand" 
                      ,"es" : "Entiendo" 
                    }
                  }
                  ,{ "key" : "step_1"                , "val" : {
                       "en" : "Step 1 - Go for a walk"  
                      ,"es" : "Paso 1 - Dar una caminata" 
                    }
                  }
                  ,{ "key" : "step_2"                , "val" : {
                       "en" : "Step 2 - Take Photos..." 
                      ,"es" : "Paso 2 - Tomar Fotografías" 
                    }
                  }
                  ,{ "key" : "start"                 , "val" : {
                       "en" : "Start" 
                      ,"es" : "INICIO" 
                    }
                  }
                  ,{ "key" : "done_walk"             , "val" : {
                       "en" : "Done with my walk" 
                      ,"es" : "He terminado mi caminata" 
                    }
                  }
                  ,{ "key" : "review_pics"           , "val" : {
                       "en" : "Review Photos" 
                      ,"es" : "Review Photos" 
                    }
                  }
                  ,{ "key" : "photos_here"           , "val" : {
                       "en" : "Your photos will show here..." 
                      ,"es" : "Your photos will show here..." 
                    }
                  }
                  ,{ "key" : "photo_detail"          , "val" : {
                       "en" : "Photo Preview" 
                      ,"es" : "Photo Preview" 
                    }
                  }
                  ,{ "key" : "why_audio"             , "val" : {
                       "en" : "Tell us why you took this photo." 
                      ,"es" : "¿Porqué tomó esta fotografía." 
                    }
                  }
                  ,{ "key" : "good_or_bad"           , "val" : {
                       "en" : "Is this good or bad for the community?" 
                      ,"es" : "¿Es algo bueno o malo para la comunidad?" 
                    }
                  }
                  ,{ "key" : "review_done"           , "val" : {
                       "en" : "Done with photo!" 
                      ,"es" : "Done with photo!" 
                    }
                  }
                  ,{ "key" : "you_recording"         , "val" : {
                       "en" : "You are recording..." 
                      ,"es" : "You are recording..." 
                    }
                  }
                  ,{ "key" : "you_playing"           , "val" : {
                       "en" : "Audio playback..." 
                      ,"es" : "Audio playback..." 
                    }
                  }
                  ,{ "key" : "done_recording"        , "val" : {
                       "en" : "Done Recording" 
                      ,"es" : "Done Recording" 
                    }
                  }
                  ,{ "key" : "done_playing"          , "val" : {
                       "en" : "End Playback" 
                      ,"es" : "End Playback" 
                    }
                  }
                  ,{ "key" : "almost_there"          , "val" : {
                       "en" : "Almost there..." 
                      ,"es" : "Almost there..." 
                    }
                  }
                  ,{ "key" : "please_answer"         , "val" : {
                       "en" : "Please answer a few questions." 
                      ,"es" : "Please answer a few questions." 
                    }
                  }
                  ,{ "key" : "submit_answers"        , "val" : {
                       "en" : "Submit Answers" 
                      ,"es" : "Submit Answers" 
                    }
                  }
                  ,{ "key" : "confirm_end"           , "val" : {
                       "en" : "End Current Walk?" 
                      ,"es" : "End Current Walk?" 
                    }
                  }
                  ,{ "key" : "dist_traveled"         , "val" : {
                       "en" : "Distance Traveled" 
                      ,"es" : "Distance Traveled" 
                    }
                  }
                  ,{ "key" : "yes_done"              , "val" : {
                       "en" : "Yes, I am done with my walk" 
                      ,"es" : "Sí, he terminado con mi caminata" }
                  }
                  ,{ "key" : "no_continue"           , "val" : {
                       "en" : "No, I want to continue my walk" 
                      ,"es" : "No, quiero continuar con mi caminata" 
                    }
                  }
                  ,{ "key" : "thank_you_participant" , "val" : {
                       "en" : "Thank you for sharing your neighborhood with us!" 
                      ,"es" : "Thank you for sharing your neighborhood with us!" }
                  }
                  ,{ "key" : "finish_return"         , "val" : {
                       "en" : "Finish and Return Device" 
                      ,"es" : "Finish and Return Device" 
                    }
                  }
                  ,{ "key" : "audio_instructions"    , "val" : {
                       "en" : "Audio Instructions"  
                      ,"es" : "Audio Instructions" 
                    }
                  }
                  ,{ "key" : "audio_1"               , "val" : {
                       "en" : "The purpose of this tool." 
                      ,"es" : "The purpose of this tool." 
                    }
                  }
                  ,{ "key" : "audio_2"               , "val" : {
                       "en" : "How to use it." 
                      ,"es" : "How to use it." 
                    }
                  }
                  ,{ "key" : "audio_3"               , "val" : {
                       "en" : "What to look out for." 
                      ,"es" : "What to look out for." 
                    }
                  }
                  ,{ "key" : "audio_4"               , "val" : {
                       "en" : "Getting ready for review." 
                      ,"es" : "Getting ready for review." 
                    }
                  }
                  ,{ "key" : "audio_5"               , "val" : {
                       "en" : "How to review pictures." 
                      ,"es" : "How to review pictures." 
                    }
                  }
                  ,{ "key" : "audio_6"               , "val" : {
                       "en" : "How to review audio." 
                      ,"es" : "How to review audio." 
                    }
                  }
                  ,{ "key" : "audio_7"               , "val" : {
                       "en" : "Getting ready for the survey." 
                      ,"es" : "Getting ready for the survey." 
                    }
                  }
                  ,{ "key" : "audio_8"               , "val" : {
                       "en" : "How to move through the survey." 
                      ,"es" : "How to move through the survey." 
                    }
                  }
                  ,{ "key" : "audio_9"               , "val" : {
                       "en" : "How to complete the survey questions." 
                      ,"es" : "How to complete the survey questions." 
                    }
                  }
                ]
                ,"surveys"     : [
                    { "type"        : "radio"
                      ,"name"       : "gender"
                      ,"label"      : {
                         "en" : "Are you male or female?"
                        ,"es" : "Tu es stupido?"
                      }  
                      ,"options"    : [
                          {  
                             "en" : "Male"
                            ,"es" : "Hombre"
                            ,"value" : "m" 
                          }
                         ,{  
                             "en" : "Female"
                            ,"es" : "Chica"
                            ,"value" : "f"
                          }
                      ] 
                    }
                    ,{ "type"       : "select"
                      ,"name"       : "birthplace"
                      ,"label"      : {
                         "en" : "Were you born in the USA?"
                        ,"es" : "Vamos la puerta da recha?"
                      } 
                      ,"options"    : [
                        {
                           "en" : "Yes"
                          ,"es" : "Si" 
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "No"
                          ,"es" : "No"
                          ,"value" : "0"
                        }
                      ]
                    }
                    ,{ "type"       : "text"
                      ,"name"       : "neighborhood_name" 
                      ,"label"      : { 
                         "en" : "What is your neighborhood name?"
                        ,"es" : "Donde es la biblioteca?"
                      } 
                    }
                    ,{ "type"       : "number"
                      ,"name"       : "age" 
                      ,"label"      : { 
                         "en" : "What is your age?"
                        ,"es" : "Yo quiero taco bell?"
                      } 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "close_knit"
                      ,"label"      : { 
                         "en" : "This is a close-knit neighborhood."
                        ,"es" : "This is a close-knit neighborhood."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "influence"
                      ,"label"      : { 
                         "en" : "I can influence decisions that affect my community."
                        ,"es" : "I can influence decisions that affect my community."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ] 
                    }
                    ,{ "type"        : "radio"
                      ,"name"       : "community"
                      ,"label"      : {
                         "en" : "By working together with others in my community, I can influence decisions that affect my community."
                        ,"es" : "By working together with others in my community, I can influence decisions that affect my community."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ] 
                    }
                    ,{ "type"       : "radio"
                      ,"name"       : "connections"
                      ,"label"      : { 
                         "en" : "People in my community have connections to people who can influence what happens in my community."
                        ,"es" : "People in my community have connections to people who can influence what happens in my community."
                      } 
                      ,"options"    : [
                        { 
                           "en" : "Strongly Disagree"
                          ,"es" : "Strongly Disagree"
                          ,"value" : "1"
                        }
                        ,{ 
                           "en" : "Somewhat Disagree"
                          ,"es" : "Somewhat Disagree"
                          ,"value" : "2"
                        }
                        ,{ 
                           "en" : "Neutral"
                          ,"es" : "Neutral"
                          ,"value" : "3"

                        }
                        ,{ 
                           "en" : "Somewhat agree"
                          ,"es" : "Somewhat agree"
                          ,"value" : "4"
                        }
                        ,{ 
                           "en" : "Strongly agree"
                          ,"es" : "Strongly agree"
                          ,"value" : "5"
                        }
                      ]  
                    }
                ]
             }
        ]
    }
};
