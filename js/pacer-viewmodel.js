function PacerViewModel(agent) {
    var public = this;
    var private = public.private = {};

    private.agent = agent;

    private.bindButton = function (id, handler) {
        var button = document.getElementById(id);
        if (null === button)
            console.error("Cannot bind button " + id + " because it can't be found.");
        else {
            button.addEventListener('click', handler);
            return button;
        }    
    }

    // setup button handlers    
    
    private.startHandler = function (evt) {
        private.agent.start();

        // update view state
        private.idleView.style.display = "none";
        private.startedView.style.display = "block";
    }

    private.stopHandler = function (evt) {
        private.agent.stop();

        // update view state
        private.idleView.style.display = "block";
        private.startedView.style.display = "none";
        private.updateList();
    }

    private.clearAllHandler = function (evt) {
        private.agent.clearAllRuns();
        private.updateList();
    }

    private.updateList = function(){
        DOMUtils.removeAll(private.runList);

        var runs = private.agent.Runs;

        DOMUtils.tableAddRow(private.runList, ["Date", "Distance (mi)", "Time", "Pace (min/mi)", "Actions"], true);

        for (var i = runs.length - 1; i >= 0; i--){
            var r = runs[i];
            DOMUtils.tableAddRow(private.runList, [
                r.date,
                r.distance.toFixed(3),
                FormatUtils.formatTime(r.elapsed),
                FormatUtils.formatTime(r.pace),                
                '<a id="view-link" idx="' +i.toString() +'" href="#">CP</a>'
                ], false);
        }

        // apply click to 
        var links = document.getElementsByTagName("a");
        for(var i=0; i < links.length; i++){
            var link = links[i];
            if (link.id === "view-link"){
                link.onclick = private.updateRunView;
            }
        }
    }

    private.updateRunView = function(evt){
        var link = evt.currentTarget;
        var i = parseInt( link.getAttribute("idx") );
        var run = private.agent.Runs[i];
        var runData = JSON.stringify(run, null, 4);
        var url = "https://swchost.ddns.net/post"
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
        xhr.send(runData);
    }

    private.splitHandler = function () {
        private.agent.split();
    }

    // setup agent event handlers
    private.updateRun = function (data) {
        // update run data display
        private.elapsed.innerText = FormatUtils.formatTime(data.elapsed, 2);
        private.distance.innerText = data.distance.toFixed(3) + "mi";
        private.pace.innerText = FormatUtils.formatTime(data.pace);
    }    

    // handle bindings
    private.idleView = document.getElementById("idle-view");
    private.startedView = document.getElementById("started-view");

    private.runList = document.getElementById("run-list");    
    private.startButton = private.bindButton("start-button", private.startHandler);
    private.clearAllButton = private.bindButton("clear-all-button", private.clearAllHandler);

    private.stopButton = private.bindButton("stop-button", private.stopHandler);
    private.splitButton = private.bindButton("split-button", private.splitHandler);

    private.elapsed = document.getElementById("elapsed");
    private.distance = document.getElementById("distance");
    private.pace = document.getElementById("pace");

    

    // setup agent events    
    private.agent.onUpdateRun = private.updateRun;

    // run last minute code
    private.updateList();
}