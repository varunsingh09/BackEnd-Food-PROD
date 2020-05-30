const express = require('express');
var nodemailer = require('nodemailer');
// var config = require('../../config');
require('dotenv').config();
const router = express.Router();

const { CustomerSignupSchema } = require('../Models/CustomerSignup.Model');
const {
  CaptureErrorsSchema,
} = require('./../../Common-Model-Routes/Models/Error.model');
const {
  CustomerCardStatusSchema,
} = require('../Models/CustomerCardStatus.Model');
const {
  CustomerSubscriptionsSchema,
} = require('../Models/CustomerSubscriptions.Model');
const {
  CustomerBillingAddressSchema,
} = require('../Models/CustomerBillingAddress.Model');
const { CustomerPlanSchema } = require('../Models/CustomerActivePlan.Model');
const { CustomerOrderSchema } = require('../Models/CustomerOrder.Model');
const {
  CustomerDeliveryAddressSchema,
} = require('../Models/CustomerDeliveryAddress.Model');

const {
  MealPackagesSchema,
} = require('../../MasterAdmin-Portal/Models/MMealPackage.Model');

var jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const {
  jwtSignin,
  jwtVerifyToken,
  authenticateToken,
} = require('../../middleware/jwt');
const {
  validateMeChecks,
  serving_zipcodes,
  CustomerSignInValidations,
  CustomerSignUpValidations,
  CustomerSubscriptionValidations,
  free_plates_discount_codes,
  RecurringBillingValidations,
} = require('../../middleware/utills');
//const {  validateMeChecks, serving_zipcodes, CustomerSignInValidations, CustomerSignUpValidations, CustomerSubscriptionValidations, free_plates_discount_codes, RecurringBillingValidations } = require('../../middleware/utills');
const bcrypt = require('bcrypt');
const rounds = 10;
const stripe = require('stripe')(process.env.StripeSecretKey);

// Customer SignUP API for first time registration
// Post - localhost:3001/Customer/CustomerSignup

router.post('/CustomerSignup', CustomerSignUpValidations, async function (
  req,
  res,
  next
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(200)
      .json({ errors: errors.array({ onlyFirstError: true }) });
  }

  let zip = serving_zipcodes.find((zipcode) => zipcode == req.body.zipcode);
  if (zip === undefined) {
    return res
      .status(500)
      .json({ errors: 'We do not serve to this Zipcode !!!' });
  }

  let admin = await CustomerSignupSchema.findOne({ email: req.body.email });

  if (admin) {
    return res.status(500).json({ errors: 'This email already exit!!!' });
  }

  try {
    let stripeCustomer = await stripe.customers.list({ email: req.body.email });

    if (stripeCustomer.data.length > 0) {
      let del = await stripe.customers.del(stripeCustomer.data[0].id);
    }

    let CreateStripeCustomer = await stripe.customers.create({
      email: req.body.email,
      name: req.body.firstName + ' ' + req.body.lastName,
    });

    let hashPassword = bcrypt.hashSync(req.body.password, rounds);

    admin = new CustomerSignupSchema({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      zipcode: req.body.zipcode,
      email: req.body.email,
      password: hashPassword,
      // device_type:req.body.device_type,
      // isPaymentAvaiable:req.body.isPaymentAvaiable,
      // status:true,
      stripe_customer_id: CreateStripeCustomer.id,
    });

    await admin.save();

    //sending email from
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dineout2018@gmail.com',
        pass: 'dineout@2018',
      },
    });

    // sending mail to
    var mailOptions = {
      from: 'dineout2018@gmail.com',
      to: 'Syedhaq5511@gmail.com', // req.body.email
      subject: 'Sending Email using Node.js test mail',
      text: 'Thank you for signing up!',
    };

    //sending email method or function
    let mailSentResp = await transporter.sendMail(mailOptions);

    return res.status(200).send({
      response: admin,
      route: 'https://yahoo.com',
      msg: 'Successfully Created ',
      cust_id: CreateStripeCustomer.id,
    });
  } catch (error) {
    let str = `E11000 duplicate key error collection: FirstFoodApp.customersignups index`;
    console.log(error);
    // This below code will capture error and store it to ERROR collection
    errs = new CaptureErrorsSchema({
      error: error,
      errorType: 'CustomerSignup',
      email: req.body.email,
      route: '',
      stripe_id: 'test',
    });

    await errs.save();

    if (error.name === 'MongoError' && error.code === 11000) {
      let ermsg = error.errmsg
        .replace(str, `Duplicate key `)
        .replace(/[':'",.<>\{\}\[\]\\\/]/gi, '')
        .replace('dup key', '')
        .replace('_1', ' :');
      console.log(error, '-------', ermsg);
      return res.status(500).json({ errors: [{ msg: ermsg }] });
    } else {
      return res.status(500).json({ errors: [{ error: error }] });
    }
  }
});

router.post(
  '/CustomerSubscription',
  CustomerSubscriptionValidations,
  async function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ errors: errors.array({ onlyFirstError: true }) });
    }

    try {
      let body = req.body;

      let errors = { errors: [] };
      let errorExist = false;

      // Check if this user already exisits
      let customer = await CustomerSignupSchema.findOne({
        email: req.body.email,
        stripe_customer_id: body.stripe_customer_id,
      });

      if (customer == null) {
        errorExist = true;
        errors.errors.push({
          msg: 'Email and stripe customer id does not match.',
        });
        //return res.status(200).json({ errors: [{ "msg": 'Email and stripe customer id does not match.' }] });
      }

      //check if delivery address exists
      let delivery_address = await CustomerDeliveryAddressSchema.findOne({
        email: req.body.email,
      });
      if (delivery_address == null && !body.delivery_address) {
        errorExist = true;
        errors.errors.push({ msg: 'Delivery address is required.' });
      }

      if (body.zipcode) {
        let zip = serving_zipcodes.find((zipcode) => zipcode == body.zipcode);
        if (zip === undefined) {
          errorExist = true;
          errors.errors.push({ msg: 'We do not serve to this Zipcode !!!.' });
          //return res.status(500).json({ errors:'We do not serve to this Zipcode !!!'});
        }
      }

      if (customer == null) {
        errorExist = true;
        errors.errors.push({
          msg: 'Email and stripe customer id does not match.',
        });
        //return res.status(200).json({ errors: [{ "msg": 'Email and stripe customer id does not match.' }] });
      }

      //attach payment method with customer
      try {
        var attach = await stripe.paymentMethods.attach(
          body.stripe_payment_method_id,
          { customer: body.stripe_customer_id }
        );
      } catch (e) {
        errorExist = true;
        errors.errors.push({ msg: 'Payment method does not exist.' });
      }
      // console.log('attach',attach);
      // //save card status to mongo
      if (attach) {
        let query = { email: req.body.email },
          update = {
            customer_stripe_id: body.stripe_customer_id,
            stripe_payment_method_id: body.stripe_payment_method_id,
          },
          options = { upsert: true, new: true, setDefaultsOnInsert: true };

        await CustomerCardStatusSchema.findOneAndUpdate(query, update, options);
      }

      //create stripe subscription

      let existingSubscription = await CustomerSubscriptionsSchema.find({
        stripe_customer_id: body.stripe_customer_id,
        status: true,
      });

      if (existingSubscription.length > 0) {
        errorExist = true;
        errors.errors.push({ msg: 'Subscription already exist.' });
        //return res.status(200).json({ "meessage": "Subscription already exist."});
      }

      let mealPackage = await MealPackagesSchema.find({
        stripe_plan_id: body.stripe_plan_id,
        status: true,
      });

      if (mealPackage.length == 0) {
        errorExist = true;
        errors.errors.push({ msg: 'Meal plan does not exist Or inactive' });
        //return res.status(200).json({ "meessage": "Meal plan does not exist."});
      }

      if (errorExist) {
        return res.status(422).json(errors);
      }

      let stripe_subscription = await stripe.subscriptions.create({
        customer: body.stripe_customer_id,
        items: [{ plan: body.stripe_plan_id }],
        default_payment_method: body.stripe_payment_method_id,
        cancel_at_period_end: true,
      });

      if (stripe_subscription.status != 'active') {
        errorExist = true;
        errors.errors.push({ msg: 'Subscription failed.' });
        //return res.status(200).json({ "meessage": "Subscription failed."});
      }

      if (errorExist) {
        return res.status(422).json(errors);
      }

      let free_plates_discount = { code: '', plates: 0 };
      if (body.discount_code) {
        free_plates_discount = free_plates_discount_codes.find(
          (discount) => discount.code == body.discount_code
        );
      }
      if (free_plates_discount == undefined) {
        free_plates_discount = { code: '', plates: 0 };
      }

      //save subscription to mongo
      let admin = new CustomerSubscriptionsSchema({
        email: body.email,
        stripe_customer_id: body.stripe_customer_id,
        stripe_subscription_id: stripe_subscription.id,
        stripe_plan_id: body.stripe_plan_id,
        stripe_product_id: stripe_subscription.plan.product,
        package_type: mealPackage[0].package_type,
        plates: mealPackage[0].plates,
        free_plates: free_plates_discount.plates,
        freePlateCoupon_no: free_plates_discount.code,
        total_plates_tobe_serverd:
          mealPackage[0].plates + free_plates_discount.plates,
        // stripe_dicount_code : ,
        // discount_type : ,
        total_charged: stripe_subscription.plan.amount / 100,
      });

      await admin.save();

      //save active_plan to mongo

      let query = { email: body.email },
        update = {
          stripe_customer_id: body.stripe_customer_id,
          package_type: mealPackage[0].package_type,
          price_perplate:
            stripe_subscription.plan.amount / 100 / mealPackage[0].plates,
          total_price: stripe_subscription.plan.amount / 100,
          stripe_plan_id: body.stripe_plan_id,
          stripe_product_id: stripe_subscription.plan.product,
          stripe_subscription_id: stripe_subscription.id,
          plates: mealPackage[0].plates,
        },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

      await CustomerPlanSchema.findOneAndUpdate(query, update, options);

      //save billing address to mongo
      if (body.billing_address) {
        let query = { email: body.email },
          update = { billing_address: body.billing_address },
          options = { upsert: true, new: true, setDefaultsOnInsert: true };

        await CustomerBillingAddressSchema.findOneAndUpdate(
          query,
          update,
          options
        );
      }

      //save delivery address to mongo
      if (body.delivery_address) {
        let delivery_address = new CustomerDeliveryAddressSchema({
          email: body.email,
          delivery_address: body.delivery_address,
          city: body.city ? body.city : '',
          state: body.state ? body.state : '',
          zipcode: body.zipcode ? body.zipcode : '',
          address_type: body.address_type ? body.address_type : '',
        });

        await delivery_address.save();
      }

      return res.status(200).send({
        response: admin,
        msg: 'Successfully Created ',
        stripe_subscription_id: stripe_subscription.id,
      });
    } catch (error) {
      let str = `E11000 duplicate key error collection: FirstFoodApp.customersignups index`;
      console.log(error);
      // This below code will capture error and store it to ERROR collection
      errs = new CaptureErrorsSchema({
        error: error,
        errorType: 'CustomerSignup',
        email: req.body.email,
        route: '',
        stripe_id: 'test',
      });

      await errs.save();

      if (error.name === 'MongoError' && error.code === 11000) {
        let ermsg = error.errmsg
          .replace(str, `Duplicate key `)
          .replace(/[':'",.<>\{\}\[\]\\\/]/gi, '')
          .replace('dup key', '')
          .replace('_1', ' :');
        console.log(error, '-------', ermsg);
        return res.status(500).json({ errors: [{ msg: ermsg }] });
      } else {
        return res.status(500).json({ errors: [{ error: error }] });
      }
    }
  }
);

router.post(
  '/CustomerLogin',
  CustomerSignInValidations,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ errors: errors.array({ onlyFirstError: true }) });
    }

    // Check if this user already exisits
    let customer = await CustomerSignupSchema.findOne({
      email: req.body.email,
    });
    if (customer == null) {
      return res.status(200).json({
        errors: [
          {
            msg:
              'Customer does not exisits! Or deactivated, Please contact Administrator.',
          },
        ],
      });
    }

    let compPassword = bcrypt.compareSync(req.body.password, customer.password);

    if (compPassword == false) {
      return res.status(200).json({
        errors: [
          {
            msg:
              'Incorrect Password!! Or  Account deactivated, Please check login details.',
          },
        ],
      });
    } else {
      let customerId = customer._id;

      let subscription = await CustomerSubscriptionsSchema.findOne({
        email: req.body.email,
        status: true,
      });
      let status = {};
      if (subscription) {
        status['subscription_active'] = true;
      } else {
        status['subscription_active'] = false;
      }

      let paymentMethod = await CustomerCardStatusSchema.findOne({
        email: req.body.email,
        status: true,
      });

      if (paymentMethod) {
        status['payment_method_status'] = true;
      } else {
        status['payment_method_status'] = false;
      }

      console.log(customer);

      try {
        let token = jwtSignin(req, res, next, {
          adminId: customerId,
          admin: customer,
          status: status,
        });

        // return res.status(200).json({});
      } catch (err) {
        return next(err);
      }
    }
  }
);

router.post(
  '/RecurringBilling',
  RecurringBillingValidations,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) });
    }
    try {
      let body = req.body;

      let activePlan = await CustomerPlanSchema.find({
        email: body.email,
        status: true,
      });

      if (activePlan.length == 0) {
        return res.status(422).json({ msg: 'No active plan' });
      }
      // console.log(activePlan);
      let activePlanOrdersCount = await CustomerOrderSchema.countDocuments({
        customer_email: body.email,
        order_status: true,
        stripe_subscription_id: activePlan[0].stripe_subscription_id,
      });

      let subscription = await CustomerSubscriptionsSchema.findOne({
        email: body.email,
        status: true,
        stripe_subscription_id: activePlan[0].stripe_subscription_id,
      });

      console.log(subscription);
      if (subscription) {
        if (activePlanOrdersCount < subscription.total_plates_tobe_serverd) {
          return res.status(200).json({
            activePlan: activePlan,
            msg: `Active plan has ${
              subscription.total_plates_tobe_serverd - activePlanOrdersCount
            } plates left.`,
          });
        }
      }

      //make subscription inactive
      let query = {
          email: body.email,
          stripe_subscription_id: activePlan[0].stripe_subscription_id,
        },
        update = {
          status: false,
        },
        options = { upsert: false, new: true, setDefaultsOnInsert: true };

      await CustomerSubscriptionsSchema.findOneAndUpdate(
        query,
        update,
        options
      );

      //get payment method
      let paymentMethod = await CustomerCardStatusSchema.findOne({
        email: req.body.email,
        status: true,
      });

      //new subscription
      let stripe_subscription = await stripe.subscriptions.create({
        customer: activePlan[0].stripe_customer_id,
        items: [{ plan: activePlan[0].stripe_plan_id }],
        default_payment_method: paymentMethod.stripe_payment_method_id,
        cancel_at_period_end: true,
      });

      if (stripe_subscription.status != 'active') {
        //make plan inactive
        let query = {
            email: body.email,
            stripe_plan_id: activePlan[0].stripe_plan_id,
          },
          update = {
            status: false,
            status_reason: 'card declined.',
          },
          options = { upsert: false, new: false, setDefaultsOnInsert: true };

        await CustomerPlanSchema.findOneAndUpdate(query, update, options);

        return res.status(422).json({ meessage: 'Subscription failed.' });
      }

      let free_plates_discount = { code: '', plates: 0 };
      if (body.discount_code) {
        free_plates_discount = free_plates_discount_codes.find(
          (discount) => discount.code == body.discount_code
        );
      }
      if (free_plates_discount == undefined) {
        free_plates_discount = { code: '', plates: 0 };
      }

      //save subscription to mongo
      let new_subscription = new CustomerSubscriptionsSchema({
        email: activePlan[0].email,
        stripe_customer_id: activePlan[0].stripe_customer_id,
        stripe_subscription_id: stripe_subscription.id,
        stripe_plan_id: activePlan[0].stripe_plan_id,
        stripe_product_id: stripe_subscription.plan.product,
        package_type: activePlan[0].package_type,
        plates: activePlan[0].plates,
        free_plates: free_plates_discount.plates,
        freePlateCoupon_no: free_plates_discount.code,
        total_plates_tobe_serverd:
          activePlan[0].plates + free_plates_discount.plates,
        // stripe_dicount_code : ,
        // discount_type : ,
        total_charged: stripe_subscription.plan.amount / 100,
      });

      await new_subscription.save();

      let query = { email: body.email };
      let update = { stripe_subscription_id: stripe_subscription.id };
      let options = { upsert: false, new: false, setDefaultsOnInsert: true };

      await CustomerPlanSchema.findOneAndUpdate(query, update, options);

      return res.status(200).json({
        subscription: new_subscription,
        msg: `Successfully Subscribed.`,
      });
    } catch (error) {
      let str = `E11000 duplicate key error collection: FirstFoodApp.customersignups index`;
      console.log(error);
      // This below code will capture error and store it to ERROR collection
      errs = new CaptureErrorsSchema({
        error: error,
        errorType: 'CustomerSignup',
        email: req.body.email,
        route: '',
        stripe_id: 'test',
      });

      await errs.save();

      if (error.name === 'MongoError' && error.code === 11000) {
        let ermsg = error.errmsg
          .replace(str, `Duplicate key `)
          .replace(/[':'",.<>\{\}\[\]\\\/]/gi, '')
          .replace('dup key', '')
          .replace('_1', ' :');
        console.log(error, '-------', ermsg);
        return res.status(500).json({ errors: [{ msg: ermsg }] });
      } else {
        return res.status(500).json({ errors: [{ error: error }] });
      }
    }
  }
);

module.exports = router;
