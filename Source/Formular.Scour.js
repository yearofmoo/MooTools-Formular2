Scour.Global.defineRole('Formular',{

  includeIf : function() {
    return !! window.Formular;
  },

  applyIf : function(element) {
    element.get('tag') == 'form';
  },

  onLoad : function(element,params) {
    var options = params.getAsJSON();
    this.formular = new Formular(element,options);
  },

  onCleanup : function(element) {
    this.formular.destroy();
    delete this.formular;
  },

  onUnLoad : function() {
    this.formular.destroy();
  }

});
