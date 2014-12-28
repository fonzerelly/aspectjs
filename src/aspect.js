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
      var directlyPassedParams = Array.prototype.slice.call(arguments),
          result,
          exchangeByResult = exchangeBy.apply(this, [function () {
        var paramsPassedBy_exchangeBy = Array.prototype.slice.call(arguments),
            params = paramsPassedBy_exchangeBy;

        if (params.length === 0) {
          params = directlyPassedParams;
        }

        //if a mere function gets called inside a method, its this references the global object
        //which means the window-object for browsers
        //ToDo: Find a way to replace window by Nicholas C. Zakas
        //
        // function getGlobal(){
        //   return (function(){
        //     return this;
        //   }).call(null);
        // }
        //
        result = originalMethod.apply((this === window ) ? onWhichObjectIsTheMethod : this, params);
      }, directlyPassedParams]);
      return exchangeByResult || result;
    };

    //ToDo: Make sure that when several aspects have been called on the same
    //object-method-combination that undoing it will only undo the aspect added
    //by it not the one at that time.
    return function () {
      onWhichObjectIsTheMethod[nameOfTheToChangeMethod] = originalMethod;
    };
  };

  function _aspectTiming(timingFunction, exchangeBy) {
    if (!(exchangeBy instanceof Function)) {
      throw new TypeError("aspectS" + timingFuction.slice(1) + " awaits a Function for exchangeBy");
    }
    return aspect(window, timingFunction, function(orgTimingFunction, params) {
      var f = params[0],
          t = params[1],
          timedOutParams = Array.prototype.slice.call(params, 2),
          modifiedTimingFunctionParams = [
            function () {
              exchangeBy.apply(null, [f, timedOutParams]);
            },
            t,
            timedOutParams
          ];
          console.log(timedOutParams);

      orgTimingFunction.apply(window, modifiedTimingFunctionParams);
    });
  }

  window.aspectSetTimeout = function (exchangeBy) {
    return _aspectTiming("setTimeout", exchangeBy);
  };

  window.aspectSetInterval = function (exchangeBy) {
    return _aspectTiming("setInterval", exchangeBy);
  };
}(window));
