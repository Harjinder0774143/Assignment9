$(document).ready(function() {
    generateTable()
});

function generateTable(type = null) {

    $.getJSON("assets/assignment9Data.json", function(resp) {
        let resDataJson = JSON.parse(JSON.stringify(resp));
        // Start Search
        searchInDataLines(type, resDataJson)
        // Show  Counts
        showCounts(resDataJson)
        addHeaderListerner()
    });
}

// To calculate Documents count based on alphabate
function showCounts(rows) {
    let a_m_count = getFilteredRow(1, rows)
    let n_z_count = getFilteredRow(2, rows)

    $('.filter-a-m-rows').html(a_m_count.length)
    $('.filter-n-z-rows').html(n_z_count.length)
}


//type --> 1 for a-m  type --> 2 for n-z 
function getFilteredRow(type, rows) {
    if (type == 1) {
        return rows.filter((item) => genCharArray('a', 'm').includes(item.name.charAt(0).toLowerCase()))
    } else if (type == 2) {
        return rows.filter((item) => genCharArray('n', 'z').includes(item.name.charAt(0).toLowerCase()))
    }
}

function genCharArray(charA, charZ) {
    let a = [];
    let i = charA.charCodeAt(0);
    let j = charZ.charCodeAt(0);
    for (i; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}

// Search in JSON documents
function searchInDataLines(type, allData) {
    let data = []
    if (type == 1) {
        data = getFilteredRow(1, allData)

    } else if (type == 2) {
        data = getFilteredRow(2, allData)
    } else {
        data = allData
    }
    document.querySelector('#table').innerHtml = '';
    generateTableHtml(data, $('#table'))
}

function addHeaderListerner() {
    let headers = $('.header')
    headers.each(function(i, obj) {
        $('#h' + i).click(function() {
            sortColumn(i)
        })
    })
}

// To generate Html data table
function generateTableHtml(data, container) {
    container.html('')
    let searchvalue = $('#search_input').val().toLowerCase();
    let headers = getHeaders(data)
    let rowData = JSON.parse(JSON.stringify(data))
    rowData.unshift(headers)
    let table = $("<table/>").addClass('CSSTableGenerator');
    table.attr('id', 'searchTable')
    let thead = $("<thead/>");
    let tbody = $("<tbody/>");
    $.each(rowData, function(rowIndex, r) {

        let row = $("<tr/>");
        $.each(r, function(colIndex, c) {
            let name = c.toLowerCase()
            if (searchvalue !== '' && colIndex == 'name' && name.includes(searchvalue)) {
                row.append($("<td />").addClass('highlight').text(c));
            } else {
                c = c.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1")
                let rowElement = "";
                if (rowIndex == 0) {
                    rowElement = $("<th />").addClass('header')
                    rowElement.attr('id', "h" + colIndex)
                    rowElement.attr('data-index', colIndex)
                    // rowElement.click(sortColumn(colIndex))
                } else {
                    rowElement = $("<td />")
                }

                row.append(rowElement.text(c));
            }

        });
        if (rowIndex == 0) {
            thead.append(row);
        } else {
            tbody.append(row);
        }
    });
    table.append(thead);
    table.append(tbody);
    return container.append(table);
}

// To get Name of columns
function getHeaders(list) {
    let columns = [];
    for (let i = 0; i < list.length; i++) {
        let row = list[i];
        for (let k in row) {
            if ($.inArray(k, columns) == -1) {
                columns.push(k)
            }
        }
    }
    return columns;
}

function sortColumn(index) {
    const table = document.getElementById('searchTable');
    const headers = table.querySelectorAll('th');
    const tableBody = table.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');

    $('th .icon').html('')
    const directions = Array.from(headers).map(function(header, indexCol) {

        if (index == indexCol) {
            if (!$(header).hasClass('asc') && !$(header).hasClass('desc')) {
                $(header).addClass('asc')
                if (index == indexCol) {
                    let icon = $('<span />').addClass('icon').html('&#x25B2;')
                    $(header).append(icon)
                }
                return 'asc';
            } else if ($(header).hasClass('asc')) {
                $(header).addClass('desc')
                $(header).removeClass('asc')
                if (index == indexCol) {
                    $(header).find('.icon').html('&#x25BC;')
                }
                return 'desc';
            } else if ($(header).hasClass('desc')) {
                $(header).removeClass('asc')
                $(header).removeClass('desc')
                return 'default';
            }
        } else {
            $(header).removeClass('asc')
            $(header).removeClass('desc')
            return ''
        }
    });
    // Get the current direction
    const direction = directions[index] || 'asc';

    if (direction == 'default') {
        generateTable()
        return ''
    }

    // A factor based on the direction
    const multiplier = direction === 'asc' ? 1 : -1;

    let newRows = Array.from(rows);
    // newRows.shift()
    newRows.sort(function(rowA, rowB) {
        const cellA = rowA.querySelectorAll('td')[index].innerHTML;
        const cellB = rowB.querySelectorAll('td')[index].innerHTML;

        const a = transform(index, cellA);
        const b = transform(index, cellB);

        switch (true) {
            case a > b:
                return 1 * multiplier;
            case a < b:
                return -1 * multiplier;
            case a === b:
                return 0;
        }
    });

    // Remove old rows
    [].forEach.call(rows, function(row) {
        tableBody.removeChild(row);
    });

    // Reverse the direction
    directions[index] = direction === 'asc' ? 'desc' : 'asc';

    // Append new row
    newRows.forEach(function(newRow) {
        tableBody.appendChild(newRow);
    });
};

function transform(index, content) {
    // Get the data type of column
    // const type = headers[index].getAttribute('data-type');
    const type = 'string';
    switch (type) {
        case 'number':
            return parseFloat(content);
        case 'string':
        default:
            return content;
    }
};