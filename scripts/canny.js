///sourced by canny feedback system
function cannyInit(boardToken, basePath, ssoToken) {
  (function(w, d, i, s) {
    function l() {
      if (!d.getElementById(i)) {
        var f = d.getElementsByTagName(s)[0],
          e = d.createElement(s);
        (e.type = "text/javascript"),
          (e.async = !0),
          (e.src = "https://canny.io/sdk.js"),
          f.parentNode.insertBefore(e, f);
      }
    }
    if ("function" != typeof w.Canny) {
      var c = function() {
        c.q.push(arguments);
      };
      (c.q = []),
        (w.Canny = c),
        "complete" === d.readyState
          ? l()
          : w.attachEvent
          ? w.attachEvent("onload", l)
          : w.addEventListener("load", l, !1);
    }
  })(window, document, "canny-jssdk", "script");

  Canny("render", {
    boardToken: boardToken,
    basePath: basePath,
    ssoToken: ssoToken,
  });
  /*
  Canny("identify", {
    appID: "5f0905e0f546fd44d827e2f1",
    user: {
      companies: [
        { id: 1, name: "name 1" },
        { id: 2, name: "name 2" },
      ],
      email: "test@example.org",
      id: "999",
      name: "Name in JS",
    },
  });
  */
}
