/**
 * Copyright (C) 2012 by Matias Niemela
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
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
    allFieldsSelector : 'input,select,textarea',

    disabledFieldClassName : 'disabled',
    disableFieldsOnSubmit : true,

    disabledButtonClassName : 'disabled',
    disableButtonsOnSubmit : true,

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
    customFieldErrorMessageStorageKey : 'Formular:error-message',
    specialEventsStorageKey : 'Formular:Events',
    fieldProxyStorageKey : 'Formular-element-proxy',
    errorMessageVisibilityKey : 'visible'
  },

  initialize : function(form,options) {
    this.form = document.id(form);
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
        this.onBeforeSubmit(event);
        if(this.options.disableFieldsOnSubmit) {
          this.disableFields();
        }
        if(this.options.disableButtonsOnSubmit) {
          this.disableButtons();
        }
        this.onSubmit(event);
      }
      else {
        if(this.options.submitFormOnSuccess) {
          event.stop();
        }
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
    fields = fields || this.getAllFields();
    fields.each(this.enableField);
  },

  disableFields : function(fields) {
    fields = fields || this.getAllFields();
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

  disableButtons : function(buttons) {
    (buttons || this.getButtons()).each(this.disableButton,this);
  },

  disableButton : function(button) {
    button.disabled = true;
    button.addClass(this.options.disabledButtonClassName);
  },

  enableButtons : function(buttons) {
    (buttons || this.getButtons()).each(this.enableButton,this);
  },

  enableButton : function(button) {
    button.disabled = false;
    button.removeClass(this.options.disabledButtonClassName);
  },

  enable : function() {
    this.enableFields();
    this.enableButtons();
  },

  disable : function() {
    this.disableFields();
    this.disableButtons();
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
    message.store(this.options.errorMessageVisibilityKey,true);

    var isCustom = message.retrieve(this.options.customFieldErrorMessageStorageKey);
    if(isCustom) {
    }
    else {
      this.positionErrorMessageRelativeToField(field,message);
      var y = message.getPosition().y;
      message.setStyle('opacity',0);
      message.get('morph').start({
        'top':[y-5,y],
        'opacity':this.options.errorMessageOpacity || 1
      }).chain(function() {
        this.setSpecialFieldEvents(field);
        this.onShowErrorMessage(message);
      }.bind(this));
    }
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
      this.hideErrorMessageElement(message);
    }.bind(this));
  },

  hideErrorMessageElement : function(element) {
    element.hide();
    this.onHideErrorMessage(element);
  },

  hideAllErrorMessages : function() {
    var klass = this.options.errorMessageClassName;
    var messages = this.getForm().getElements('.' + klass);
    messages.each(this.hideErrorMessageElement, this);
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
    return field.retrieve(this.options.fieldProxyStorageKey,field);
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
      var that = this;
      var closeElement = message.getElement('.'+this.options.closeClassName);
      message.addEvent('click',function(event) {
        event.stop();
        var klass = that.options.errorMessageClassName;
        var box = this;
        box = box.hasClass(klass) ? box : document.id(this).getParent('.'+klass);
        if(box) {
          that.hideErrorMessage(box);
        }
      });
    }
  },

  setErrorMessageZIndex : function(index) {
    this.options.errorMessageZIndex = index;
  },

  getErrorMessageZIndex : function() {
    return this.options.errorMessageZIndex
  },

  createErrorMessage : function() {
    var elm = new Element('div',{
      'class' : this.options.errorMessageClassName,
      'html' : this.createErrorMessageHTML(),
      'styles' : {
        'position':'absolute',
        'top':-9999,
        'left':-9999,
        'z-index':this.getErrorMessageZIndex()
      }
    }).inject(document.body);

    elm.getElement('.title').set('html',this.options.errorMessageTitle);

    elm.setText = function(text) {
      document.id(this).getElement('.txt').set('html',text);
    };

    elm.getText = function() {
      document.id(this).getElement('.txt').get('html');
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
    this.fireEvent('validField', field);
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

    this.fireEvent('inValidField', field);
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

  setupCustomErrorMessageDisplayElement : function(field, element) {
    element.store(this.options.customFieldErrorMessageStorageKey, true);

    if(!element.setText) {
      element.setText = function(text) {
        element.set('html', text);
      };
    }

    if(!element.getText) {
      element.getText = function(text) {
        return element.get('html');
      };
    }

    field.store(this.options.fieldErrorMessageStorageKey, element);
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
    this.enableButtons();
    this.destroyAllErrorMessages();
  },

  revert : function() {
    this.destroyAllErrorMessages();
    var form = this.getForm();
    form.addEvent = form._addEvent.bind(form);
    delete this.getFormValidator();
  },

  cancel : function() {
    this.reset();
  },

  destroy : function() {
    this.revert();
    this.getForm().destroy();
  }

});
