describe("aspectjs", function () {

  describe("aspect", function () {
    var obj;

    beforeEach(function () {
      obj = {
        method: function () {}
      };
    });

    it("should be defined", function () {
      expect(aspect).toBeDefined();
    });
    it("should accept only method names in an object", function () {
      expect(_.partial(aspect, obj, obj.method, function () {})).toThrow();
      expect(_.partial(aspect, obj, "unkonwnMethod", function() {})).toThrow();
    });
    it("should accept only a function as replacement for the objects method", function () {
      expect(_.partial(aspect, obj, "method", "dummy")).toThrow();
    });
  }); //aspect

});
