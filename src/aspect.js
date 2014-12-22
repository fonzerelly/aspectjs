(function (window) {
  window.aspect = function(onWhichObjectIsTheMethod, nameOfTheToChangeMethod, exchangeBy) {
    if (typeof nameOfTheToChangeMethod !== "string") {
      throw new TypeError("aspect awaits a String for nameOfTheToChangeMethod");
    }
    if (onWhichObjectIsTheMethod[nameOfTheToChangeMethod] === undefined) {
      throw new TypeError("aspects let you only manipulate functions that are part of the passed object");
    }
    if (!(exchangeBy instanceof Function)) {
      throw new TypeError("aspects awaits a Function for exchangeBy");
    }
    var originalMethod = onWhichObjectIsTheMethod[nameOfTheToChangeMethod];

    onWhichObjectIsTheMethod[nameOfTheToChangeMethod] = function () {
      var methodArguments = Array.prototype.slice.call(arguments),
          result = "result";
      exchangeBy.apply(this, [function () {
        result = originalMethod();
      }, methodArguments]);
      return result;
    };

    return function () {
      onWhichObjectIsTheMethod[nameOfTheToChangeMethod] = originalMethod;
    };
  };
}(window));
