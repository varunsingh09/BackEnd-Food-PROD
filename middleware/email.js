var nodemailer = require("nodemailer");
require("dotenv").config();

const {
  CaptureErrorsSchema,
} = require("./../Common-Model-Routes/Models/Error.model");

const { defaultTemplate } = require('./../EmailTemplates/Email_verify.temp');

module.exports = {
  sendEmail: function (req, res, next, { admin: admin, template = 'default' }) {
    //sending email from

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dineout2018@gmail.com",
        pass: "dineout@2018",
      },
    });

    // sending mail to
    var mailOptions = defaultTemplate(req, res, next, admin);
    console.log({ mailOptions, template })
    //sending email method or function
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // this will capture if error comes in email sent
        errs = new CaptureErrorsSchema({
          error: error,
          errorRoute: "KitchenSignup ",
          errorMethod: "Transporter_email",
          email: req.body.email,
          kitchen_name: req.body.kitchen_name,
        });
        console.log(error);

        errs.save();
        return res.status(401).send({ errors: [{ msg: error }] });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .send({
            success: [{ msg: `Successfully send email ${info.response}` }],
          });
      }
    });
  },
};
