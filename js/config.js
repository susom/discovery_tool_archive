var config = {
    database : {
         "users_local"     : "disc_users"
        ,"users_remote"    : "http://disc_user_general:rQaKibbDx7rP@cci-hrp-cdb.stanford.edu/disc_users"

        ,"proj_local"      : "disc_projects"
        ,"proj_remote"     : "http://disc_user_general:rQaKibbDx7rP@cci-hrp-cdb.stanford.edu/disc_projects"
    
        ,"log_local"       : "disc_log"
        ,"log_remote"      : "http://disc_user_general:rQaKibbDx7rP@cci-hrp-cdb.stanford.edu/disc_log"
    }

    ,default_user : {
        // myDoc._id            = pouchCollate.toIndexableString([a,b,c]);
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
                                   "project_id": "XYZ",
                                   "project_name": "The XYZ Project",
                                   "project_pass": "discxyz",
                                   "thumbs": 2,
                                   "app_lang": [
                                       {
                                           "lang": "en",
                                           "language": "English"
                                       },
                                       {
                                           "lang": "es",
                                           "language": "Spanish"
                                       }
                                   ],
                                   "app_text": [
                                       {
                                           "key": "project_about",
                                           "val": {
                                               "en": "Welcome to the Discovery Tool! Before you get started, we want to make sure you fully understand your role in this project.",
                                               "es": "¡Bienvenidos a la Herramienta de Descumbrimiento! Antes de comenzar, queremos que usted entienda lo que envuelve su participación en este proyecto."
                                           }
                                       },
                                       {
                                           "key": "main_title",
                                           "val": {
                                               "en": "Discovery Tool",
                                               "es": "La Herramienta de Descubrimiento"
                                           }
                                       },
                                       {
                                           "key": "help",
                                           "val": {
                                               "en": "Help",
                                               "es": "Ayuda"
                                           }
                                       },
                                       {
                                           "key": "back",
                                           "val": {
                                               "en": "Back",
                                               "es": "Regresar"
                                           }
                                       },
                                       {
                                           "key": "letsgo",
                                           "val": {
                                               "en": "Let's Go",
                                               "es": "¡Vamos!"
                                           }
                                       },
                                       {
                                           "key": "next",
                                           "val": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "key": "i_understand",
                                           "val": {
                                               "en": "I Understand",
                                               "es": "Entiendo"
                                           }
                                       },
                                       {
                                           "key": "step_1",
                                           "val": {
                                               "en": "Step 1 - Go for a walk",
                                               "es": "Paso 1 - Ir a caminar"
                                           }
                                       },
                                       {
                                           "key": "step_2",
                                           "val": {
                                               "en": "Step 2 - Take Photos",
                                               "es": "Paso 2 - Tomar fotos"
                                           }
                                       },
                                       {
                                           "key": "start",
                                           "val": {
                                               "en": "Start",
                                               "es": "COMENZAR"
                                           }
                                       },
                                       {
                                           "key": "done_walk",
                                           "val": {
                                               "en": "Done with my walk",
                                               "es": "Terminé con mi caminata"
                                           }
                                       },
                                       {
                                           "key": "review_pics",
                                           "val": {
                                               "en": "Review Photos",
                                               "es": "Revisar foto"
                                           }
                                       },
                                       {
                                           "key": "photos_here",
                                           "val": {
                                               "en": "Your photos will show here...",
                                               "es": "Your photos will show here..."
                                           }
                                       },
                                       {
                                           "key": "photo_detail",
                                           "val": {
                                               "en": "Photo Preview",
                                               "es": "Revisar foto"
                                           }
                                       },
                                       {
                                           "key": "why_audio",
                                           "val": {
                                               "en": "Tell us why you took this photo.",
                                               "es": "Cuéntenos porqué tomó esta foto."
                                           }
                                       },
                                       {
                                           "key": "good_or_bad",
                                           "val": {
                                               "en": "Is this good or bad for the community?",
                                               "es": "¿Es algo bueno o malo para la comunidad?"
                                           }
                                       },
                                       {
                                           "key": "review_done",
                                           "val": {
                                               "en": "Done with photo!",
                                               "es": "¡Terminé con esta foto!"
                                           }
                                       },
                                       {
                                           "key": "you_recording",
                                           "val": {
                                               "en": "You are recording...",
                                               "es": "Está grabando..."
                                           }
                                       },
                                       {
                                           "key": "audio_recorded",
                                           "val": {
                                               "en": "Audio Recorded. Thanks!",
                                               "es": "Audio grabado. ¡Gracias!"
                                           }
                                       },
                                       {
                                           "key": "you_playing",
                                           "val": {
                                               "en": "Audio playback...",
                                               "es": "Audio playback..."
                                           }
                                       },
                                       {
                                           "key": "done_recording",
                                           "val": {
                                               "en": "Done Recording",
                                               "es": "Terminé mi grabación"
                                           }
                                       },
                                       {
                                           "key": "done_playing",
                                           "val": {
                                               "en": "End Playback",
                                               "es": "End Playback"
                                           }
                                       },
                                       {
                                           "key": "almost_there",
                                           "val": {
                                               "en": "Almost there...",
                                               "es": "Casi al final…"
                                           }
                                       },
                                       {
                                           "key": "please_answer",
                                           "val": {
                                               "en": "Please answer a few questions.",
                                               "es": "Por favor conteste algunas preguntas."
                                           }
                                       },
                                       {
                                           "key": "submit_answers",
                                           "val": {
                                               "en": "Submit Answers",
                                               "es": "Submit Answers"
                                           }
                                       },
                                       {
                                           "key": "confirm_end",
                                           "val": {
                                               "en": "Are you done?",
                                               "es": "¿Terminar caminata?"
                                           }
                                       },
                                       {
                                           "key": "dist_traveled",
                                           "val": {
                                               "en": "Distance Traveled",
                                               "es": "Distance Traveled"
                                           }
                                       },
                                       {
                                           "key": "you_took",
                                           "val": {
                                               "en": "You took",
                                               "es": "You took"
                                           }
                                       },
                                       {
                                           "key": "photos",
                                           "val": {
                                               "en": "photos",
                                               "es": "photos"
                                           }
                                       },
                                       {
                                           "key": "yes_done",
                                           "val": {
                                               "en": "Yes, I am done with my walk",
                                               "es": "Si, he terminado con mi caminata"
                                           }
                                       },
                                       {
                                           "key": "no_continue",
                                           "val": {
                                               "en": "No, I want to continue my walk",
                                               "es": "No, quiero continuar mi caminata"
                                           }
                                       },
                                       {
                                           "key": "thank_you_participant",
                                           "val": {
                                               "en": "Thank you for sharing your neighborhood with us!",
                                               "es": "¡Gracias por compartir su comunidad con nosotros!"
                                           }
                                       },
                                       {
                                           "key": "finish_return",
                                           "val": {
                                               "en": "Finish and Return Device",
                                               "es": "Terminar y devolver el dispositivo"
                                           }
                                       },
                                       {
                                           "key": "question",
                                           "val": {
                                               "en": "Question",
                                               "es": "Pregunta"
                                           }
                                       },
                                       {
                                           "key": "audio_instructions",
                                           "val": {
                                               "en": "Audio Instructions",
                                               "es": "Audio Instructions"
                                           }
                                       },
                                       {
                                           "key": "audio_1",
                                           "val": {
                                               "en": "The purpose of this tool.",
                                               "es": "The purpose of this tool."
                                           }
                                       },
                                       {
                                           "key": "audio_2",
                                           "val": {
                                               "en": "How to use it.",
                                               "es": "How to use it."
                                           }
                                       },
                                       {
                                           "key": "audio_3",
                                           "val": {
                                               "en": "What to look out for.",
                                               "es": "What to look out for."
                                           }
                                       },
                                       {
                                           "key": "audio_4",
                                           "val": {
                                               "en": "Getting ready for review.",
                                               "es": "Getting ready for review."
                                           }
                                       },
                                       {
                                           "key": "audio_5",
                                           "val": {
                                               "en": "How to review pictures.",
                                               "es": "How to review pictures."
                                           }
                                       },
                                       {
                                           "key": "audio_6",
                                           "val": {
                                               "en": "How to review audio.",
                                               "es": "How to review audio."
                                           }
                                       },
                                       {
                                           "key": "audio_7",
                                           "val": {
                                               "en": "Getting ready for the survey.",
                                               "es": "Getting ready for the survey."
                                           }
                                       },
                                       {
                                           "key": "audio_8",
                                           "val": {
                                               "en": "How to move through the survey.",
                                               "es": "How to move through the survey."
                                           }
                                       },
                                       {
                                           "key": "audio_9",
                                           "val": {
                                               "en": "How to complete the survey questions.",
                                               "es": "How to complete the survey questions."
                                           }
                                       }
                                   ],
                                   "surveys": [
                                       {
                                           "name": "gender",
                                           "type": "radio",
                                           "label": {
                                               "en": "What is your sex?",
                                               "es": "¿Es usted hombre o mujer?"
                                           },
                                           "options": [
                                               {
                                                   "value": "m",
                                                   "en": "Male",
                                                   "es": "Hombre"
                                               },
                                               {
                                                   "value": "f",
                                                   "en": "Female",
                                                   "es": "Mujer"
                                               }
                                           ]
                                       },
                                       {
                                           "name": "age",
                                           "type": "number",
                                           "label": {
                                               "en": "What is your age?",
                                               "es": "¿Qué edad tiene?"
                                           }
                                       },
                                       {
                                           "name": "education",
                                           "type": "radio",
                                           "label": {
                                               "en": "What is your highest level of school completed?",
                                               "es": "¿Cuál es su nivel más alto de educación completada?"
                                           },
                                           "options": [
                                               {
                                                   "value": 1,
                                                   "en": "Elementary school",
                                                   "es": "Escuela elemental"
                                               },
                                               {
                                                   "value": 2,
                                                   "en": "Junior high/middle school",
                                                   "es": "Escuela secundaria"
                                               },
                                               {
                                                   "value": 3,
                                                   "en": "Some high school",
                                                   "es": "Algo de preparatoria"
                                               },
                                               {
                                                   "value": 4,
                                                   "en": "Completed high school",
                                                   "es": "Preparatoria completada"
                                               },
                                               {
                                                   "value": 5,
                                                   "en": "Some college or vocational training",
                                                   "es": "Algo de universidad o entrenamiento vocacional"
                                               },
                                               {
                                                   "value": 6,
                                                   "en": "Completed college or university",
                                                   "es": "Universidad completada"
                                               },
                                               {
                                                   "value": 7,
                                                   "en": "Completed graduate degree",
                                                   "es": "Escuela graduada completada"
                                               }
                                           ]
                                       },
                                       {
                                           "name": "compare_health",
                                           "type": "radio",
                                           "label": {
                                               "en": "Compared to others of your own age, how would you rate your health?",
                                               "es": "¿Comparado con otros de su edad, cómo clasificaría su salud?"
                                           },
                                           "options": [
                                               {
                                                   "value": 1,
                                                   "en": "Excellent",
                                                   "es": "Excelente"
                                               },
                                               {
                                                   "value": 2,
                                                   "en": "Very Good",
                                                   "es": "Muy Buena"
                                               },
                                               {
                                                   "value": 3,
                                                   "en": "Good",
                                                   "es": "Buena"
                                               },
                                               {
                                                   "value": 4,
                                                   "en": "Fair",
                                                   "es": "Regular"
                                               },
                                               {
                                                   "value": 5,
                                                   "en": "Poor",
                                                   "es": "Mala"
                                               }
                                           ]
                                       },
                                       {
                                           "name": "close_knit",
                                           "type": "radio",
                                           "label": {
                                               "en": "This is a close-knit community.",
                                               "es": "Esto es una comunidad unida"
                                           },
                                           "options": [
                                               {
                                                   "value": 1,
                                                   "en": "Strongly Disagree",
                                                   "es": "Muy en desacuerdo"
                                               },
                                               {
                                                   "value": 2,
                                                   "en": "Somewhat Disagree",
                                                   "es": "Algo en desacuerdo"
                                               },
                                               {
                                                   "value": 3,
                                                   "en": "Neutral",
                                                   "es": "Neutral"
                                               },
                                               {
                                                   "value": 4,
                                                   "en": "Somewhat agree",
                                                   "es": "Algo de acuerdo"
                                               },
                                               {
                                                   "value": 5,
                                                   "en": "Strongly agree",
                                                   "es": "Muy de acuerdo"
                                               }
                                           ]
                                       },
                                       {
                                           "name": "influence",
                                           "type": "radio",
                                           "label": {
                                               "en": "I can influence decisions that affect my community.",
                                               "es": "Puedo influir decisiones que afectan mi comunidad."
                                           },
                                           "options": [
                                               {
                                                   "value": 1,
                                                   "en": "Strongly Disagree",
                                                   "es": "Muy en desacuerdo"
                                               },
                                               {
                                                   "value": 2,
                                                   "en": "Somewhat Disagree",
                                                   "es": "Algo en desacuerdo"
                                               },
                                               {
                                                   "value": 3,
                                                   "en": "Neutral",
                                                   "es": "Neutral"
                                               },
                                               {
                                                   "value": 4,
                                                   "en": "Somewhat agree",
                                                   "es": "Algo de acuerdo"
                                               },
                                               {
                                                   "value": 5,
                                                   "en": "Strongly agree",
                                                   "es": "Muy de acuerdo"
                                               }
                                           ]
                                       },
                                       {
                                           "name": "community",
                                           "type": "radio",
                                           "label": {
                                               "en": "By working together with others in my community, I can influence decisions that affect my community.",
                                               "es": "Trabajando junto con otros en mi comunidad, podemos influir decisiones que afectan esta comunidad."
                                           },
                                           "options": [
                                               {
                                                   "value": 1,
                                                   "en": "Strongly Disagree",
                                                   "es": "Muy en desacuerdo"
                                               },
                                               {
                                                   "value": 2,
                                                   "en": "Somewhat Disagree",
                                                   "es": "Algo en desacuerdo "
                                               },
                                               {
                                                   "value": 3,
                                                   "en": "Neutral",
                                                   "es": "Neutral"
                                               },
                                               {
                                                   "value": 4,
                                                   "en": "Somewhat agree",
                                                   "es": "Algo de acuerdo"
                                               },
                                               {
                                                   "value": 5,
                                                   "en": "Strongly agree",
                                                   "es": "Muy de acuerdo"
                                               }
                                           ]
                                       },
                                       {
                                           "name": "connections",
                                           "type": "radio",
                                           "label": {
                                               "en": "People in my community have connections to people who can influence what happens in my community.",
                                               "es": "Personas en mi comunidad saben con quién hablar para lograr hacer cambios en nuestra comunidad."
                                           },
                                           "options": [
                                               {
                                                   "value": 1,
                                                   "en": "Strongly Disagree",
                                                   "es": "Muy en desacuerdo"
                                               },
                                               {
                                                   "value": 2,
                                                   "en": "Somewhat Disagree",
                                                   "es": "Algo en desacuerdo "
                                               },
                                               {
                                                   "value": 3,
                                                   "en": "Neutral",
                                                   "es": "Neutral"
                                               },
                                               {
                                                   "value": 4,
                                                   "en": "Somewhat agree",
                                                   "es": "Algo de acuerdo"
                                               },
                                               {
                                                   "value": 5,
                                                   "en": "Strongly agree",
                                                   "es": "Muy de acuerdo"
                                               }
                                           ]
                                       }
                                   ],
                                   "consent": [
                                       {
                                           "title": {
                                               "en": "DESCRIPTION",
                                               "es": "DESCRIPCIÓN"
                                           },
                                           "text": {
                                               "en": "You are invited to participate in Our Voice as part of a project to understand what happens when community members gather information about their neighborhoods and use that information to advocate for positive changes.",
                                               "es": "Usted ha sido invitado a participar en Nuestra Voz como parte de un proyecto para entender qué pasa cuando los miembros de la comunidad recolectan información sobre sus vecindarios y utilizan esa información para abogar por cambios positivos."
                                           },
                                           "button": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "title": {
                                               "en": "",
                                               "es": ""
                                           },
                                           "text": {
                                               "en": "You will be asked to use the Discovery Tool during a short walk in your neighborhood, to take pictures, and to record explanations of the things you see that affect healthy living.  The Discovery Tool will make a map of your walk.",
                                               "es": "Le van a pedir que utilize la Herramienta de Descubrimiento durante una caminata corta en su vecindario para tomar fotos y grabar explicaciones sobre las cosas que afectan su habilidad de vivir saludablemente. La Herramienta de Descubrimiento creará un mapa de su caminata."
                                           },
                                           "button": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "title": {
                                               "en": "",
                                               "es": ""
                                           },
                                           "text": {
                                               "en": "When you are done, you will answer a short survey and then return the Discovery Tool tablet to project staff.  After your walk you may be invited to participate in one or more community meetings to talk about ways to make your neighborhood more healthy.",
                                               "es": "Cuando ha terminado contestará una encuesta corta y entonces devolverá la Herramienta de Descubrimiento a los investigadores. Después de su caminata puede ser invitado(a) a particpar en una o más reuniones de comunidad para hablar sobre estrategias para mejorar la salud de su comunidad."
                                           },
                                           "button": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "title": {
                                               "en": "TIME INVOLVEMENT",
                                               "es": "TIEMPO REQUERIDO"
                                           },
                                           "text": {
                                               "en": "The walk will take approximately 30 minutes and the community meetings will take approximately 2-4 hours.",
                                               "es": "La caminata tomará aproximadamente 30 minutos y las reuniones de comunidad tomarán aproximadamente 2-4 horas."
                                           },
                                           "button": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "title": {
                                               "en": "RISKS AND BENEFITS",
                                               "es": "RIESGOS Y BENEFICIOS"
                                           },
                                           "text": {
                                               "en": "Your neighborhood walk should be like a walk that you would normally take. We cannot guarantee you will receive any benefits.",
                                               "es": "Su caminata en la comunidad debería ser como cualquier caminata que tomaría normalmente. No podemos garantizar que usted pueda recibir beneficios."
                                           },
                                           "button": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "title": {
                                               "en": "PARTICIPANT'S RIGHTS",
                                               "es": "DERECHOS DEL PARTICIPANTE"
                                           },
                                           "text": {
                                               "en": "The results of this project may be published or presented but your identity will not be shared. Your participation in this project is 100% voluntary and you can stop at any time.",
                                               "es": "Los resultados de este proyecto podrán ser publicados o presentados pero su identidad no será compartida. Su participación en este proyecto es 100% voluntaria y usted puede parar en cualquier momento. "
                                           },
                                           "button": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "title": {
                                               "en": "Questions",
                                               "es": "PREGUNTAS"
                                           },
                                           "text": {
                                               "en": "If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact Ann Banchoff (banchoff@stanford.edu).",
                                               "es": "Si tiene preguntas, preocupaciones o quejas sobre esta investigación, los procedimientos, riesgos y beneficios, favor contactar a Ann Banchoff (banchoff@stanford.edu)."
                                           },
                                           "button": {
                                               "en": "Next",
                                               "es": "Próximo"
                                           }
                                       },
                                       {
                                           "title": {
                                               "en": "Independent Contact",
                                               "es": "CONTACTO INDEPENDIENTE"
                                           },
                                           "text": {
                                               "en": "If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906.  You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306.",
                                               "es": "Si no esta satisfecho(a) con la manera en que este proyecto se esta conduciendo, o si tiene algunas preocupaciones, quejas, o preguntas generales sobre la investigación o sobre sus derechos como participante favor contactar el Institutional Review Board (IRB) para hablar con alguien independiente del equipo de investigación a (650) 723-2480 o gratis a 1-866-680-2906. También puede escribirle al IRB de Stanford, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306."
                                           },
                                           "button": {
                                               "en": "I Understand",
                                               "es": "Entiendo"
                                           }
                                       }
                                   ]
                                }
                              ]
    }
};
