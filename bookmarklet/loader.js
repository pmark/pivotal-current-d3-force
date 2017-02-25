(function () {
  "use strict";

  var bookmarkletSource = "bookmarklet.js"
    ;

  jQuery.get(bookmarkletSource, function (data) {
    $('a.js-bookmarklet-link').attr(
        'href'
      , 'javascript:' + encodeURI(data.replace(/HOST/, window.location.host))
    );
  }, "text");
}());