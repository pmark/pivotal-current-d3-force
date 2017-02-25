(function () {
  "use strict";
  var js
    ;

  function getApp() {
    var url = "http://" + "HOST" + "/bookmarklet-extra.js"
      , js
      ;

    
    js = document.createElement('script')
    js.addEventListener('load', function () {
      console.log("loaded the real deal");
    });

    js.src = url;
    document.head.appendChild(js);
  }

  console.log('This bookmarklet begins!');
  // this site may or may not have the jQuery we want...
  // so we'll just get what we want and worry about the consequences
  // if the happen!
  // js = document.createElement('script');
  // js.addEventListener('load', getApp);
  // js.src = "//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js";
  // document.head.appendChild(js);

  getApp();
}());