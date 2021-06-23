//RENAME THIS FILE TO config.js

var config = {
    database : {
         "users_local"          : "disc_users"
        ,"users_remote"         : "https://cdbadm:PROD0U^3QmvmUg1^pETI@cci-hrp-cdb.stanford.edu/disc_users"

        ,"attachments_local"    : "disc_attachments"
        ,"attachments_remote"   : "https://disc_user_admin:I7W2ORaVzUi1@ourvoice-cdb.med.stanford.edu/disc_attachment"
        ,"proj_local"           : "disc_projects"
        ,"proj_remote"          : "https://cdbadm:PROD0U^3QmvmUg1^pETI@cci-hrp-cdb.stanford.edu/disc_projects"
    
        ,"log_local"            : "disc_log"
        ,"log_remote"           : "https://cdbadm:PROD0U^3QmvmUg1^pETI@cci-hrp-cdb.stanford.edu/disc_log"
    }

    ,default_user : {
         "_id"                  : null
        ,"project_id"           : null
        ,"user_id"              : null
        ,"lang"                 : null
        ,"photos"               : []
        ,"geotags"              : []
        ,"survey"               : []
        ,"_attachments"         : {}
    }
};





