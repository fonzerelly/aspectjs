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
        spyOn(obj, 'method');
        var reverseAspect = aspect(obj, 'method', function() {});
        reverseAspect();
        obj.method();
        expect(obj.method).toHaveBeenCalled();
      });
    }); //manipulated object

    describe("callback", function () {
      it("should get passed the original function as first parameter", function () {
        var touchedOriginalMethod = false;
        obj.method = function () {
          touchedOriginalMethod = true;
        };

        aspect(obj, "method", function (first) {
          first();
        });
        obj.method();
        expect(touchedOriginalMethod).toBeTruthy();
      });
      it("should get passed the arguments, that got passed to the org function call as second argument", function () {
        var paramsToPass = [1,2,3];
         aspect(obj, "method", function (_, second) {
           expect(second).toEqual(paramsToPass);
         });
         obj.method.apply(obj, paramsToPass);
      });
      it("should get passed the object it is attached to as 'this' reference", function () {
        aspect(obj, "method", function () {
          expect(this).toBe(obj);
        });
      });
    });
    describe("original method", function () {
      describe("when callback does not prevent the passage of parameters", function () {
        it("should return the same result as the original method. A wrapping function can not return anything by return.", function() {
          var resultOriginalMethod = obj.method();
          aspect(obj, "method", function(func, funcArgs) {
           return "this will never be returned by obj.method()";
          });
          expect(obj.method()).toEqual(resultOriginalMethod);
        });

        // it("shoud get the parameters, the callback had been called with", function () {
        //   var paramsToPass = [1,2,3];
        //   obj.method = function () {
        //     var paramsGot = Array.prototype.slice.call(arguments);
        //     expect(paramsGot.to
        //   });
        //   aspect(obj, "method", function (fn, params) {
        //     fn(params);
        //   });
        //   obj.method.apply(obj, paramsToPass);
        //   expect(obj.method).toHaveBeenCalledWith(1,2,3);
        // });
      });
    }); //callback
  }); //aspect

});
