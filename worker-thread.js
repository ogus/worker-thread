window.Task = (function () {
  "use strict";

  function str(e) {
    if (typeof e === "object" && !Array.isArray(e)) {
      var f = [];
      var json = JSON.stringify(e, function (k, value) {
        return typeof value === "function" ? (f.push(value), "__@f__") : value;
      });
      return json.replace(/"__@fn__"/g, function () {
        return f.shift();
      });
    }
    return typeof e === "function" ? e.toString() : JSON.stringify(e);
  }

  function read(args) {
    var s = "";
    for (var i = 1; i < args.length; i++) {
      s += (i > 1 ? "," : "") + str(args[i]);
    }
    return s;
  }

  function worker(data) {
    var url = URL.createObjectURL(new Blob(data, { type:"text/javascript" }));
    var w = new Worker(url);
    URL.revokeObjectURL(url);
    return w;
  }

  return {
    run: function () {
      var f = arguments[0].toString();
      var args = read(arguments);
      var w = worker(["postMessage((",f,")(",args,"));"]);
      return {
        then: function (cb) {
          w.onmessage = function (m) {
            cb(m.data);
          };
        }
      };
    },

    await: function () {
      var f = arguments[0].toString();
      var args = read(arguments);
      var w = worker([
        "onmessage=function(m){",
        "postMessage((",f,")(m.data",(args.length ? "," : ""),args,"));}"
      ]);
      return {
        postMessage: function (m) {
          w.postMessage(m)
        },
        onmessage: function (cb) {
          w.onmessage = function (m) {
            cb(m.data);
          };
        }
      }
    },

    new: function () {
      var f = arguments[0].toString();
      var args = read(arguments);
      return worker(["(",f,")(",args,")"]);
    }

  };
})();
