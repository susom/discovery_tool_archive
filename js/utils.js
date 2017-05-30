var utils = {
    checkConnection : function() {
        var networkType = navigator.hasOwnProperty("connection") ? navigator.connection.type : false;
        var online      = navigator.onLine; 
        return online;
        // return {
        //      "online"   : online
        //     ,"type"     : networkType 
        // };
    }

    ,calculateDistance : function (lat1, lon1, lat2, lon2) {
      var miles = true;
      var R = 6371; // km
      var dLat = (lat2 - lat1).toRad();
      var dLon = (lon2 - lon1).toRad(); 
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      var d = R * c;

      if(miles) d /= 1.60934;
      return d;
    }

    ,readableTime: function(ts){
      var d = new Date(ts);
      // Date.toDateString()
      // Date.toLocaleDateString()
      // Date.toLocaleTimeString()
      // Date.toString()
      // Date.toTimeString()
      // Date.toUTCString()
      return d.toLocaleTimeString();
    }

    ,dump : function (obj) {
        var out = [];
        for (var i in obj) {
            out.push(i);
            // out.push(i + " : " + obj[i]);
        }
        app.log("["+ out.join(" , ") + "]");
        return;
    }
};

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}

