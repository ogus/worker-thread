# Worker Thread

> A tiny and flexible browser module to emulate multithreading, based on inline WebWorkers

## Table of Contents

 + [Description](#description)
 + [Install](#install)
 + [Usage](#usage)
 + [API](#api)
 + [Contributing](#contributing)
 + [License](#license)

## Description

This module provides multithreading in a browser context, by using Web Worker without an external file.

It uses the Blob API to build an object from an input function, convert it to a URL string, and instantiate an inline WebWorker from that URL. The WebWorker is then executed in a separate thread, whenever it is called through its messaging interface.

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

You can find the browser support for the Worker and Blob API on *Can I Use*: [Web Workers](https://caniuse.com/#feat=webworkers), [Blob Constructor](https://caniuse.com/#feat=blobbuilder), [Blob URL](https://caniuse.com/#feat=bloburls).
You can also find an overview of the compatibility on [I Want To Use](http://www.iwanttouse.com/#webworkers,blobbuilder,bloburls).


## Install

You can import the module from Github with [jsDelivr](https://www.jsdelivr.com/)
```html
<script src="https://cdn.jsdelivr.net/gh/ogus/worker-thread/worker-thread.min.js"></script>
```

You can clone the repository & include the `worker-thread.js` file in your project:
```sh
git clone https://github.com/ogus/worker-thread.git
```


## Usage

The creation of a new thread is equivalent to the creation of a new Worker. The Worker does not need an external file to be instantiated, and it has its own context.

```js
// declare a Worker template
function threadConstructor = function (name) {
  self.name = name;
  self.value = 0;
  self.onmessage = function (e) {
    self.value += e.data;
    postMessage(`'${self.name}', value = ${self.value}`);
  }
}

// instantiate a new Worker
var thread = WorkerThread.new(threadConstructor, "MyWorker");
thread.onmessage = function (e) {
  console.log("thread message:", e.data);
}

// send messages !
thread.postMessage(1);
thread.postMessage(10);
```

If your thread does not need to save data, you can use a simpler interface that only define the `onmessage` behavior

```js
// create a Worker by defining its local message listener
var thread = WorkerThread.await(function (message) {
  var name = message.data;
  return "Hello " + name;
});

// create a message listener in the main thread
thread.onmessage = function (message) {
  console.log("New Worker message:", message.data);
}

// send messages !
thread.postMessage("World");
thread.postMessage("Bob");
```

Finally, if you just need to run a function without blocking the main thread, there is an even simpler way

```js
WorkerThread.run(function (a, b) {
  return a + b;
}, 1, 2)
.then(function (e) {
  console.log(e.data);
});
```

## API

A single static `WorkerThread` class is provided to instantiate and execute any type of thread.

### `WorkerThread.new(func, args=undefined)`

Create a new WebWorker that can be used as a separated thread.

__Input__

 + `func` : The function used as a WebWorker constructor
 + `args` : The input arguments passed to the function

__Notes__

The input function should be a valid WebWorker constructor.
It uses the `self` indentifier insteand of `this`, and it has access to a `onmessage` event listener and a `postMessage` method.

Any type and number of arguments can be used along with the input function: boolean, number, string, object, function...
```js
var f = () => {};
WorkerThread.new(f, true, 3, ["a", "b", "c"], {left: true, right: false});
```

The Worker is using a separate context context: any variable declared outside the constructor is not accessible by the thread, and any worker variable is not accessible from the main thread.

__Examples__

```js
var worker = WorkerThread.new(function () {
  self.count = 0;
  onmessage = function (message) {
    var n = message.data;
    self.count += n;
    postMessage("Current value: " + self.count);
  }
});

worker.onmessage = function (message) {
  var text = message.data;
  console.log(text);
};

worker.postMessage(1);
worker.postMessage(3);
worker.postMessage(-2);
```

```js
function init(name) {
  var myName = name;

  function welcome(string) {
    return "Hello " + string + ", my name is " + myName;
  }

  onmessage = function (e) {
    var text = e.data;
    var response = welcome(text);
    postMessage(response);
  }
}

var workerBob = WorkerThread.new(init, "Bob");
workerBob.onmessage = (e) => { console.log(e.data); }

var workerJack = WorkerThread.new(init, "Jack");
workerJack.onmessage = (e) => { console.log(e.data); }

workerFoo.postMessage("Main");
workerBar.postMessage("Main");
```

### `WorkerThread.await(func, args=undefined)`

Create a new Worker, with the input function used as its `onmessage` event listener. This is a shorthand to create a thread that only respond to incoming messages, without external behavior.

__Input__

 + `func` : The function used inside the message event listener
 + `args` : The input arguments passed to the function

__Notes__

The input function is wrapped in the internal `onmessage` event listener of the Worker.

The message object associated with this event is automaticaly passed to the input function as its first argument, and the return value of the input function is automaticaly sent with the `postMessage` method.

__Examples__

```js
var thread = WorkerThread.await(function (message) {
  var array = message.data;
  return array.length;
});

wkThread.onmessage = (e) => console.log(e.data);

wkThread.postMessage([0, 1, 2]);  // output: 3
wkThread.postMessage(["A"]);  // output: 1
```

### `WorkerThread.run(func, args=undefined)`

Create a new Worker that immediatly execute the input function and send back the result. This is the most simple way to instanciate a basic thread.

__Input__

 + `func` : Any function
 + `args` : Any arguments, passed to the input function

It return an object containing a `then(func)` method that accept any callback. This behavior is similar to Promise, while still being compatible with older browser.

__Examples:__

```js
function ok() {
  return "Ok";
}

WorkerThread.run(ok).then(msg => {
  console.log(msg.data);  // output: 'ok'
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


## Contributing

If you find a bug, a typo, or a missing feature, do not hesitate to contribute to this repository !


## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for more details
