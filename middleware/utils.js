const { check } = require('express-validator');


//use for uplaod image
const multer = require('multer');
//end here====
//use for uplaod image


// Multer use for image upload set image directory location
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})



module.exports = {

    upload: multer({ storage: storage }),

    // Validation middleware check method for validation
    validateMeChecks: [
        check('email', 'Email Cannot be empty!').not().isEmpty().isEmail().withMessage('Email is not valid!'),
        //check('email').not().isEmpty().withMessage('Can not levave black').isEmail('Wrong email format'),
        //isLength({ min: 3, max: 50 }).withMessage('Name length in between 3 to 50 chars'),
        check('password').not().isEmpty().withMessage('Password Cant be Empty!').isLength({ min: 3, max: 5 }).withMessage('Password length in between 3 to 5 chars!'),
        check('zipcode').not().isEmpty().withMessage('Zipcode cant be Empty!').isLength({ min: 3, max: 6 }).withMessage('Zipcode length in between 3 to 6 chars!'),

    ],

    validateMealPackageFields: [
        check('package_type', 'Package Type is required 1.').not().isEmpty().withMessage('Please check Package Type.'),
        //check('email').not().isEmpty().withMessage('Can not levave black').isEmail('Wrong email format'),
        //isLength({ min: 3, max: 50 }).withMessage('Name length in between 3 to 50 chars'),
        check('days').not().isEmpty().withMessage('Days Cant be Empty!!'),
        check('price_perday').not().isEmpty().withMessage('Price Per Day cant be Empty!!').isLength({ min: 1, max: 5 }).withMessage('length max 5 character'),
        // check('stripe_plan_id').not().isEmpty().withMessage('stripe_plan_id Cant be Empty!!'),
    ],

    CustomerSignInValidations: [
        check('email', 'Email is required.').not().isEmpty().isEmail().withMessage('Please check email.'),
        //check('email').not().isEmpty().withMessage('Can not levave black').isEmail('Wrong email format'),
        //isLength({ min: 3, max: 50 }).withMessage('Name length in between 3 to 50 chars'),
        check('password').not().isEmpty().withMessage('Password Cant be Empty!!'),


    ],

    CustomerSignUpValidations: [
        check('email', 'Email is required.').not().isEmpty().isEmail().withMessage('Please check email.'),
        check('zipcode', 'Zipcode is not valid.').isLength({ min: 5, max: 5 }).not().isEmpty().withMessage('Zipcode Cant be Empty!!'),
        check('firstName', 'First Name is required.').not().isEmpty().withMessage('First Name is required!!'),
        check('lastName', 'Last Name is required.').not().isEmpty().withMessage('Last Name is required!!'),
        check('password', 'Password is required.').not().isEmpty().withMessage('Password is required!!'),

        //check('email').not().isEmpty().withMessage('Can not levave black').isEmail('Wrong email format'),
        //isLength({ min: 3, max: 50 }).withMessage('Name length in between 3 to 50 chars'),
        check('password').not().isEmpty().withMessage('Password Cant be Empty!!'),
    ],

    CustomerSubscriptionValidations: [
      check('email', 'Email is required.').not().isEmpty().isEmail(),
      check('stripe_customer_id', 'stripe_customer_id is required.').not().isEmpty(),
      check('stripe_payment_method_id', 'stripe_payment_method_id is required.').not().isEmpty(),
      check('stripe_plan_id', 'stripe_plan_id is required.').not().isEmpty(),
      check('days', 'days is reequired.').not().isEmpty(),

    ],

    RecurringBillingValidations : [
      check('email', 'Email is required.').not().isEmpty().isEmail(),
    ],




    item_type: [
        { value: 'MainCourse', label: 'MainCourse' },
        { value: 'Sides', label: 'Sides' },
        { value: 'Beverages', label: 'Beverages' }
    ],

    serving_temp: [
        { value: 'Hot', label: 'Hot' },
        { value: 'Cold', label: 'Cold' },
        { value: 'Frozen', label: 'Frozen' }
    ],

    allergic_ingredients: [
        { value: 'Nuts', label: 'Nuts' },
        { value: 'Milk', label: 'Milk' },
        { value: 'Soya', label: 'Soya' },
        { value: 'None', label: 'None' }
    ],

    special_markings: [
        { value: 'Veg', label: 'Veg' },
        { value: 'NoVeg', label: 'NonVeg' },
        { value: 'None', label: 'None' }
    ],



    serving_zipcodes: [60045, 60066, 60067, 6004, 8007, 45005, 45006, 45007, 45008, 45009],

free_plates_discount_codes: [{code : '123' , 'plates':2 } , {code : '345' , 'plates':5 }]

}
