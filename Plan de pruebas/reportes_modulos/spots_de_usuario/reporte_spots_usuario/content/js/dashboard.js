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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "SPOTS DE UN USUARIO - fase 3"], "isController": false}, {"data": [0.0, 500, 1500, "SPOTS DE UN USUARIO - fase 1"], "isController": false}, {"data": [0.0, 500, 1500, "SPOTS DE UN USUARIO - fase 2"], "isController": false}, {"data": [0.0, 500, 1500, "SPOTS DE UN USUARIO - fase estres"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 67867, 67867, 100.0, 2313.8830654073317, 210, 31468, 1457.0, 7753.9000000000015, 10005.0, 10016.0, 350.58890381237734, 92.47330520650377, 81.69904319273685], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["SPOTS DE UN USUARIO - fase 3", 2500, 2500, 100.0, 1849.573600000001, 216, 22372, 807.0, 4593.700000000001, 8090.449999999998, 10002.0, 23.309371299637306, 5.13828685153329, 5.5289191357118215], "isController": false}, {"data": ["SPOTS DE UN USUARIO - fase 1", 50, 50, 100.0, 357.42, 226, 1339, 309.5, 600.1999999999997, 765.4999999999991, 1339.0, 4.480688233712699, 0.6563508154852585, 1.095405754323864], "isController": false}, {"data": ["SPOTS DE UN USUARIO - fase 2", 500, 500, 100.0, 1389.7519999999993, 221, 15954, 450.0, 3461.300000000001, 7441.0, 10001.99, 6.06685676151186, 1.1579757363647394, 1.4563300066735423], "isController": false}, {"data": ["SPOTS DE UN USUARIO - fase estres", 64817, 64817, 100.0, 2340.429532375736, 210, 31468, 1457.0, 7753.9000000000015, 10005.0, 10016.0, 334.8348736174895, 89.09606389703944, 77.95298326200155], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 64699, 95.33204650271855, 95.33204650271855], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 125, 0.18418377119955207, 0.18418377119955207], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 2986, 4.399781926414899, 4.399781926414899], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 57, 0.08398779966699574, 0.08398779966699574], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 67867, 67867, "502/Bad Gateway", 64699, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 2986, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 125, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 57, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["SPOTS DE UN USUARIO - fase 3", 2500, 2500, "502/Bad Gateway", 2426, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 71, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 2, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", ""], "isController": false}, {"data": ["SPOTS DE UN USUARIO - fase 1", 50, 50, "502/Bad Gateway", 50, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["SPOTS DE UN USUARIO - fase 2", 500, 500, "502/Bad Gateway", 491, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 9, "", "", "", "", "", ""], "isController": false}, {"data": ["SPOTS DE UN USUARIO - fase estres", 64817, 64817, "502/Bad Gateway", 61732, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connect timed out", 2906, "Non HTTP response code: org.apache.http.conn.ConnectTimeoutException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Read timed out", 123, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 56, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
