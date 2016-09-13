var config = {
    database : {
         "users_local"     : "disc_users"
        ,"users_remote"    : "http://cdbadm:AsoupedUp784U@cci-hrp-cdb.stanford.edu/disc_users"

        ,"proj_local"      : "disc_projects"
        ,"proj_remote"     : "http://cdbadm:AsoupedUp784U@cci-hrp-cdb.stanford.edu/disc_projects"
    }

    ,default_user : {
        // myDoc._id = pouchCollate.toIndexableString(
        // [myDoc.age, myDoc.male, mydoc.lastName, mydoc.firstName]);
         "_id"                  : new Date().toJSON() 
        ,"project_id"           : null
        ,"user_id"              : null
        ,"lang"                 : null
        ,"photos"               : []
        ,"geotags"              : []
        ,"history"              : []
    }
    
    ,default_projects  : {
         "_id"          : "all_projects"
        ,"project_list"     : [
             {
                 "project_id"  : "XYZ"
                ,"project_name": "The XYZ Project"
                ,"lang"        : [
                     { "lang" : "en"
                      ,"language" : "English" 
                      ,"translations" : [
                         { "letsgo" : "Let's Go English!"}
                        ,{ "consent_block" : "The Discovery Tool will help you gather information so that you can work with others to make positive changes in your community."}
                        ,{ "next" : "Next"}
                        ,{ "safety_tips" : "CONSENT TO PARTICIPATE IN OUR VOICE" }
                        ,{ "saftey_header" : "While you are using the Discovery Tool:"}
                        ,{ "safety_point_1": "Walk with a partner"}
                        ,{ "saftey_point_2" : "Do not take pictures of people’s faces"}
                        ,{ "saftey_point_3" : "Pay attention to where you are walking"}
                        ,{ "saftey_point_4" : "Avoid dangerous situations"}
                        ,{ "saftey_point_5" : "Ask for help if you need it!"}
                        ,{ "i_understand"   : "I Understand"}
                        ,{ "step_1" : "Step 1 - Go for a walk" }
                        ,{ "step_1_go" : "Go outside and press Start to begin:"}
                        ,{ "start" : "Start"}
                        ,{ "why_audio" : "Why did you take this photo?"}
                        ,{ "good_or_bad" : "Is this good or bad for the community?"}
                        ,{ "thank_you_participant" : "Thank you for sharing your neighborhood with us!" }
                        ,{ "your_photos" : "Your Photos" }
                        ,{ "done_walk" : "I am done with my walk"}
                        ,{ "take_photo" : "Take a Photo" }
                        ,{ "step_2" : "Step 2 - Take Photos..."}
                        ,{ "step_2_during" : "During your community walk!"}
                        ,{ "main_title" : "Discovery Tool"}
                        ,{ "help" : "Help"}
                        ,{ "back" : "Back" }
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
                        ,{ "yes_done": "Yes, I am done with my walk"}
                        ,{ "no_continue":"No, I want to continue my walk"} 
                        ,{ "photos_here" : "Your photos will show here..."}                
                     ]}
                    ,{   "lang" : "es"
                        ,"language" : "Spanish"
                        ,"translations" : [
                         { "letsgo"         : "¡Vamos!"}
                        ,{ "consent_block"  : "La Herramienta de Descubrimiento le ayudará a capturar  información importante para que entonces pueda colaborar con otros para hacer cambios positivos en su comunidad."}
                        ,{ "next"           : "Próximo"}
                        ,{ "safety_tips"    : "Consejos de seguridad" }
                        ,{ "saftey_header"  : "Mientras utilize La Herramienta de Descubrimiento:"}
                        ,{ "safety_point_1" : "Camine con un compañero/a"}
                        ,{ "saftey_point_2" : "No tome fotos en que se vean las caras de las personas"}
                        ,{ "saftey_point_3" : "Preste atención a dónde está caminando"}
                        ,{ "saftey_point_4" : "Evite situaciones peligrosas"}
                        ,{ "saftey_point_5" : "Pida ayuda si la necesita"}
                        ,{ "i_understand"   : "Entiendo"}
                        ,{ "step_1"         : "Paso 1 - Dar una caminata" }
                        ,{ "step_1_go"      : "Salga a la calle y presione el botón INICIO para comenzar"}
                        ,{ "start"          : "INICIO"}
                        ,{ "why_audio"      : "¿Porqué tomó esta fotografía?"}
                        ,{ "good_or_bad"    : "¿Es algo bueno o malo para la comunidad?"}
                        ,{ "thank_you_participant" : "SP Thank you for sharing your neighborhood with us! If you have any questions contact:" }
                        ,{ "your_photos"    : "Sus fotografías" }
                        ,{ "done_walk"      : "He terminado mi caminata"}
                        ,{ "take_photo"     : "TOMAR UNA FOTOGRAFÍA" }
                        ,{ "step_2"         : "Paso 2 - Tomar Fotografías"}
                        ,{ "step_2_during"  : "Durante su caminata por la comunidad"}
                        ,{ "main_title"     : "La Herramienta de Descubrimiento"}
                        ,{ "help"           : "Ayuda"}
                        ,{ "back"           : "Regresar" }
                        ,{ "audio_instructions" : "SP Audio Instructions" }
                        ,{ "audio_1"        : "SP The purpose of this tool."}
                        ,{ "audio_2"        : "SP How to use it."} 
                        ,{ "audio_3"        : "SP What to look out for."}
                        ,{ "audio_4"        : "SP Getting ready for review."}
                        ,{ "audio_5"        : "SP How to review pictures."}
                        ,{ "audio_6"        : "SP How to review audio."}
                        ,{ "audio_7"        : "SP Getting ready for the survey."}
                        ,{ "audio_8"        : "SP How to move through the survey."}
                        ,{ "audio_9"        : "SP How to complete the survey questions."}  
                        ,{ "yes_done"       : "Sí, he terminado con mi caminata"}
                        ,{ "no_continue"    : "No, quiero continuar con mi caminata"} 
                        ,{ "photos_here"    : "SP Your photos will show here..."}                      
                    ]}
                    
                ]
             }

             ,{
                 "project_id"  : "ABC"
                ,"project_name": "The ABC Project"
                ,"lang"        : [
                     { "lang" : "en"
                      ,"language" : "English" 
                      ,"translations" : [
                         { "letsgo" : "Let's Go English!"}
                        ,{ "consent_block" : "The Discovery Tool will help you gather information so that you can work with others to make positive changes in your community."}
                        ,{ "next" : "Next"}
                        ,{ "safety_tips" : "Safety Tips" }
                        ,{ "saftey_header" : "While you are using the Discovery Tool:"}
                        ,{ "safety_point_1": "Walk with a partner"}
                        ,{ "saftey_point_2" : "Do not take pictures of people’s faces"}
                        ,{ "saftey_point_3" : "Pay attention to where you are walking"}
                        ,{ "saftey_point_4" : "Avoid dangerous situations"}
                        ,{ "saftey_point_5" : "Ask for help if you need it!"}
                        ,{ "i_understand"   : "I Understand"}
                        ,{ "step_1" : "Step 1 - Go for a walk" }
                        ,{ "step_1_go" : "Go outside and press Start to begin:"}
                        ,{ "start" : "Start"}
                        ,{ "why_audio" : "Why did you take this photo?"}
                        ,{ "good_or_bad" : "Is this good or bad for the community?"}
                        ,{ "thank_you_participant" : "Thank you for sharing your neighborhood with us! If you have any questions contact:" }
                        ,{ "your_photos" : "Your Photos" }
                        ,{ "done_walk" : "I am done with my walk"}
                        ,{ "take_photo" : "Take a Photo" }
                        ,{ "step_2" : "Step 2 - Take Photos..."}
                        ,{ "step_2_during" : "During your community walk!"}
                        ,{ "main_title" : "Discovery Tool"}
                        ,{ "help" : "Help"}
                        ,{ "back" : "Back" }
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
                        ,{ "yes_done": "Yes, I am done with my walk"}
                        ,{ "no_continue":"No, I want to continue my walk"} 
                        ,{ "photos_here" : "Your photos will show here..."}                
                     ]}
                    ,{   "lang" : "es"
                        ,"language" : "Spanish"
                        ,"translations" : [
                         { "letsgo"         : "Let's Go Spanish!"}
                        ,{ "consent_block"  : "SP The Discovery Tool will help you gather information so that you can work with others to make positive changes in your community."}
                        ,{ "next"           : "SP Next"}
                        ,{ "safety_tips"    : "SP Safety Tips" }
                        ,{ "saftey_header"  : "SP While you are using the Discovery Tool:"}
                        ,{ "safety_point_1" : "SP Walk with a partner"}
                        ,{ "saftey_point_2" : "SP Do not take pictures of people’s faces"}
                        ,{ "saftey_point_3" : "SP Pay attention to where you are walking"}
                        ,{ "saftey_point_4" : "SP Avoid dangerous situations"}
                        ,{ "saftey_point_5" : "SP Ask for help if you need it!"}
                        ,{ "i_understand"   : "SP I Understand"}
                        ,{ "step_1"         : "SP Step 1 - Go for a walk" }
                        ,{ "step_1_go"      : "SP Go outside and press Start to begin:"}
                        ,{ "start"          : "SP Start"}
                        ,{ "why_audio"      : "SP Why did you take this photo?"}
                        ,{ "good_or_bad"    : "SP Is this good or bad for the community?"}
                        ,{ "thank_you_participant" : "SP Thank you for sharing your neighborhood with us! If you have any questions contact:" }
                        ,{ "your_photos"    : "SP Your Photos" }
                        ,{ "done_walk"      : "SP I am done with my walk"}
                        ,{ "take_photo"     : "SP Take a Photo" }
                        ,{ "step_2"         : "SP Step 2 - Take Photos..."}
                        ,{ "step_2_during"  : "SP During your community walk!"}
                        ,{ "main_title"     : "SP Discovery Tool"}
                        ,{ "help"           : "SP Help"}
                        ,{ "back"           : "SP Back" }
                        ,{ "audio_instructions" : "SP Audio Instructions" }
                        ,{ "audio_1"        : "SP The purpose of this tool."}
                        ,{ "audio_2"        : "SP How to use it."} 
                        ,{ "audio_3"        : "SP What to look out for."}
                        ,{ "audio_4"        : "SP Getting ready for review."}
                        ,{ "audio_5"        : "SP How to review pictures."}
                        ,{ "audio_6"        : "SP How to review audio."}
                        ,{ "audio_7"        : "SP Getting ready for the survey."}
                        ,{ "audio_8"        : "SP How to move through the survey."}
                        ,{ "audio_9"        : "SP How to complete the survey questions."}  
                        ,{ "yes_done"       : "SP Yes, I am done with my walk"}
                        ,{ "no_continue"    : "SP No, I want to continue my walk"} 
                        ,{ "photos_here"    : "SP Your photos will show here..."}                    
                    ]}
                    ,{   "lang" : "ch"
                        ,"language" : "Chinese"
                        ,"translations" : [
                         { "letsgo"         : "Let's Go Chinese!"}
                        ,{ "consent_block"  : "CH The Discovery Tool will help you gather information so that you can work with others to make positive changes in your community."}
                        ,{ "next"           : "CH Next"}
                        ,{ "safety_tips"    : "CH Safety Tips" }
                        ,{ "saftey_header"  : "CH While you are using the Discovery Tool:"}
                        ,{ "safety_point_1" : "CH Walk with a partner"}
                        ,{ "saftey_point_2" : "CH Do not take pictures of people’s faces"}
                        ,{ "saftey_point_3" : "CH Pay attention to where you are walking"}
                        ,{ "saftey_point_4" : "CH Avoid dangerous situations"}
                        ,{ "saftey_point_5" : "CH Ask for help if you need it!"}
                        ,{ "i_understand"   : "CH I Understand"}
                        ,{ "step_1"         : "CH Step 1 - Go for a walk" }
                        ,{ "step_1_go"      : "CH Go outside and press Start to begin:"}
                        ,{ "start"          : "CH Start"}
                        ,{ "why_audio"      : "CH Why did you take this photo?"}
                        ,{ "good_or_bad"    : "CH Is this good or bad for the community?"}
                        ,{ "thank_you_participant" : "CH Thank you for sharing your neighborhood with us! If you have any questions contact:" }
                        ,{ "your_photos"    : "CH Your Photos" }
                        ,{ "done_walk"      : "CH I am done with my walk"}
                        ,{ "take_photo"     : "CH Take a Photo" }
                        ,{ "step_2"         : "CH Step 2 - Take Photos..."}
                        ,{ "step_2_during"  : "CH During your community walk!"}
                        ,{ "main_title"     : "CH Discovery Tool"}
                        ,{ "help"           : "CH Help"}
                        ,{ "back"           : "CH Back" }
                        ,{ "audio_instructions" : "CH Audio Instructions" }
                        ,{ "audio_1"        : "CH The purpose of this tool."}
                        ,{ "audio_2"        : "CH How to use it."} 
                        ,{ "audio_3"        : "CH What to look out for."}
                        ,{ "audio_4"        : "CH Getting ready for review."}
                        ,{ "audio_5"        : "CH How to review pictures."}
                        ,{ "audio_6"        : "CH How to review audio."}
                        ,{ "audio_7"        : "CH Getting ready for the survey."}
                        ,{ "audio_8"        : "CH How to move through the survey."}
                        ,{ "audio_9"        : "CH How to complete the survey questions."} 
                        ,{ "yes_done"       : "CH Yes, I am done with my walk"}
                        ,{ "no_continue"    : "CH No, I want to continue my walk"}
                        ,{ "photos_here"    : "CH Your photos will show here..."}                      
                    ]}
                ]
             }
        ]
    }
};
