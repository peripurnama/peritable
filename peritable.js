(function ($, window) {
  $.fn.peritable = function (options) {
    var $root = this,
      settings = $.extend({
        showData: 5,
        total: 0,
        page: 1,
        maxVisible: 4,
        leaps: true,
        href: 'javascript:void(0);',
        hrefVariable: '{{number}}',
        next: '&raquo;',
        prev: '&laquo;',
        firstLastUse: true,
        first: '<span aria-hidden="true">&larr;</span>',
        last: '<span aria-hidden="true">&rarr;</span>',
        wrapClass: 'pagination',
        activeClass: 'active',
        disabledClass: 'disabled',
        nextClass: 'next',
        prevClass: 'prev',
        lastClass: 'last',
        firstClass: 'first',
        tableY: false,
        tableX: false,
        tableHeight: 0,
        tableWidth: 0,
        tableHeight: 0
      },
        $root.data('settings') || {},
        options || {});

    $root.data('settings', settings);

    var totalRow = $root.find('tbody tr').length;
    var containerTop = "<div class='peritable-row-top'></div>";
    var selectShowTableRow = '<div class="col-sm-6"><span>Tampilkan: </span><select class="showTableRow" ><option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="75">75</option><option value="100">100</option></select> <span>Entri</span></div>';
    var peritablesearch = '<div class="col-sm-6"><input class="peritable-search" type="text" placeholder="Search"></div>';

    $('.peritable-responsive').before(containerTop);
    $('.peritable-row-top').append(selectShowTableRow);
    $('.peritable-row-top').append(peritablesearch);

    var total = Math.ceil(totalRow / settings.showData);
    settings.total = total;
    if (settings.total <= 0) {
      return settings.total = 0;
    }

    if (!$.isNumeric(settings.maxVisible) && !settings.maxVisible) {
      settings.maxVisible = parseInt(settings.total, 10);
    }

    $root.data('settings', settings);

    function renderPage($bootpag, page) {

      page = parseInt(page, 10);
      var lp,
        maxV = settings.maxVisible == 0 ? 1 : settings.maxVisible,
        step = settings.maxVisible == 1 ? 0 : 1,
        vis = Math.floor((page - 1) / maxV) * maxV,
        $page = $bootpag.find('li');
      settings.page = page = page < 0 ? 0 : page > settings.total ? settings.total : page;
      $page.removeClass(settings.activeClass);
      lp = page - 1 < 1 ? 1 : settings.leaps && page - 1 >= settings.maxVisible ? Math.floor((page - 1) / maxV) * maxV : page - 1;

      if (settings.firstLastUse) {
        $page
          .first()
          .toggleClass(settings.disabledClass, page === 1);
      }

      var lfirst = $page.first();
      if (settings.firstLastUse) {
        lfirst = lfirst.next();
      }

      lfirst.toggleClass(settings.disabledClass, page === 1).attr('data-lp', lp).find('a').attr('href', href(lp));

      var step = settings.maxVisible == 1 ? 0 : 1;

      lp = page + 1 > settings.total ? settings.total :
        settings.leaps && page + 1 < settings.total - settings.maxVisible ?
          vis + settings.maxVisible + step : page + 1;

      var llast = $page.last();
      if (settings.firstLastUse) {
        llast = llast.prev();
      }

      llast
        .toggleClass(settings.disabledClass, page === settings.total)
        .attr('data-lp', lp)
        .find('a').attr('href', href(lp));

      $page
        .last()
        .toggleClass(settings.disabledClass, page === settings.total);


      var $currPage = $page.filter('[data-lp=' + page + ']');

      var clist = "." + [settings.nextClass,
      settings.prevClass,
      settings.firstClass,
      settings.lastClass].join(",.");
      if (!$currPage.not(clist).length) {
        var d = page <= vis ? -settings.maxVisible : 0;
        $page.not(clist).each(function (index) {
          lp = index + 1 + vis + d;
          $(this)
            .attr('data-lp', lp)
            .toggle(lp <= settings.total)
            .find('a').html(lp).attr('href', href(lp));
        });
        $currPage = $page.filter('[data-lp=' + page + ']');
      }
      $currPage.not(clist).addClass(settings.activeClass);
      $root.data('settings', settings);
    }

    function href(c) {
      return settings.href.replace(settings.hrefVariable, c);
    }

    function comparer(index) {
      return function (a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index)
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
      }
    }
    function getCellValue(row, index) { return $(row).children('td').eq(index).text() }

    return this.each(function () {
      pagination();
      var trnum = 0;

      $(".peritable-search").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $root.find(' tbody>tr').filter(function () {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
      });

      $root.find(' tr:gt(0)').each(function () {
        trnum++;
        if (trnum <= settings.showData + 1) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });

      $(this).find(' thead tr').prepend('<th>ID</th>');
      $(this).find(' tfoot tr').prepend('<th>ID</th>');
      var id = 0;
      $(this).find(' tbody>tr').each(function () {
        id++;
        $(this).prepend('<td>' + id + '</td>')
      });


      var iconA = '<i class="fa fa-sort-amount-asc peritable-sort"></i>';
      var iconB = '<i class="fa fa-sort-amount-desc peritable-sort"></i>';

      $(this).find('thead>tr>th').append(iconA);

      $('.peritable-sort').click(function () {
        var table = $(this).parents('table').eq(0)
        var rows = $root.find('tbody>tr').toArray().sort(comparer($(this).index()))
        this.asc = !this.asc
        if (!this.asc) {
          rows = rows.reverse();
          $(this).removeClass(iconA);
          $(this).addClass(iconB);
        } else {
          $(this).removeClass(iconB);
          $(this).addClass(iconA);
        }
        for (var i = 0; i < rows.length; i++) { table.append(rows[i]) }

      })

      totalPage = Math.ceil(totalRow / settings.showData);
      settings.total = totalPage;

      if (settings.tableY) {
        $('.peritable-responsive').css({ 'overflowY': 'auto', 'height': settings.tableHeight + 'px' });
      }

      if (!settings.showData >= totalRow) {
        infoTable(0, settings.showData, totalRow);
      }

      var $periPag,
        lp,
        me = $(this),
        p = ['<div class="col-sm-6 text-center"><ul class="', settings.wrapClass, ' peritable ">'];

      if (settings.firstLastUse) {
        p = p.concat(['<li data-lp="1" class="', settings.firstClass, '"><a href="', href(1), '">', settings.first, '</a></li>']);
      }
      if (settings.prev) {
        p = p.concat(['<li data-lp="1" class="', settings.prevClass, '"><a href="', href(1), '">', settings.prev, '</a></li>']);
      }
      for (var c = 1; c <= Math.min(settings.total, settings.maxVisible); c++) {
        p = p.concat(['<li data-lp="', c, '"><a href="', href(c), '">', c, '</a></li>']);
      }

      if (settings.next) {
        lp = settings.leaps && settings.total > settings.maxVisible ? Math.min(settings.maxVisible + 1, settings.total) : 2;
        p = p.concat(['<li data-lp="', lp, '" class="', settings.nextClass, '"><a href="', href(lp), '">', settings.next, '</a></li>']);
      }
      if (settings.firstLastUse) {
        p = p.concat(['<li data-lp="', settings.total, '" class="last"><a href="', href(settings.total), '">', settings.last, '</a></li>']);
      }

      var containerPagin = "<div class='containerpagination'></div>";
      $('.peritable-responsive').after(containerPagin);

      if (settings.showData <= totalRow) {
        infoTable(0, settings.showData, totalRow);
      } else {
        infoTable(0, totalRow, totalRow);
      }

      p.push('</ul></div>');
      $('ul.peritable').remove();
      $('.containerpagination').append(p.join(''));
      $periPag = $('ul.peritable');

      $('ul.peritable li').click(function paginationClick() {

        var me = $(this);
        if (me.hasClass(settings.disableClass) || me.hasClass(settings.activeClass)) {
          return;
        }
        var page = parseInt(me.attr('data-lp'), 10);

        $('ul.peritable').each(function () {
          renderPage($(this), page);
        });

        $root.trigger('peritablePage', page);
        var trIndex = 0;
        var txt = "";
        var ii = 1;
        $root.find('tbody tr').each(function () {
          trIndex++;
          if (trIndex > (settings.showData * page) || trIndex <= ((settings.showData * page) - settings.showData)) {
            $(this).hide();
          } else {
            txt += "-" + $(this).find('td').text();
            $root.trigger('peritableDataShow', txt);
            $(this).show();
            $('p#messagetable').text("Showing " + ((trIndex + 1) - ii) + " to " + (trIndex) + " of " + totalRow + " entries.");
            ii++;
          }
        });

        var txt2 = "";
        $root.find('tbody tr').each(function () {
          txt2 += "-" + $(this).find('td').text();
          $root.trigger('peritableDataAll', txt2);
          // buttonHelper($('.peritable-row-top'), txt2);
        });

      });
      // buttonHelper();
      renderPage($periPag, settings.page);
    });

    function infoTable(start, end, max) {
      $('p#messagetable').remove();
      start = (start == null || start == 0 || start == undefined) ? 1 : start;
      var message = "<div class='col-sm-6'><p id='messagetable'>Showing " + start + " to " + end + " of " + max + " entries.</p></div>";
      $('.containerpagination').append(message);
    }

    function pagination() {
      $('.showTableRow').on('change', function () {
        var showData = $(this).val();
        var trnum = 0;
        settings.showData = showData;
        settings.total = Math.ceil(totalRow / settings.showData);
        if ($root != null && $root != undefined) {
          $root.find(' tr:gt(0)').each(function () {

            if (trnum <= settings.showData) {
              $(this).show();
            } else {
              $(this).hide();
            }
            trnum++;
          });
        }

        if (totalRow < settings.showData) {
          $('p#messagetable').text("Showing " + 1 + " to " + totalRow + " of " + totalRow + " entries.");
        } else {
          $('p#messagetable').text("Showing " + 1 + " to " + (settings.showData) + " of " + totalRow + " entries.");
        }
        var $periPag,
          lp,
          me = $(this),
          p = ['<div class="col-sm-6 text-center"> <ul class="', settings.wrapClass, ' peritable">'];

        if (settings.firstLastUse) {
          p = p.concat(['<li data-lp="1" class="', settings.firstClass, '"><a href="', href(1), '">', settings.first, '</a></li>']);
        }
        if (settings.prev) {
          p = p.concat(['<li data-lp="1" class="', settings.prevClass, '"><a href="', href(1), '">', settings.prev, '</a></li>']);
        }
        for (var c = 1; c <= Math.min(settings.total, settings.maxVisible); c++) {
          p = p.concat(['<li data-lp="', c, '"><a href="', href(c), '">', c, '</a></li>']);
        }

        if (settings.next) {
          lp = settings.leaps && settings.total > settings.maxVisible ? Math.min(settings.maxVisible + 1, settings.total) : 2;
          p = p.concat(['<li data-lp="', lp, '" class="', settings.nextClass, '"><a href="', href(lp), '">', settings.next, '</a></li>']);
        }
        if (settings.firstLastUse) {
          p = p.concat(['<li data-lp="', settings.total, '" class="last"><a href="', href(settings.total), '">', settings.last, '</a></li>']);
        }
        p.push('</ul></div>');

        $('ul.peritable').remove();
        $('.containerpagination').append(p.join(''));
        $periPag = $('ul.peritable');

        $('ul.peritable li').click(function paginationClick() {

          var me = $(this);
          if (me.hasClass(settings.disableClass) || me.hasClass(settings.activeClass)) {
            return;
          }
          var page = parseInt(me.attr('data-lp'), 10);

          $('ul.peritable').each(function () {
            renderPage($(this), page);
          });
          $root.trigger('peri', page);

          var trIndex = 0;
          var ii = 1;
          $root.find('tbody tr').each(function () {
            trIndex++;
            if (trIndex > (settings.showData * page) || trIndex <= ((settings.showData * page) - settings.showData)) {
              $(this).hide();
            } else {
              $(this).show();
              $('p#messagetable').text("Showing " + ((trIndex + 1) - ii) + " to " + (trIndex) + " of " + totalRow + " entries.");
              ii++;
            }
          });
        });
        renderPage($periPag, settings.page);
      });
    }

    function buttonHelper() {
      $('.btn-copy').remove();
      var btnCopy = '<button class="btn btn-success btn-copy">Copy</button>';
      $('.peritable-row-top').append(btnCopy);
      $('.btn-copy').on('click', function () {
        var txt3 = "";
        $root.find('tbody tr').each(function () {
          txt3 += " " + $(this).find('td').text();
        });
        try {
          var $temp = $("<input>");
          $("body").append($temp);
          $temp.val(txt3).select();
          
          var successful = document.execCommand('copy');
          $temp.remove();
          var msg = successful ? 'successful' : 'unsuccessful';
          console.log('Copying text command was ' + msg);
        } catch (err) {
          console.log('Oops, unable to copy');
        }
      });
    }
  }
})(jQuery, window);