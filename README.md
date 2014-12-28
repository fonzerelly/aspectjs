aspectjs
========

aspectjs contains some helper functions to realize lightweight aspect oriented programming in javascript.
This means executing additional code when an existing functionality gets executed. There are other
solutions on the net, which need to be specified when the additinal code should be executed: before,
meanwhile or after an existing function.

I did not like those solutions very much, because they often modified the functions source code directly
without taking into account their context. So the basic idea of this solution is to replace an existing
function on its object by another function, that is able to controll when or even if the original
method should be called.

The classic example and usecase for this is logging:
```javascript
var myObject = {
    method: function () { // do something here }
};

aspect(myObject, "method", function(fn, params) {
  console.log("entering method");
  fn();
  console.log("leaving method");
});

myObject.method(); // results in
//entering method
//do something here
//leaving method
```
If you apply this aspect to all your prototypes, you could get a nice stack trace.

* **fn** is more or less the original method that got replaced.
* **params** is an array of the params passed to the method.

With this callback you can
* modify the passed parameters:
```javascript
aspect(myObject, "method", function (fn, params) {
  var newParams = ["new param"].concat(params.slice(1));
  fn.apply(this, newParams);
});
```
* replace the return value
```javascript
aspect(myObject, "method", function (fn, params) {
  fn() //will pass the orignal passed params
  return "other result";
});
```

* or even highjack the method and do something else
```javascript
aspect(myObject, "method", function (fn, params) {
  // do something else
});
```

==Undo Aspect==

If you want to undo the aspect you added then you can simply call the
undo method returned from aspect:
```javascript
var undoAspect = aspect(myObject, "method", function (fn, params) {
  //aspecting
});

undoAspect();
myObject.method() // will again result in
//do something.
```

#!!!Caution!!!#
If you apply several aspects on the same object-method-combination, you will
only be able to undo the aspect that the undo-function has been created for.
This means:

```javascript
var undoAspect = aspect(myObject, "method", function (fn, params) {
  // do something else
});

var undoSecondAspect = aspect(myObject, "method"; function (fn, params) {
  // do again something else
});

//undoSecondAspect()
//would bring you back to the first aspected Version

undoAspect();
//will bring you back to the original method. Your second aspect would be lost.

```



==Usecases==
Besides logging, there are multible other usecases you can think of.

* mocking for testing
* do browserhacks without soiling your otherwise clean code
* performance measurement
* ...

==Why further helpers besides aspect?==

The crux on the idea of replacing methods is, that you need an object or should I say
a namespace on which you can replace it. In many cases even this not an issue, if you
gain access to the global object as [described by Nicholas C. Zakas](http://www.nczonline.net/blog/2008/04/20/get-the-javascript-global/).
But what if you want to aspect callbacks?

In this case you have to aspect the method that takes the callback. Therefore
this lib contains further helpers to do that for you:
```javascript
aspectSetTimeout(function (fn, params) {
  fn.apply(null, params);
  console.log.apply(console, params);
});

setTimeout(alert, 1000, "hello aspect");
//will output "hello aspect" as alert box and console-output synchronous after one second.
```

Please check the running test suite: http://fonzerelly.github.io/aspectjs/SpecRunner.html
