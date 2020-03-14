function DOMUtilsConstructor() {
    var public = this;

    public.removeAll = function (element) {
        while (element.firstChild)
            element.removeChild(element.firstChild);    
    }

    public.tableAddRow = function (table, columns, isHeader) {
        var row = document.createElement("tr");
        var columnTag = "td";
        if (isHeader) {
            columnTag = "th";
        }

        for (var i = 0; i < columns.length; i++) {
            var col = document.createElement(columnTag);
            col.innerHTML = columns[i];
            row.appendChild(col);
        }

        table.appendChild(row);
    }
}

var DOMUtils = new DOMUtilsConstructor();