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
};
