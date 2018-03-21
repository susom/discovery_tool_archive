//RENAME THIS FILE TO config.js

var config = {
    database : {
         "users_local"          : "disc_users"
        ,"users_remote"         : "http://cdbadm:PROD0U^3QmvmUg1^pETI@cci-hrp-cdb.stanford.edu/disc_users"

        ,"attachments_local"    : "disc_attachments"
        ,"attachments_remote"   : "https://disc_user_admin:I7W2ORaVzUi1@ourvoice-cdb.med.stanford.edu/disc_attachment"
// "https://cdbadm:PRODJ0RprYvOqRbxbcn4ZpLb@ourvoice-cdb.med.stanford.edu/disc_attachment"
// "https://cdbadm:DEVgfVTPjZVNotZwCB9DfcK@ourvoice-cdb-dev.med.stanford.edu/disc_attachment"
        ,"proj_local"           : "disc_projects"
        ,"proj_remote"          : "http://cdbadm:PROD0U^3QmvmUg1^pETI@cci-hrp-cdb.stanford.edu/disc_projects"
    
        ,"log_local"            : "disc_log"
        ,"log_remote"           : "http://cdbadm:PROD0U^3QmvmUg1^pETI@cci-hrp-cdb.stanford.edu/disc_log"
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
};





