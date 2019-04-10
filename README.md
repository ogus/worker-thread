# Worker Thread

A tiny and flexible browser module to create local threads, based on inline WebWorkers


## Introduction

This module provides multi-threading in a browser context, by using Web Worker without an external file.
It uses the Blob API to build an object from the input function, convert it to a URL string, and instantiate an inline WebWorker with the URL.

It is recommended to know [how to use Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) before using this module, as the workflow and methods of the WorkerThread are based on the Web Worker API.

### Features

 + Tiny module (~1.2kB)
 + Easy to use API, with various thread constructors
 + Flexible function execution (regular function, object's method, lambda function, etc.)
 + ES5 features only, for more browser compatibility
 + Easily readable code so you can build your own version !

### Compatibility

| IE | Edge | Firefox | Chrome | Safari | Opera | Mobile |
| --- | --- | --- | --- | --- | --- | --- |
| 10+ | ✔ | 13+ | 23+ | 6.1+ | 15+ | ✔ |

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
helloThread.postMessage("World");

/**
 * 3. Create a new customizable WebWorker as a local thread
 */
var wkThread = WorkerThread.new(function (name) {
  self.name = name;
  self.value = 0;
  self.onmessage = function (e) {
    self.value += e.data;
    postMessage(`'${self.name}', value = ${self.value}`);
  }
}, "MyWorker");
// create an event listener for the worker thread
wkThread.onmessage = function (e) {
  console.log("wkThread Message:", e.data);
}
// update the worker state
wkThread.postMessage(1);
wkThread.postMessage(10);
```

## API

A single static `WorkerThread` class is provided to instantiate and execute any type of thread.

### `WorkerThread.run(func [, args])`

Create a new Worker that immediatly execute the input function, with the (optionnal) input arguments, in a separate thread.
You can pass as many arguments as you want to the Worker.

It returns a Promise-like object that accept a callback function, passed to its `then()` method. The callback will have access to the result of the function in a worker message.

**Note:** The input function is executed instanly, and only once. If you want more control on the time and number of executions, use `await` instead.

**Examples:**

```js
WorkerThread.run(function () {
  return "ok";
}).then(e => {
  console.log(e.data);  // output: 'ok'
});
```

```js
function contains(array, value, message) {
  var index = array.indexOf(value);
  if (index > -1) {
    return index;
  }
  return message;
}

WorkerThread.run(contains, [1, 2, 3], 10, "nope").then(function (e) {
  console.log(e.data);  // output: 'nope'
});
```


### `WorkerThread.await(func [, args])`

Create a new Worker that will execute the input function on every message received, with the (optionnal) input arguments, in a separate thread.

You can send a message to the Worker by using the `postMessage(data)` method on the worker. The message will be passed to the input function as the first argument, and the input function will be executed.

Each time the Worker execute the input function, it will emit a new message containing the return value of the function. You can catch this message by listening to the `onmessage` event of the worker.

**Note:** The input function is wrapped in the internal `onmessage` event listener of the Worker. If you want more control on the behavior of the Worker, use `new` instead.

**Examples**

```js
var wkThread = WorkerThread.await(function (e) {
  return typeof e == "string";
});

wkThread.onmessage = function (e) {
  console.log(e.data);
}

wkThread.postMessage("1");  // onmessage output: true
wkThread.postMessage(2);  // onmessage output: false
```

```js
var wkThread = WorkerThread.await(function (e, base) {
  return base + String(e.data);
}, "hello ");

wkThread.onmessage = function (e) {
  console.log(e.data);
}

wkThread.postMessage("world");  // onmessage output: 'hello world'
wkThread.postMessage([1, 2, 3]);  // onmessage output: 'hello [1, 2, 3]'
```

### `WorkerThread.new(func [, args])`

Create a new Worker from the input function constructor, and return it. The input arguments (optionnal) will be automatically passed to the function.

You can freely declare any `onmessage` event listener and `postMessage` call inside the Worker. This gives you full control over the new Worker.

**Examples**

```js
function constructor(name) {
  var myName = name;

  function welcome(string) {
    return "Hello "+string+", my name is "+myName;
  }

  onmessage = function (e) {
    var response = welcome(String(e.data));
    postMessage(response);
  }
}

var workerFoo = WorkerThread.new(constructor, "Foo");
workerFoo.onmessage = e => { console.log(e.data); }

var workerBar = WorkerThread.new(constructor, "Bar");
workerBar.onmessage = e => { console.log(e.data); }

workerFoo.postMessage("Main");
workerBar.postMessage("Main");
```

## Installation

You can import the module with a CDN like [jsDelivr](https://www.jsdelivr.com/)
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/ogus/worker-thread/worker-thread.js"></script>
```

You can clone the repository & include the `worker-thread.js` file in your project:
```sh
git clone https://github.com/ogus/worker-thread.git
```


## License

This project is licensed under the WTFPL - see [LICENSE](LICENSE) for more details
