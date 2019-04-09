(function (root, factory) {
  if (typeof define === 'function' && define.amd) { define([], factory); }
  else if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.InlineWorker = factory(); }
}(this, function () {
  "use strict";

  function parseArg(arg) {
    return (typeof arg === "function") ? arg.toString() : JSON.stringify(arg);
  }

  function loadArgs(args) {
    var result = "";
    for (var i = 1; i < args.length; i++) {
      result += (i > 1 ? "," : "") + parseArg(args[i]);
    }
    return result;
  }

  function createWorker(array) {
    var url = URL.createObjectURL(new Blob(array, {type:'text/javascript'}));
    var worker = new Worker(url);
    URL.revokeObjectURL(url);
    return worker;
  }

  function callback(worker) {
    return {
      then: function (f) {
        worker.onmessage = f;
      }
    };
  }

  return {
    new: function () {
      var f = arguments[0];
      var args = loadArgs(arguments);
      return createWorker(["(",f.toString(),")(",args,")"]);
    },

    run: function () {
      var f = arguments[0];
      var args = loadArgs(arguments);
      var w = createWorker([
        "var e=(",f.toString(),")(",args,");",
        "postMessage(e);"
      ]);
      return callback(w);
    },

    create: function () {
      var f = arguments[0];
      var args = loadArgs(arguments);
      args = "e" + (args.length ? "," + args : "");
      return createWorker([
        "self.onmessage=function(e){",
        "var e=(",f.toString(),")(",args,");",
        "postMessage(e);}"
      ]);
    }
  }
}));
