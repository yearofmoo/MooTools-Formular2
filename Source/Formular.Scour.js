Scour.Global.defineRole('Formular',{

  includeIf : function() {
    return !! window.Formular;
  },

  applyIf : function(element) {
    element.get('tag') == 'form';
  },

  onLoad : function(element,params) {
    var options = params.getObject();
    this.formular = new Formular(element,options);
  },

  onCleanup : function(element) {
    this.formular.destroy();
    delete this.formular;
  },

  onUnLoad : function(element) {
    this.onCleanup(element);
  }

});
