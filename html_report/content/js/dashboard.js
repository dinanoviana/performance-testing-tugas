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

    var data = {"OkPercent": 42.3596067322113, "KoPercent": 57.6403932677887};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1957173804365939, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.33695652173913043, 500, 1500, "00_POST_Register_User"], "isController": false}, {"data": [0.6534782608695652, 500, 1500, "01_POST_Login"], "isController": false}, {"data": [0.0, 500, 1500, "05_DELETE_Contact"], "isController": false}, {"data": [0.0, 500, 1500, "03_POST_Add_Contact"], "isController": false}, {"data": [0.0, 500, 1500, "04_PUT_Update_Contact"], "isController": false}, {"data": [0.14143426294820718, 500, 1500, "02_GET_Contact_List"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6001, 3459, 57.6403932677887, 12299.94667555407, 234, 31043, 2027.0, 30248.0, 30257.0, 30311.0, 18.0219951829228, 25.359989194235723, 12.628160667280813], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["00_POST_Register_User", 1150, 3, 0.2608695652173913, 1566.5730434782604, 296, 10024, 980.5, 3061.8, 3868.2000000000035, 5036.150000000001, 4.2291539485587775, 5.354271945401622, 2.6472435110068324], "isController": false}, {"data": ["01_POST_Login", 1150, 5, 0.43478260869565216, 1000.2565217391314, 279, 4227, 402.0, 2522.5000000000023, 3247.1500000000005, 4093.96, 4.244873853422661, 5.35684624328664, 2.7250244541645903], "isController": false}, {"data": ["05_DELETE_Contact", 1150, 1150, 100.0, 30232.317391304325, 12749, 31043, 30242.0, 30254.0, 30263.0, 30311.49, 3.8290830511465606, 4.8301918724382595, 2.046198771447027], "isController": false}, {"data": ["03_POST_Add_Contact", 1150, 1150, 100.0, 658.2591304347828, 234, 4217, 307.0, 1689.2000000000053, 2069.0, 3298.0300000000034, 4.25207797201763, 9.068422867305587, 3.791845415705327], "isController": false}, {"data": ["04_PUT_Update_Contact", 1150, 1150, 100.0, 30228.4095652174, 3525, 30430, 30244.0, 30285.0, 30309.45, 30343.0, 3.8291212999034396, 4.831852930526421, 3.25777712224886], "isController": false}, {"data": ["02_GET_Contact_List", 251, 1, 0.398406374501992, 2284.0318725099587, 251, 4926, 1984.0, 3998.8, 4050.4, 4924.44, 3.845564577907155, 2.8006711304964, 1.9669048998391299], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1144, 33.07314252674183, 19.06348941843026], "isController": false}, {"data": ["503/Service Unavailable", 2306, 66.66666666666667, 38.42692884519247], "isController": false}, {"data": ["401/Unauthorized", 9, 0.26019080659150046, 0.14997500416597234], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6001, 3459, "503/Service Unavailable", 2306, "400/Bad Request", 1144, "401/Unauthorized", 9, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["00_POST_Register_User", 1150, 3, "503/Service Unavailable", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["01_POST_Login", 1150, 5, "401/Unauthorized", 3, "503/Service Unavailable", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["05_DELETE_Contact", 1150, 1150, "503/Service Unavailable", 1150, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["03_POST_Add_Contact", 1150, 1150, "400/Bad Request", 1144, "401/Unauthorized", 5, "503/Service Unavailable", 1, "", "", "", ""], "isController": false}, {"data": ["04_PUT_Update_Contact", 1150, 1150, "503/Service Unavailable", 1150, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["02_GET_Contact_List", 251, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
