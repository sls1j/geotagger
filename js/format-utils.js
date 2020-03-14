function FormatUtilsConstructor() {
    var public = this;

    /** formats the time in seconds to the hh:mm:ss format
     * @param {number} time - time in seconds
     * @returns {string} - a time string formated as [hh:]mm:ss
     */
    public.formatTime = function (time, fixed) {
        function pad(n, width) {
            n = n + '';
            return n.length > width ? n : new Array(width - n.length + 1).join('0') + n;
        }

        if (fixed === null)
            fixed = 0;    

        var seconds = time % 60;
        var minutes = Math.floor((time / 60) % 60);
        var hours = Math.floor((time / 3600));

        if (hours > 0)
            return hours + ":" + pad(minutes, 2) + ":" + pad(seconds.toFixed(fixed), 2);
        else
            return minutes + ":" + pad(seconds.toFixed(fixed), 2);
    };

    public.formatDate = function (date) {        
        var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        return dateString;
    }
}

var FormatUtils = new FormatUtilsConstructor();
