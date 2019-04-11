var WorkerThread = (function () {
  "use strict";

  function str(thing) {
    if (typeof thing === "object" && !Array.isArray(thing)) {
      var fn = [];
      var str = JSON.stringify(thing, function (key, value) {
        return typeof value === "function" ? (fn.push(value), "__@fn__") : value;
      });
      return str.replace(/"__@fn__"/g, function () {
        return fn.shift();
      });
    }
    return typeof thing === "function" ? thing.toString() : JSON.stringify(thing);
  }

  function read(args) {
    var s = "";
    for (var i = 1; i < args.length; i++) {
      s += (i > 1 ? "," : "") + str(args[i]);
    }
    return s;
  }

  function worker(data) {
    var url = URL.createObjectURL(new Blob(data, {type:"text/javascript"}));
    var w = new Worker(url);
    URL.revokeObjectURL(url);
    return w;
  }

  return {
    new: function () {
      var f = arguments[0].toString();
      var args = read(arguments);
      return worker(["(",f,")(",args,")"]);
    },

    await: function () {
      var f = arguments[0].toString();
      var args = read(arguments);
      return worker([
        "self.onmessage=function(e){",
        "var r=(",f,")(e",(args.length ? "," : ""),args,");",
        "postMessage(r);}"
      ]);
    },

    run: function () {
      var f = arguments[0].toString();
      var args = read(arguments);
      var w = worker([
        "var e=(",f,")(",args,");",
        "postMessage(e);"
      ]);
      return {
        then: function (f) {
          w.onmessage = f;
        }
      };
    }
  };
})();
