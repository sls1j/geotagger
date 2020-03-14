var Geo = function (div) {
    var self = this;

    var private = self.private = {};
    private.currentPosition = {
        status: ko.observable("No status"),
        time: ko.observable("--"),
        latitude: ko.observable(0.0),
        longitude: ko.observable(0.0),
        altitude: ko.observable(0.0),
        accuracy: ko.observable(0.0)
    };
    
    private.div = div;
    private.geo_success = function (position) {
        var c = position.coords;
        var cp = private.currentPosition;
        cp.status("Last Update: " + position.timestamp.toString());
        cp.latitude(c.latitude);
        cp.longitude(c.longitude);
        cp.altitude(c.altitude);
        cp.accuracy(c.accuracy);
    }

    private.geo_error = function () {
        private.div.innerText = "No location";
    }
        
    private.watcher = navigator.geolocation.watchPosition(private.geo_success, private.geo_error, { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 });
    ko.applyBindings(private.currentPosition);
}
