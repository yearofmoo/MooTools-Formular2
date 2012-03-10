var Formular = new Class({

  Binds : [
    'disableFields','enableFields','disableField','enableField',
    'validateField','validateFields','validateFieldset',
    'validate','submit','closeBox',
    'onValidate','onElementValid','onElementInvalid',
    'isErrorMessageVisible','destroyErrorMessage'
  ],

  Implements : [Options, Events, Chain],

  options : {

    submitFormOnSuccess : true,

    errorMessageZIndex : 1000,

    errorMessageClassName : 'error-box',
    errorMessageSelector : '.error-box',

    validFieldClassName : 'valid-field',
    invalidFieldClassName : 'invalid-field',

    closeClassName : 'formular-close',

    errorMessageTitle : 'There was an error:',
    errorMessageTextSeparator : '<br />',

    oneValidatorPerMessage : false,

    oneErrorAtATime : true,

    focusOnInvalidFieldOnSubmit : true,
    scrollToFirstErrorMessageOnSubmit : true,

    fieldsSelector : '.required',
    buttonsSelector : 'input[type="button"], input[type="submit"]',
    allFieldsSelector : 'input.text',

    disabledFieldClassName : 'disabled',
    disableFieldsOnSubmit : true,

    evaluateOnSubmit : true,
    evaluateFieldsOnBlur : true,
    evaluateFieldsOnChange : true,

    allowClose : true,
    closeErrorOnEscapeKey : true,

    errorMessageOpacity : 0.8,

    formValidatorOptions : {
      ignoreHidden : true,
      ignoreDisabled : true
    },

    offsets : {
      x : -60,
      y : -10
    },

    //these options are more for interal stuff
    fieldErrorMessageStorageKey : 'Formular:error-message',
    specialEventsStorageKey : 'Formular:Events',
    fieldProxyStorageKey : 'Formular:proxy-element',
    errorMessageVisibilityKey : 'visible'
  },

  initialize : function(form,options) {
    this.form = $(form);
    this.bufferSubmitEvents();
    this.valid = false;
    this.errorMessages = [];

    this.setOptions(options);
    this.createFormValidator();
    this.setupEvents();
  },

  bufferSubmitEvents : function() {
    var form = this.getForm();
    var events = this.getSubmitEvents();
    try {
      var submitEvents = form.retrieve('events').submit.keys;
      if(submitEvents && submitEvents.length > 0) {
        Array.clone(submitEvents).each(function(ev) {
          events.push(ev);
        });
        form.removeEvents('submit');
        this._submitEvents = events;
      }
    }
    catch(e) {}
  },

  createFormValidator : function() {
    var options = this.options.formValidatorOptions;
    options.serial = true;
    options.fieldSelectors = this.options.fieldsSelector;
    options.evaluateOnSubmit = this.options.evaluateOnSubmit;
    options.evaluateFieldsOnBlur = this.options.evaluateFieldsOnBlur;
    options.evaluateFieldsOnChange = this.options.evaluateFieldsOnChange;
    this.validator = new Form.Validator(this.getForm(),options);
  },

  setupEvents : function() {
    this.getFormValidator().addEvents({
      'onFormValidate':this.onValidate,
      'onElementPass':this.onElementValid,
      'onElementFail':this.onElementInvalid
    });

    this.getForm().addEvent('submit',function(event) {
      if(this.isValid()) {
        if(this.options.submitFormOnSuccess) {
          event.stop();
        }
        this.onBeforeSubmit(event);
        if(this.options.disableFieldsOnSubmit) {
          this.disableFields();
        }
        this.onSubmit(event);
      }
    }.bind(this));

    this.form._addEvent = this.form.addEvent;
    this.form.addEvent = function(ev,fn) {
      if(ev == 'submit') {
        this.getSubmitEvents().push(fn);
      }
      else {
        var form = this.getForm();
        form._addEvent.apply(form,[ev,fn]);
      }
    }.bind(this);

  },

  onBeforeSubmit : function(event) {
    var events = this.getSubmitEvents();
    if(events && events.length > 0) {
      events.each(function(e) {
        e(event);
      });
    }
  },

  onSubmit : function(event) {
    var submit = this.options.submitFormOnSuccess;
    if(submit) {
      this.fireEvent('naturalSubmit',[event]);
    }
    this.fireEvent('submit',[event,submit]);
  },

  getForm : function() {
    return this.form;
  },

  getID : function() {
    return this.getForm().get('id');
  },

  getAction : function() {
    return this.getForm().get('action');
  },

  getMethod : function() {
    return this.getForm().get('method');
  },

  hasSubmitEvent : function() {
    return this.getSubmitEvents().length > 0;
  },

  getFields : function() {
    return this.getForm().getElements(this.options.fieldsSelector);
  },

  getID : function() {
    return this.getForm().get('id');
  },

  getFormValidator : function() {
    return this.validator;
  },

  validate : function() {
    return this.getFormValidator().validate();
  },

  validateField : function(field) {
    this.getFormValidator().validateField(field);
  },

  validateFields : function(field) {
    fields.each(this.validateField);
  },

  validateFieldset : function(fieldset) {
    var fields = fiedlset.getElements(this.options.fieldsSelector);
    if(fields) {
      this.validateFields(fields);
    }
  },

  enableFields : function(fields) {
    fields = fields || this.getFields();
    fields.each(this.enableField);
  },

  disableFields : function(fields) {
    fields = fields || this.getFields();
    fields.each(this.disableField);
  },

  disableField : function(field) {
    field.addClass(this.options.disabledFieldClassName);
    field.set({
      'readonly' : 1
    });
  },

  enableField : function(field) {
    field.removeClass(this.options.disabledFieldClassName);
    field.set({
      'readonly' : 0
    });
  },

  isFieldEnabled : function(field) {
    return field.hasClass(this.options.disabledFieldClassName);
  },

  isFieldDisabled : function(field) {
    return this.isFieldEnabled(field);
  },

  submit : function() {
    this.validate();
  },

  isValid : function() {
    return !! this.valid;
  },

  isInvalid : function() {
    return ! this.isValid();
  },

  getAllFields : function() {
    return this.getForm().getElements(this.options.allFieldsSelector);
  },

  getButtons : function() {
    return this.getForm().getElements(this.options.buttonsSelector);
  },

  setSpecialFieldEvents : function(field) {
    var key = this.options.specialMethodsStorageKey;
    if(!field.retrieve(key)) {
      var that = this;
      field.addEvent('keydown',function(event) {
        if(event.key == 'esc') {
          that.hideError(this);
        }
      });
      field.store(key,true);
    }
  },

  showError : function(field,text) {
    var message = this.getOrCreateErrorMessage(field);
    message.show();

    message.setText(text);
    this.positionErrorMessageRelativeToField(field,message);

    message.store(this.options.errorMessageVisibilityKey,true);
    var y = message.getPosition().y;
    message.setOpacity(0);
    message.get('morph').start({
      'top':[y-5,y],
      'opacity':this.options.errorMessageOpacity || 1
    }).chain(function() {
      this.setSpecialFieldEvents(field);
      this.onShowErrorMessage(message);
    }.bind(this));
  },

  hideError : function(field) {
    var message = this.getErrorMessage(field);
    if(message) {
      message.store(this.options.errorMessageVisibilityKey,false);
      this.hideErrorMessage(message);
    }
  },

  hideErrorMessage : function(message) {
    message.get('morph').start({
      'opacity':0
    }).chain(function() {
      message.hide();
      this.onHideErrorMessage(message);
    }.bind(this));
  },

  positionErrorMessage : function(message,x,y) {
    var offsets = this.options.offsets;
    x += offsets.x;
    y += offsets.y;
    message.setStyles({
      'left' : x,
      'top' : y
    });
  },

  getFieldProxyElement : function(field) {
    return field.retrieve(this.fieldProxyStorageKey,field);
  },

  positionErrorMessageRelativeToField : function(field,message) {

    var element = this.getFieldProxyElement(field);

    var pos = element.getPosition();
    var size = element.getSize();
    var messageSize = message.getSize();
    var x = pos.x + size.x;
    var y = pos.y - messageSize.y;
    this.positionErrorMessage(message,x,y);
  },

  createErrorMessageHTML : function() {
    var close = '';
    var allowClose = this.options.allowClose;
    if(allowClose) {
      close = '<div class="' + this.options.closeClassName + '"></div>';
    }
    var contents = '<div class="arrow"></div>'+
                   '<table>'+
                   '<tr>'+
                   '<td class="tl x xy"></td>'+
                   '<td class="t y"></td>'+
                   '<td class="tr x xy"></td>'+
                   '</tr>'+
                   '<tr>'+
                   '<td class="l x"></td>'+
                   '<td class="c">'+close+'<div class="title"></div><div class="txt"></div></td>'+
                   '<td class="r x"></td>'+
                   '</tr>'+
                   '<tr>'+
                   '<td class="bl x xy"></td>'+
                   '<td class="b y"></td>'+
                   '<td class="br x xy"></td>'+
                   '</tr>'+
                   '</table>';
    return contents;
  },

  setupErrorMessageEvents : function(message) {
    if(this.options.allowClose) {
      var closeElement = message.getElement('.'+this.options.closeClassName);
      message.addEvent('click',function(event) {
        event.stop();
        var box = $(this).getParent(this.options.errorMessageSelector);
        if(box) {
          this.hideMessage(box);
        }
      }.bind(this));
    }
  },

  createErrorMessage : function() {
    var elm = new Element('div',{
      'class' : this.options.errorMessageClassName,
      'html' : this.createErrorMessageHTML(),
      'styles' : {
        'position':'absolute',
        'top':-9999,
        'left':-9999,
        'z-index':this.options.errorMessageZIndex
      }
    }).inject(document.body);

    elm.getElement('.title').set('html',this.options.errorMessageTitle);

    elm.setText = function(text) {
      $(this).getElement('.txt').set('html',text);
    };

    elm.getText = function() {
      $(this).getElement('.txt').get('html');
    }

    this.setupErrorMessageEvents(elm);
    return elm;
  },

  createErrorMessageTextFromValidators : function(validators) {
    var messages = [];
    var max = validators.length;
    if(this.options.oneValidatorPerMessage) {
      max = 1;
    }

    var formValidator = this.getFormValidator();
    for(var i=0;i<max;i++) {
      var validator = formValidator.getValidator(validators[i]);
      messages.push(validator.getError());
    }

    return messages.length > 1 ? messages.join(this.options.errorMessageTextSeparator) : messages[0];
  },

  onHideErrorMessage : function() {
    this.fireEvent('hideErrorMessage');
  },

  onShowErrorMessage : function() {

  },

  onValidate : function(isValid,form,onSubmit) {
    this.valid = isValid;
    if(this.isValid()) {
      this.onSuccess();
    }
    else {
      this.onFailure();
    }
  },

  getSubmitEvents : function() {
    return this._submitEvents || [];
  },

  onElementValid : function(field) {
    field.removeClass(this.options.invalidFieldClassName).addClass(this.options.validFieldClassName);
    this.hideError(field);
  },

  isErrorMessageVisible : function(message) {
    return message.retrieve(this.options.errorMessageVisibilityKey);
  },

  onElementInvalid : function(field,failedValidators) {
    var message = this.getErrorMessage(field);
    var showMessage = message ? this.isErrorMessageVisible(message) : false;

    if(!showMessage) {
      var one = this.options.oneErrorAtATime;
      showMessage = !one || (one && this.getTotalVisibleErrors() < 1);
    }

    if(showMessage) {
      field.removeClass(this.options.validFieldClassName).addClass(this.options.invalidFieldClassName);
      var messageText = this.createErrorMessageTextFromValidators(failedValidators);
      this.showError(field,messageText);
    }
  },

  getScroller : function() {
    if(!this.scroller) {
      this.scroller = new Fx.Scroll(window);
    }
    return this.scroller;
  },

  scrollTo : function(elm) {
    this.getScroller().toElement(elm);
  },

  onSuccess : function() {
    this.fireEvent('success');
  },

  onFailure : function() {
    if(this.options.focusOnInvalidFieldOnSubmit) {
      var field = (this.getInvalidFields() || [null])[0];
      if(field) {
        var coords = window.getScroll();
        field.focus();
        this.getScroller().set(coords.x,coords.y); //this is to prevent a jump in the page
      }
    }
    if(this.options.scrollToFirstErrorMessageOnSubmit) {
      var field = (this.getInvalidFields() || [null])[0];
      if(field) {
        var message = this.getErrorMessage(field);
        this.scrollTo(message);
      }
    }
    this.fireEvent('failure');
  },

  getTotalVisibleErrors : function() {
    return this.getErrorMessages().filter(this.isErrorMessageVisible).length;
  },

  getInvalidFields : function() {
    return this.getFields().filter(function(field) {
      return field.hasClass('validation-failed');
    });
  },

  getValidFields : function() {
    return this.getFields().filter(function(field) {
      return field.hasClass('validation-passed');
    });
  },

  getErrorMessages : function() {
    return this.errorMessages;
  },

  getErrorMessage : function(field) {
    return field.retrieve(this.options.fieldErrorMessageStorageKey);
  },

  getOrCreateErrorMessage : function(field) {
    var message = this.getErrorMessage(field);
    if(!message) {
      message = this.createErrorMessage(field);
      field.store(this.options.fieldErrorMessageStorageKey,message);
      this.errorMessages.push(message);
    }
    return message;
  },

  destroyErrorMessage : function(message) {
    message.destroy();
  },

  destroyAllErrorMessages : function() {
    this.getErrorMessages().each(this.destroyErrorMessage);
  },

  reset : function() {
    this.enableFields();
    this.destroyAllErrorMessages();
  },

  revert : function() {
    this.destroyAllErrorMessages();
    var form = this.getForm();
    form.addEvent = form._addEvent.bind(form);
    delete this.getFormValidator();
  },

  cancel : function() {
    this.stop();
    this.reset();
  },

  destroy : function() {
    this.revert();
    this.getForm().destroy();
  }

});
