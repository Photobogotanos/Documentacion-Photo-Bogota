/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 0.0, "KoPercent": 100.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "LISTAR SPOTS - fase estres"], "isController": false}, {"data": [0.0, 500, 1500, "LISTAR SPOTS - fase 2"], "isController": false}, {"data": [0.0, 500, 1500, "LISTAR SPOTS - fase 3"], "isController": false}, {"data": [0.0, 500, 1500, "LISTAR SPOTS - fase 1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7723, 7723, 100.0, 6929.450861064346, 4267, 26084, 5078.0, 11480.6, 14412.599999999999, 24590.0, 44.84875233012584, 136.7865532139767, 0.005228718909878572], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["LISTAR SPOTS - fase estres", 4673, 4673, 100.0, 7271.953777016912, 4267, 26084, 5082.0, 12368.0, 14417.800000000001, 24576.380000000005, 27.13704994192799, 83.00951382839722, 0.0026257168263646925], "isController": false}, {"data": ["LISTAR SPOTS - fase 2", 500, 500, 100.0, 6658.345999999999, 5000, 25238, 5077.0, 8099.0, 17488.249999999993, 24964.06, 3.833180006133088, 11.757276453733517, 0.0034363859820607176], "isController": false}, {"data": ["LISTAR SPOTS - fase 3", 2500, 2500, 100.0, 6304.364, 5000, 25991, 5002.0, 8097.0, 12104.9, 24601.989999999998, 15.641423494669404, 47.35706134018845, 0.0], "isController": false}, {"data": ["LISTAR SPOTS - fase 1", 50, 50, 100.0, 8884.519999999999, 5000, 24715, 5086.0, 22891.1, 23677.449999999997, 24715.0, 0.7403897411597464, 2.3359296333590005, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 4, 0.051793344555224656, 0.051793344555224656], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 2981, 38.59899002978117, 38.59899002978117], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 3616, 46.821183477923086, 46.821183477923086], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1122, 14.528033147740516, 14.528033147740516], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7723, 7723, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 3616, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 2981, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1122, "502/Bad Gateway", 4, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["LISTAR SPOTS - fase estres", 4673, 4673, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 2048, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 1693, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 930, "502/Bad Gateway", 2, "", ""], "isController": false}, {"data": ["LISTAR SPOTS - fase 2", 500, 500, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 232, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 229, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 37, "502/Bad Gateway", 2, "", ""], "isController": false}, {"data": ["LISTAR SPOTS - fase 3", 2500, 2500, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 1320, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 1037, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 143, "", "", "", ""], "isController": false}, {"data": ["LISTAR SPOTS - fase 1", 50, 50, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 22, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 16, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 12, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
