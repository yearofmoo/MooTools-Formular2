describe("Testing Formular",function() {

  describe("Testing the error messages",function() {

    var formular, form, formID = 'form';

    beforeEach(function() {
      if(form) {
        form.destroy();
      }
      form = new Element('form').inject(document.body);
      form.id = formID;
      form.adopt(
        new Element('input').set({ 'type':'text', 'class' : 'required' }),
        new Element('input').set({ 'type':'text', 'class' : 'required' }),
        new Element('input').set({ 'type':'text', 'class' : 'required' })
      );
      formular = new Formular(form);
    });

    it("should have have the correct ID",function() {
      expect(formular.getID()).toBe(formID);
    });

    it("it should contain an error message",function() {
      formular.validate();
      expect(formular.getErrorMessages().length).toBeGreaterThan(0);
    });

    it("the error message should be apart of the field",function() {
      formular.validate();
      var field = formular.getFields()[0];
      var errorMessage = formular.getErrorMessages()[0];
      expect(formular.getErrorMessage(field)).toBe(errorMessage);
    });

    it("the error message should be visible",function() {
      formular.validate();
      var errorMessage = formular.getErrorMessages()[0];
      expect(errorMessage.getStyle('display')).toBe('block');
    });

    it("the error message should be hidden after hide",function() {
      formular.validate();
      var field = formular.getFields()[0];
      var errorMessage = formular.getErrorMessages()[0];
      formular.addEvent('hideErrorMessage',function() {
        expect(1).toBe(2);
        expect(errorMessage.getStyle('display')).toBe('none');
      });
      formular.hideError(field);
    });

  });

});
