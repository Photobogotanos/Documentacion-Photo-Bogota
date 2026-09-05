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

    var data = {"OkPercent": 60.46430441612847, "KoPercent": 39.53569558387153};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.005629254669226741, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0186, 500, 1500, "GUARDAR SPOT - fase 3 "], "isController": false}, {"data": [0.0, 500, 1500, "POST LOGIN - fase 1"], "isController": false}, {"data": [0.003, 500, 1500, "GUARDAR SPOT- fase 2"], "isController": false}, {"data": [0.001, 500, 1500, "POST LOGIN - fase 2"], "isController": false}, {"data": [0.0012127512127512127, 500, 1500, "POST LOGIN - estres"], "isController": false}, {"data": [0.0046, 500, 1500, "POST LOGIN - fase 3 "], "isController": false}, {"data": [4.045307443365696E-4, 500, 1500, "GUARDAR SPOT - estres"], "isController": false}, {"data": [0.0, 500, 1500, "GUARDAR SPOT - fase 1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11458, 4530, 39.53569558387153, 23246.543724908366, 0, 125120, 9057.5, 77930.80000000003, 99683.05, 119338.41, 31.66505458062733, 55.34645096379715, 16.921227826620147], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GUARDAR SPOT - fase 3 ", 2500, 466, 18.64, 14304.743599999996, 0, 124812, 8565.0, 29684.200000000008, 75819.74999999999, 118262.0399999998, 6.936505998690388, 9.918057428893878, 7.0974898388857754], "isController": false}, {"data": ["POST LOGIN - fase 1", 50, 7, 14.0, 24609.68, 1, 117685, 14496.5, 76047.29999999996, 99195.19999999995, 117685.0, 0.16819556434657706, 0.2672174177860081, 0.06737020768788285], "isController": false}, {"data": ["GUARDAR SPOT- fase 2", 500, 101, 20.2, 14505.298000000004, 0, 123898, 8752.0, 34801.00000000001, 41670.0, 120379.67000000006, 1.3970304720286557, 2.101881459519645, 1.3772510308338597], "isController": false}, {"data": ["POST LOGIN - fase 2", 500, 72, 14.4, 17093.76200000001, 0, 124247, 8522.0, 47741.80000000005, 81201.94999999994, 113596.56000000003, 1.3876169067243915, 2.186220248626259, 0.6002987929467433], "isController": false}, {"data": ["POST LOGIN - estres", 2886, 1566, 54.26195426195426, 31852.99064449063, 0, 125120, 28812.5, 85679.7, 103355.80000000006, 117795.26, 12.226948431595181, 26.173762457051044, 2.171543747563931], "isController": false}, {"data": ["POST LOGIN - fase 3 ", 2500, 368, 14.72, 16525.354799999986, 0, 124255, 8277.0, 48893.30000000001, 54220.84999999997, 109367.84999999999, 6.914099231152166, 11.03701171334836, 3.031513816098789], "isController": false}, {"data": ["GUARDAR SPOT - estres", 2472, 1936, 78.31715210355988, 32046.72451456313, 0, 124961, 12500.5, 99793.90000000001, 113098.0, 122465.83999999998, 11.708647916410106, 21.717907049581765, 5.590282136023038], "isController": false}, {"data": ["GUARDAR SPOT - fase 1", 50, 14, 28.0, 22128.08, 3, 120542, 11989.0, 40686.7, 100266.25, 120542.0, 0.1652286268509737, 0.26150334608622955, 0.15439195245711493], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 2, 0.04415011037527594, 0.017455053237912375], "isController": false}, {"data": ["502/Bad Gateway", 17, 0.37527593818984545, 0.14836795252225518], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 2476, 54.65783664459161, 21.60935590853552], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 1310, 28.91832229580574, 11.433059870832606], "isController": false}, {"data": ["403/Forbidden", 724, 15.98233995584989, 6.31872927212428], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connection timed out: connect", 1, 0.02207505518763797, 0.008727526618956188], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11458, 4530, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 2476, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 1310, "403/Forbidden", 724, "502/Bad Gateway", 17, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GUARDAR SPOT - fase 3 ", 2500, 466, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 230, "403/Forbidden", 138, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 97, "502/Bad Gateway", 1, "", ""], "isController": false}, {"data": ["POST LOGIN - fase 1", 50, 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["GUARDAR SPOT- fase 2", 500, 101, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 54, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 29, "403/Forbidden", 18, "", "", "", ""], "isController": false}, {"data": ["POST LOGIN - fase 2", 500, 72, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 51, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 21, "", "", "", "", "", ""], "isController": false}, {"data": ["POST LOGIN - estres", 2886, 1566, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 931, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 624, "502/Bad Gateway", 10, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to photoapi.duckdns.org:443 [photoapi.duckdns.org/44.218.157.123] failed: Connection timed out: connect", 1, "", ""], "isController": false}, {"data": ["POST LOGIN - fase 3 ", 2500, 368, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 214, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 153, "502/Bad Gateway", 1, "", "", "", ""], "isController": false}, {"data": ["GUARDAR SPOT - estres", 2472, 1936, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 989, "403/Forbidden", 564, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 376, "502/Bad Gateway", 5, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 2], "isController": false}, {"data": ["GUARDAR SPOT - fase 1", 50, 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se ha anulado una conexi&oacute;n establecida por el software en su equipo host.", 7, "403/Forbidden", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 3, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
