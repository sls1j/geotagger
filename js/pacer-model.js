
/// <reference path="geo-utils.js"/>

function PacerModel() {
    var public = this;
    var private = public.private = {};
    var States = public.States = Object.freeze({
        Idle: "idle",
        Started: "started"
    });
    var LSKeys = Object.freeze({
        Runs: "runs"
    });

    private.state = States.Idle;
    private.date = null;
    private.startTime = null;
    private.distance = 0.0;
    private.pace = 0;
    private.lastPosition = null;
    private.points = [];

    var runs = localStorage.getItem(LSKeys.Runs);
    if (runs === null) {
        private.runs = [];
    }
    else {
        try {
            private.runs = JSON.parse(runs);
        }
        catch (err) {
            private.runs = [];
        }
    }


    private.watcher = navigator.geolocation.watchPosition(
        function (position) {
            if (private.state === States.Started) {
                console.log("watchPosition: ts = ", position.timestamp.toString());
                // calculate distance from last position     
                var p = position.coords;
                var point = {
                    timestamp: position.timestamp,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    altitude: p.altitude,
                    heading: p.heading,
                    speed: p.speed,
                    accuracy: p.accuracy,
                    altitudeAccuracy: p.altitudeAccuracy
                };
                private.points.push(point);
                // update the distance
                if (private.lastPosition !== null) {
                    var p = position.coords;
                    var lp = private.lastPosition.coords;
                    var deltaDistance = GeoUtils.distance(lp.latitude, lp.longitude, p.latitude, p.longitude);
                    var deltaMiles = deltaDistance / 1609.0;
                    var pace = null;
                    if (deltaMiles == 0)
                        private.pace = 0;
                    else
                        private.pace = (position.timestamp - private.lastPosition.timestamp) / 1000.0 / deltaMiles; // seconds per mile

                    private.distance += deltaMiles; // total distance in miles
                    private.elapsed = (position.timestamp - private.startTime) / 1000.0; // elapsed time in seconds                    
                }
            }

            private.lastPosition = position;
        },
        function (error) {
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 });
    
    private.doUpdateRun = function () {
        if (private.state === States.Started) {
            private.elapsed = ((+new Date()) - private.startTime) / 1000.0;
            if (null != public.onUpdateRun) {
                public.onUpdateRun({
                    elapsed: private.elapsed,
                    distance: private.distance,
                    pace: private.pace
                });
            }
        }    
    }

    // set the timer    
    setInterval(private.doUpdateRun, 80);

    private.apply = function () {
        localStorage.setItem(LSKeys.Runs, JSON.stringify(private.runs));
    }

    public.start = function () {
        if (private.state === States.Started)
            throw "cannot call start when already started.";

        // initialize the state of a run
        private.state = States.Started;
        private.date = new Date();
        private.startTime = + (private.date);
        console.log("startTime = " + private.startTime.toString());

        if (private.lastPosition !== null)
            private.points = [private.lastPosition];
        else
            private.points = [];

        private.totalDistance = 0.0;
    }

    public.split = function () {
        if (private.state !== States.Started)
            throw "cannot call split when not running.";
        var p = private.points;
        if (p.length > 0) {
            p[p.length - 1].isSplit = true;
            // make a beep or something
        }
    }

    public.stop = function () {
        if (private.state !== States.Started)
            throw "cannot call stop when not running.";

        private.state = States.Idle;
        var run = {
            date: FormatUtils.formatDate(private.date),
            startTime: private.startTime,
            endTime: + new Date(),
            distance: private.distance,
            points: private.points
        };

        run.elapsed = (run.endTime - run.startTime) / 1000;
        if (run.distance === 0)
            run.pace = 0;
        else
            run.pace = private.elapsed / run.distance;

        private.runs.push(run);
        private.apply();
    }

    public.clearLastRun = function () {
        private.runs.pop();
        private.apply();
    }

    public.clearAllRuns = function () {
        private.runs = [];
        private.apply();
    }

    /**
     * event that is fired when a run is updated: function(elapsed, distance, pace)
     * @param {seconds} elapsed - amount of time the run has lasted
     * @param {miles} distance - the number of miles run
     * @param {seconds_per_mile} pace - number of seconds it takes to cover a mile at the current pace
     */
    public.onUpdateRun = null; // 

    Object.defineProperty(public, "State", {
        get: function () { return private.state }
    });

    Object.defineProperty(public, "Runs", {
        get: function () { return private.runs }
    });    
}