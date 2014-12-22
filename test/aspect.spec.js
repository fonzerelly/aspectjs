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

      it("should return a function", function() {
        expect(aspect(obj, "method", function () {}) instanceof Function).toBeTruthy();
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

      it("should call the original method, after aspect got reversed", function () {
        var originalMethod = obj.method,
            reverseAspect = aspect(obj, 'method', function() {});
        reverseAspect();
        expect(obj.method).toBe(originalMethod);
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

});
