(function (window) {
  window.aspect = function(onWhichObjectIsTheMethod, nameOfTheToChangeMethod, exchangeBy) {
    if (typeof nameOfTheToChangeMethod !== "string") {
      throw new TypeError("aspect awaits a String for nameOfTheToChangeMethod");
    }
    if (onWhichObjectIsTheMethod[nameOfTheToChangeMethod] === undefined) {
      throw new TypeError("aspects let you only manipulate functions that are part of the passed object");
    }
    if (typeof exchangeBy !== "function") {
      throw new TypeError("aspects awaits a Function for exchangeBy");
    }
  };
}(window));
