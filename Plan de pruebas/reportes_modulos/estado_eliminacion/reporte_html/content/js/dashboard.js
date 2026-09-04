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

    var data = {"OkPercent": 82.52459016393442, "KoPercent": 17.475409836065573};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.15622950819672132, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.17, 500, 1500, "POST LOGIN - fase 1"], "isController": false}, {"data": [0.06, 500, 1500, "POST LOGIN - fase 2"], "isController": false}, {"data": [0.0894, 500, 1500, "POST LOGIN - fase 3 "], "isController": false}, {"data": [0.201, 500, 1500, "ESTADO SOLICITUD ELIMINACION - fase 2"], "isController": false}, {"data": [0.2282, 500, 1500, "ESTADO SOLICITUD ELIMINACION - fase 3"], "isController": false}, {"data": [0.4, 500, 1500, "ESTADO SOLICITUD ELIMINACION - fase 1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6100, 1066, 17.475409836065573, 4546.805573770509, 237, 16747, 2192.0, 15344.0, 15487.0, 15755.99, 33.48153027059663, 44.060335578585544, 14.183365622770186], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST LOGIN - fase 1", 50, 0, 0.0, 2232.38, 367, 8860, 2302.0, 3110.4, 5389.799999999981, 8860.0, 1.3374348000534975, 1.8572580914805403, 0.6698928798314833], "isController": false}, {"data": ["POST LOGIN - fase 2", 500, 83, 16.6, 5082.3499999999985, 388, 16747, 2582.5, 15403.8, 15532.95, 15898.5, 2.768074140097768, 4.6678163977943985, 1.2006305326881874], "isController": false}, {"data": ["POST LOGIN - fase 3 ", 2500, 450, 18.0, 5324.379200000017, 330, 16599, 2579.5, 15374.0, 15517.0, 15831.0, 13.73981192945431, 23.514400009892665, 5.852338713500189], "isController": false}, {"data": ["ESTADO SOLICITUD ELIMINACION - fase 2", 500, 83, 16.6, 3800.967999999996, 351, 15751, 1844.5, 15282.0, 15454.3, 15624.92, 2.776497503928744, 2.5563407741152693, 1.1716277181910564], "isController": false}, {"data": ["ESTADO SOLICITUD ELIMINACION - fase 3", 2500, 450, 18.0, 3921.3560000000098, 237, 16070, 1782.0, 15295.8, 15455.95, 15666.0, 13.801022379737892, 12.938560910467249, 5.751069320465261], "isController": false}, {"data": ["ESTADO SOLICITUD ELIMINACION - fase 1", 50, 0, 0.0, 1357.9599999999996, 297, 4625, 1101.0, 2426.7, 3310.299999999995, 4625.0, 1.305006003027614, 0.8385683105392285, 0.6401921050399332], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["403/Forbidden", 173, 16.22889305816135, 2.8360655737704916], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 893, 83.77110694183865, 14.639344262295081], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6100, 1066, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 893, "403/Forbidden", 173, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["POST LOGIN - fase 2", 500, 83, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 83, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST LOGIN - fase 3 ", 2500, 450, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 450, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["ESTADO SOLICITUD ELIMINACION - fase 2", 500, 83, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 57, "403/Forbidden", 26, "", "", "", "", "", ""], "isController": false}, {"data": ["ESTADO SOLICITUD ELIMINACION - fase 3", 2500, 450, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 303, "403/Forbidden", 147, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
