var monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
var weekdays   = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
var today  = new Date()
var months = []

function generateCalendar (eventData) {
  var eventData = eventData.sort(function(a, b) { return (new Date(a.fecha)) - (new Date(b.fecha)) })
  generateAllTheMonths(eventData)
  eventData.forEach(function (event) {
    appendEvent(event)
  })

  // Highlight today
  $('#' + formattedDate(today))/*.removeClass('no-event')*/.addClass('today')
  // addMonthMenu()
  var _click = function (elem) {
    $('[data-month]').hide()
    $('[data-month="' + elem.data('month') + '"]').show()
    elem.addClass('active').siblings().removeClass('active')
  }
  var _month = (new Date()).getFullYear() + "-" + monthNames[(new Date()).getMonth()];
  var currentMonth = $('[data-month=' + _month + ']')
  if( currentMonth.length ) {
    _click(currentMonth)
  } else {
    _click($('[data-month]').first())
  }
}

function addMonthMenu() {
  $('#calendar-goes-here').prepend('<div id="cal-controls">')
  $('.month-table').each(function(_, table) {
    var month = $(table).data('month')
    $('#cal-controls').append('<a class="month-menuitem" data-target="' + month + '" href="#' + month + '">' + month + '</a>')
  })

  $(document).on('click', '.month-menuitem', function(e) {
    $('[data-month]').hide()
    $('[data-month="' + $(this).data('target') + '"]').show()
    $(this).addClass('active').siblings().removeClass('active')
    e.preventDefault()
  })

  // Get current month and click it
  var currentMonth = $('[data-target=' + (new Date()).getFullYear() + "-"  + monthNames[(new Date()).getMonth()] + ']')
  if( currentMonth.length ) {
    currentMonth.click()
  } else {
    $('[data-target]').first().click()
  }
}

function appendEvent( event ) {
  var eventStartDate = new Date(event.fecha)
  var eventEndDate   = new Date(event.fechafin)
  var eventElement;
  if (event.enlace) {
    eventElement   = $('<div class="event"><a title="Click aquí para más información" target="_blank" href="' + event.enlace + '">' + event.texto + '</a></div>')
  } else {
    eventElement   = $('<div class="event"><span>' + event.texto + '</span></div>')
  }

  // Handle multi-days
  if ( eventEndDate.getDate() ) {
    var date         = eventStartDate
    var spacerNumber = $('#' + formattedDate(eventStartDate)).find('.event').length
    eventElement.addClass('multi-days')

    while ( eventEndDate > date ) {
      // If reached end of month, go to first day of the next month
      // Else go to the next day
      if (date == new Date(date.getFullYear(), date.getMonth() + 1, 0)) {
        date == new Date(date.getFullYear(), date.getMonth() + 1, 1)
      } else {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 )
      }

      // Add spacer to line up the event
      var dateElement = $('#' + formattedDate(date))
      var steps = dateElement.find('.event').length
      loopForTimes( spacerNumber - steps, function() {
        dateElement.append('<div class="event spacer">&nbsp;</div>')
      })

      dateElement.removeClass('no-event').append('<div class="event multi-days following-days" title="' + event.texto + '"><a target="_blank" href="' + event.enlace + '">' + event.texto + '</a></div>')
    }
  }

  $('#' + formattedDate(eventStartDate)).removeClass('no-event').append(eventElement)
}

function generateAllTheMonths( eventData ) {
  var dates = []
  var months = []

  eventData.forEach(function(event) {
    if (event.fecha) dates.push(new Date(event.fecha))
    if (event.fechafin) dates.push(new Date(event.fechafin))
  })

  generateTableHeading(dates);

  dates.forEach(function (date) {
    if(months.indexOf(date.getFullYear().toString() + date.getMonth()) < 0) {
      months.push(date.getFullYear().toString() + date.getMonth())
      generateMonthTable(date)
    } else {
    }
  })
}

function generateTableHeading(dates) {
  var months = [];
  var numbers = {};
  var tableHeading = $('<div id="table-heading"></div>');
  var nav = $('<nav></nav>');
  var prev = $('<button class="change-month" id="previous-month" title="Mes anterior">&lsaquo;</button>');
  var next = $('<button class="change-month" id="next-month" title="Mes siguiente" disabled>&rsaquo;</button>');

  $('#calendar-goes-here').append(tableHeading);
  
  dates.forEach(function (date, i) {
    var eventMonthName = monthNames[date.getMonth()]
    var attr = date.getFullYear() + '-' + eventMonthName;
    if(months.indexOf(attr) < 0) {
      months.push(attr)
      tableHeading.append('<h2 data-month="' + attr + '">' + eventMonthName + ' ' + date.getFullYear() + '</h2>');
    }
    if (numbers[attr]) {
      numbers[attr]++;
    } else {
      numbers[attr] = 1;
    }
  });

  months.forEach(function (month, i) {
    if (i == months.length - 1) {
      prev.data("target", months.length - 2);
      next.data("target", months.length - 2);
    }
    // Update the number of events
    var number = numbers[month]
    $('h2[data-month=' + month + ']')
      .append($('<span>|</span>'))
      .append($('<span>' + number + '</span>'))
  });

  var handleNewTarget = function (target) {
    var prevBtn = $('#previous-month');
    var nextBtn = $('#next-month');
    var prevTarget = target - 1;
    var nextTarget = target + 1;

    if (prevTarget < 0) {
      prevBtn.attr('disabled', 'true');
    } else {
      prevBtn
        .data('target', prevTarget)
        .removeAttr('disabled');
    }

    if (nextTarget >= months.length) {
      nextBtn.attr('disabled', 'true');
    } else {
      nextBtn
        .data('target', nextTarget)
        .removeAttr('disabled');
    }
  }

  $(document).on('click', '.change-month', function(e) {
    var target = $(this).data('target');
    var attr = months[target];
    $('[data-month]').hide()
    $('[data-month="' + attr + '"]').show()
    handleNewTarget(target);
    e.preventDefault();
  })

  nav.append(prev).append(next);
  tableHeading.append(nav);
}

function generateMonthTable( date ) {
  var eventMonthName = monthNames[date.getMonth()]
  var monthTable     = $('<table cellspacing=0 class="month-table" data-month="' + date.getFullYear() + "-"  + eventMonthName + '" id="month-' + date.getMonth() + '"></table>')
  var monthTableBody = monthTable.append('<tbody>')
  // var today          = new Date()
  var endOfToday     = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 00, 00, 00)
  var firstDay       = new Date(date.getFullYear(), date.getMonth(), 1)
  var numberOfDays   = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  var weekDayNumber  = firstDay.getDay()

  $('#calendar-goes-here').append(monthTable)

  // Add month calendar header
  monthTableBody.append('<tr class="header"></tr>')
  var headerRow = monthTableBody.find('.header')
  loopForTimes( 7, function(i) {
    headerRow.append('<td>' + weekdays[i] + '</td>')
  })

  // Add empty days from previous month
  var times = weekDayNumber == 0 ? 6 : weekDayNumber - 1
  loopForTimes( times, function() {
    getFirstAvailableRow(monthTable).append('<td class="empty"></td>')
  })

  // Filling the month with days
  loopForTimes( numberOfDays, function(daynumber) {
    var thisDay = new Date(date.getFullYear(), date.getMonth(), (daynumber + 1))
    var id = formattedDate(thisDay)
    var pastClass = endOfToday > thisDay ? "past" : ""
    getFirstAvailableRow(monthTableBody).append('<td class="no-event ' + pastClass + '" id=' + id + '><div class=day><span>'+ (daynumber + 1) +'</span></div></td>')
  })

  // Add empty days from next month
  var lastRow = monthTable.find('tr:last')
  var cellsInLastRow = lastRow.find('td').length
  // Check if this is necessary
  if ( cellsInLastRow < 7 ) {
    loopForTimes( (7 - cellsInLastRow), function() {
      lastRow.append('<td class="empty"></td>')
    })
  }
}

// Because I don't like ot write for()
function loopForTimes( times, callback ) {
  for( var i=0; i < times; i++ ){
    callback(i)
  }
}

// This is handy: getting the first row with available cell space
function getFirstAvailableRow( table ) {
  var row = table.find('tr.days').filter(function(i, thisRow) {
    return ($(thisRow).find('td').length) < 7
  })
  // If no available row, create a new one
  if( row.length == 0 ) {
    table.append('<tr class=days>')
    var row = table.find('tr').last()
  }
  return row
}

// Create an unique date string for cell lookup
function formattedDate( date ) {
  return date.getFullYear() + '-' + monthNames[date.getMonth()] + '-' + date.getDate()
}
