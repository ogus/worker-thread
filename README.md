# Worker Thread

A tiny and flexible browser module to create local threads, based on inline WebWorkers


## Introduction

This module provides multi-threading in a browser context, by using Web Worker without an external file.

It uses the Blob API to build an object from the input function, convert it to a URL string, and instantiate a WebWorker with the URL.

### Features

 + Tiny module (~1.2kB)
 + Easy to use API, with various thread constructors
 + Flexible input function (regular function, object's method, lambda function, etc.)
 + Uses ES5 features only, for more browser compatibility
 + Easily readable so you can build your own version

### Compatibility

You can find the browser support for the Worker and Blob API on *Can I Use*:
 + [Web Workers](https://caniuse.com/#feat=webworkers)
 + [Blob Constructor](https://caniuse.com/#feat=blobbuilder)
 + [Blob URL](https://caniuse.com/#feat=bloburls)

You can also find an overview of the compatibility on [I Want To Use](http://www.iwanttouse.com/#webworkers,blobbuilder,bloburls).


## Usage

```js
/**
 * 1. Run any function in another thread, and pass it any arguments
 */
WorkerThread.run(function (a, b) {
  return a + b;
}, 1, 2)
.then(function (e) {
  console.log(e.data);
});

/**
 * 2. Create a worker thread that respond to messages with any function
 */
var helloThread = WorkerThread.await(function (e) {
  return "Hello " + e.data;
});
// create an event listener (based on the Worker API)
helloThread.onmessage = function (e) {
  console.log("WT Message:", e.data);
}
// send a message
workerOk.postMessage("World");

/**
 * 3. Create a new customizable WebWorker as a local thread
 */
var wkThread = WorkerThread.new(function (name, value) {
  self.name = name;
  self.value = value;
  self.onmessage = function (e) {
    self.value += e.data;
    postMessage(self.name + ", value = " + self.value);
  }
}, "'Worker Name'", 0);
// create an event listener for the worker thread
countWorker.onmessage = function (e) {
  console.log("wkThread Message:", e.data);
}
// update the worker state
countWorker.postMessage(1);
countWorker.postMessage(10);
```

## API

### `WorkerThread.run(func [, args])`
Create a new Worker that instantly execute the input function, with the (optionnal) input arguments, in a separate context.

Return a Promise-like object that accept a callback function through `then()`, which wrap the result of the function in a worker message.
```js
orkerThread.run(...).then(function (e) {
  console.log(e.data);
})
```

### `WorkerThread.await(func [, args])`

Create a new Worker that will execute the input function, with the (optionnal) input arguments, in a separate context on every message received.
The worker thread will return the result of the function in a worker message.

### `WorkerThread.new(func [, args])`

Create a new Worker from the input function constructor, and return it.
You can freely declare any `onmessage` event listener and `postMessage` call in the constructor, it behave like any Web Worker, with the only exception that is has been declared without an external file.


## Installation

You can import the module from Github with a CDN like [jsDelivr](https://www.jsdelivr.com/)
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/ogus/worker-thread/src/worker-thread.min.js"></script>
```

You can clone the repository & include the `worker-thread.js` file in your project:
```sh
git clone https://github.com/ogus/worker-thread.git
```


## License

This project is licensed under the WTFPL - see [LICENSE](LICENSE) for more details
