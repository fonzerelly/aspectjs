describe("aspectjs", function () {

  describe("aspect", function () {
    var obj;

    beforeEach(function () {
      obj = {
        method: function () { return "result"; }
      };
    });

    it("should be defined", function () {
      expect(aspect).toBeDefined();
    });

    describe("interface", function () {
      it("should accept only method names in an object", function () {
        expect(_.partial(aspect, obj, obj.method, function () {})).toThrow();
        expect(_.partial(aspect, obj, "unkonwnMethod", function() {})).toThrow();
      });

      it("should accept only a function as replacement for the objects method", function () {
        expect(_.partial(aspect, obj, "method", "dummy")).toThrow();
      });

      it("should return a function, to undo the aspect modification", function() {
        var originalMethod = obj.method,
            undoAspect = aspect(obj, 'method', function() {});
        expect(undoAspect instanceof Function).toBeTruthy();
        undoAspect();
        expect(obj.method).toBe(originalMethod);
      });
    }); //interface

    describe("manipulated object", function() {
      it("should have another method", function() {
        var orgMethod = obj.method;
        aspect(obj, "method", function () {});
        expect(obj.method).not.toEqual(orgMethod);
      });

      it("should call the passed function instead of the specified method", function () {
        var spyable = {
          replacement: function () {}
        };
        spyOn(spyable, 'replacement');
        aspect(obj, "method", spyable.replacement);
        obj.method();
        expect(spyable.replacement).toHaveBeenCalled();
      });

    }); //manipulated object

    describe("callback", function () {
      it("should get passed the original function as first parameter", function () {
        var touchedOriginalMethod = false;
        obj.method = function () {
          touchedOriginalMethod = true;
        };
        aspect(obj, "method", function (fn) {
          fn();
        });
        obj.method();
        expect(touchedOriginalMethod).toBeTruthy();
      });

      it("should get passed the arguments, that got passed to the org function call as second argument", function () {
        var paramsToPass = [1,2,3],
            paramsGot;

         aspect(obj, "method", function (_,params) {
           paramsGot = params;
         });
         obj.method.apply(obj, paramsToPass);
         expect(paramsGot).toEqual(paramsToPass);
      });

      it("should get passed the object it is attached to as 'this' reference", function () {
        var passedThis;
        aspect(obj, "method", function () {
          passedThis = this;
        });
        obj.method();
        expect(passedThis).toBe(obj);
      });
    });
    describe("original method", function () {
      describe("when callback does simply forward the call", function () {
        it("should return the same result as the original method", function() {
          var resultOriginalMethod = obj.method();
          aspect(obj, "method", function(fn) {
            fn();
          });
          expect(obj.method()).toEqual(resultOriginalMethod);
        });

        it("should get the parameters, the callback had been called with", function () {
          var paramsPassed = [1,2,3],
              paramsGot;
          obj.method = function () {
            paramsGot = Array.prototype.slice.call(arguments);
          };
          aspect(obj, "method", function (fn) {
            fn();
          });
          obj.method.apply(obj, paramsPassed);
          expect(paramsGot).toEqual(paramsPassed);
        });

        it("should get the obj as this reference", function () {
          var passedThis;
          obj.method = function () {
            passedThis = this;
          };
          aspect(obj, "method", function (fn) {
            fn();
          });
          obj.method();
          expect(passedThis).toBe(obj);
        });
      }); //when callback does simply forward the call

      describe("when callback modifies the call", function () {
        it("should return the result specified by the callback", function () {
          var callbackResult = "callbackResult";
          aspect(obj, "method", function () {
            return callbackResult;
          });
          expect(obj.method()).toEqual(callbackResult);
        });

        it("should get the params specified by the callback", function () {
          var callbackParams = [1,2,3],
              paramsGot;
          obj.method = function () {
            paramsGot = Array.prototype.slice.call(arguments);
          };
          aspect(obj, "method", function (fn) {
            fn.apply(this,callbackParams);
          });
          obj.method("a", "b", "c");
          expect(paramsGot).toEqual(callbackParams);
        });

        it("should get the this reference specified by the callbck", function () {
          var callbackThis = {
              id: 0
            },
            thisGot;
          obj.method = function () {
            thisGot = this;
          };
          aspect(obj, 'method', function (fn) {
            fn.apply(callbackThis);
          });
          obj.method();
          expect(thisGot).toBe(callbackThis);
        });
      }); //when callback modifies the call
    }); //callback
  }); //aspect

  describe("aspectSetTimeout", function () {
    var originalSetTimeout;

    beforeEach(function () {
      originalSetTimeout = window.setTimeout;
    });

    afterEach(function() {
      window.setTimeout = originalSetTimeout;
    });

    it("should be defined", function () {
      expect(aspectSetTimeout).toBeDefined();
    });

    describe("interface", function () {
      it("should only accept a function as input", function () {
        expect(aspectSetTimeout).toThrow();
      });

      it("should return a function to undo the aspect modification", function() {
        var originalSetTimeout = window.setTimeout,
            undoAspect = aspectSetTimeout(function () {});
        expect(undoAspect instanceof Function).toBeTruthy();
        undoAspect();
        expect(window.setTimeout).toBe(originalSetTimeout);
      });
    }); //interface

    describe("manipulated setTimeout", function () {
      var wrappingFunctionCalled = false;
      beforeEach(function(done) {
        aspectSetTimeout(function(fn) {
          wrappingFunctionCalled = true;
          done();
        });
        setTimeout(function() {}, 10);
      });

      it("should call the passed function instead of the function passed to setTimeout", function () {
        expect(wrappingFunctionCalled).toBeTruthy();
      });

      it("should return an id to cancle the timeout", function () {
        var spyable = {
          method: function () {}
        };
        spyOn(spyable, "method");
        var timeoutId = setTimeout(spyable.method, 10);
        clearTimeout(timeoutId);
        expect(spyable.method).not.toHaveBeenCalled();
      });
    }); //manipulated setTimeout

    describe("callback", function () {
      var fnPassed = function () {},
          fnGot = null,
          paramsPassed = [1,2,3],
          paramsGot = null;

      beforeEach(function(done) {
        aspectSetTimeout(function(fn, params) {
          fnGot = fn;
          paramsGot = params;
          done();
        });
        setTimeout.apply(null, [fnPassed, 10].concat(paramsPassed) );
      });

      afterEach(function () {
        fnGot = null;
        paramsGot = null;
      });

      it("should get the original callback as first parameter", function () {
        expect(fnGot).toBe(fnPassed);
      });

      it("should get the params, passed to setTimeout", function () {
        expect(paramsGot).toEqual(paramsPassed);
      });
    });
  });

  describe("aspectSetInterval", function () {
    var originalSetInterval;

    beforeEach(function () {
      originalSetInterval = window.setInterval;
    });

    afterEach(function() {
      window.setInterval = originalSetInterval;
    });

    it("should be defined", function () {
      expect(aspectSetInterval).toBeDefined();
    });

    describe("interface", function () {
      it("should only accept a function as input", function () {
        expect(aspectSetInterval).toThrow();
      });

      it("should return a function to undo the aspect modification", function() {
        var originalSetInterval = window.setInterval,
            undoAspect = aspectSetInterval(function () {});
        expect(undoAspect instanceof Function).toBeTruthy();
        undoAspect();
        expect(window.setInterval).toBe(originalSetInterval);
      });
    }); //interface

    describe("manipulated setInterval", function () {
      var wrappingFunctionCalled = false,
          intervalId = null;
      beforeEach(function(done) {
        aspectSetInterval(function(fn) {
          wrappingFunctionCalled = true;
          done();
        });
        intervalId = setInterval(function() {}, 10);
      });

      afterEach(function() {
        clearInterval(intervalId);
      });

      it("should call the passed function instead of the function passed to setInterval", function () {
        expect(wrappingFunctionCalled).toBeTruthy();
      });

      it("should return an id to cancle the timeout", function () {
        var spyable = {
          method: function () {}
        };
        spyOn(spyable, "method");
        var timeoutId = setInterval(spyable.method, 10);
        clearInterval(timeoutId);
        expect(spyable.method).not.toHaveBeenCalled();
      });
    }); //manipulated setInterval

    describe("callback", function () {
      var fnPassed = function () {},
          fnGot = null,
          paramsPassed = [1,2,3],
          paramsGot = null,
          intervalId = null;

      beforeEach(function(done) {
        aspectSetInterval(function(fn, params) {
          fnGot = fn;
          paramsGot = params;
          done();
        });
        intervalId = setInterval.apply(null, [fnPassed, 10].concat(paramsPassed) );
      });

      afterEach(function () {
        fnGot = null;
        paramsGot = null;
        clearInterval(intervalId);
      });

      it("should get the original callback as first parameter", function () {
        expect(fnGot).toBe(fnPassed);
      });

      it("should get the params, passed to setInterval", function () {
        expect(paramsGot).toEqual(paramsPassed);
      });
    });
  });
});
