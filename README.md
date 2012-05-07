# MooTools-Formular2

Formular2 is a step up from its predessor "Formular". The tool provides a sophisticated, yet user-friendly form validation experience by placing error validation tool tips inline with their erroneous input fields. Formular2 is built atop of the MooTools-Form.Validator plugin (found in the more library) and all of the error handling functionality is delegated to the Form.Validator plugin from Formular2.

## New Features

Formular2 includes various new features that were put into consideration during its design:

* onSubmit, onFormSubmit methods are now frozen so that when, and only when, the form is valid then will the normal onSubmit method be fired. All prior onSubmit events that have been attached to the form will be buffered during validation.
* The entire Formular class has been refeactored to be its own class which doesn't extend the Form.Validator class anymore.
* Suggestions are now included into the tool tip which the user can click on to populate the given field.
* Fieldsets can be validated alongside a error tip validator appearing within its DOM element.
* Custom errors can be attached to input fields and fieldsets and can be assigned to be continuous or one-time.
* Tooltips will position themselves properly when cut off on the right side of the page.
* Tooltips can include a countdown delay which will hide the tooltip after a certain amount of seconds once displayed.
* The old Formular tooltip graphics have been condensed into a single sprite.
* Scrolling now doesn't cause the page to jump up and down anymore (due to a focus on an input element).

## More Documentation Coming Soon...

Once the plugin is 100% complete, YOM will feature a full documentation page complete with multiple examples and demo code.
