var nodemailer = require('nodemailer');
require('dotenv').config();
const { CaptureErrorsSchema } = require('./../Common-Model-Routes/Models/Error.model')

module.exports = {

    sendEmail: function (req, res, next, { admin }) {
        //sending email from 

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dineout2018@gmail.com',
                pass: 'dineout@2018'
            }
        });
        let href = `http://localhost:${process.env.PORT}/kitchen/verifyEmail/?id=${admin._id}`

        // sending mail to 
        var mailOptions = {
            from: 'dineout2018@gmail.com',
            to: admin.email,
            subject: 'Sending Email from Kitchen Portal',
            // text: 'That was easy node class Today!'


            //html for email

            html: `<!DOCTYPE html>
                        <html>
                        <head>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
                        <style>
                        .card {
                            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                            max-width: 300px;  margin: auto;  text-align: center; font-family: arial;
                        }
                        
                        .title { color: grey;font-size: 18px;
                        }
                        
                        p {
                            border: none; outline: 0;
                            display: inline-block;padding: 8px;
                            color: white;  background-color: #000;text-align: center;
                            cursor: pointer;  width: 100%; font-size: 18px;
                        }
                        
                        button {
                            text-decoration: none;
                            font-size: 22px;
                            color: black;
                        }
                        
                        button:hover, a:hover {
                            opacity: 0.7;
                        }
                        </style>
                        </head>
                        <body>
                        
                        <h2 style="text-align:center">Welcome ${admin.kitchen_name}</h2>
                        
                        <div class="card">
                            <img src="https://www.w3schools.com/w3images/team2.jpg" alt="John" style="width:100%">
                            <h1>${admin.kitchen_name}</h1>
                            <p class="title">Thanku.</p>
                        
                            <button><a href=${href} active">Verify Email</a></button>
                        </div>
                        
                        </body>
                    </html>`

        };
        //console.log(mailOptions)
        //sending email method or function
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {

                // this will capture if error comes in email sent 
                errs = new CaptureErrorsSchema({
                    error: error,
                    errorRoute: 'KitchenSignup ',
                    errorMethod: 'Transporter_email',
                    email: req.body.email,
                    kitchen_name: req.body.kitchen_name


                });
                console.log(error)

                errs.save();
                return res.status(401).send({ errors: [{ "msg": error}] });

            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).send({ success: [{ "msg": `Successfully send email ${info.response}` }] });
            }
        });


    },
}
