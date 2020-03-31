const express = require('express');
var nodemailer = require('nodemailer');
var QRCode = require('qrcode')
const router = express.Router();
const uuidv4 = require('uuid/v4');
const { KitchenSignupSchema } = require('../../Kitchen-Portal/Models/KSignup-model')
const { CustomerOrderSchema } = require('./../../Customer-Portal/Models/CustomerOrder.Model')



// Post -  Customer Order 
//localhost:3001/orders/CustomerOrder 

// This is ORDER route to store customer order with QRCODE ,


router.post('/CustomerOrder', async function (req, res, next) {
return res.send({"success":"success"})

    // const errors = validationResult(req);


    // if (!errors.isEmpty()) {
    //     return res.status(200).json({ errors: errors.array({ onlyFirstError: true }) });
    // }


    //  let ErrMsg=[];
    //  let IsalreadyExist=false;
 

    // let adminK = await KitchenSignupSchema.findOne({kitchen_name:req.body.kitchen_name});
    // if  (adminK!==null)
    // {
    //     IsalreadyExist=true;
    //     ErrMsg.push( {msg:"Kitchen already exist", param:'kitchen_name'} );
    //     //ErrMsg.Kitchen="Kitchen already exist";
        
    // }
 
    // let adminE = await KitchenSignupSchema.findOne({email:req.body.email});
    // if  (adminE!==null)
    // {
    //     IsalreadyExist=true;
    //     ErrMsg.push({msg:"Email already exist",param:'email'});
    //     //ErrMsg.Email="Email already exist";
       
    // }
     
    // let adminP = await KitchenSignupSchema.findOne({phone_no:req.body.phone_no});
    // if  (adminP!==null)
    // {
    //     IsalreadyExist=true;
    //     ErrMsg.push({msg:"Phone already exist",param:'phone'});
    //     //ErrMsg.Phone="Phone already exist";
       
    // }
    

    // if (IsalreadyExist) {
    //     return res.status(200).json({ errors: ErrMsg });

         


    // } else {




    // try {

    //     let u_id = Math.floor(Math.random() * 100 + 1);
    //     admin = new CustomerOrderSchema({

            
    //          customer_email:req.body.customer_email,
    //          order_no:u_id,
    //          stripe_transaction:req.body.stripe_transaction,
    //          kitchen_name:req.body.kitchen_name,
    //          item_type:req.body.item_type,
    //          item_name:req.body.item_name,
    //          order_status :req.body.order_status,
    //          delivery_status:req.body.delivery_status,
    //          QR_CODE:req.body.QR_CODE,
           
            
    //     });


    //     await admin.save();


       
    //     //sending email from 
    //     var transporter = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //             user: 'dineout2018@gmail.com',
    //             pass: 'dineout@2018'
    //         }
    //     });
    //     let href = `http://localhost:3001/kitchen/verifyEmail/?id=${admin._id}`

    //     // sending mail to 
    //     var mailOptions = {
    //         from: 'dineout2018@gmail.com',
    //         to: 'Syedhaq5511@gmail.com',// req.body.email
    //         subject: 'Sending Email using Node.js test mail',
    //        // text: 'That was easy node class Today!'


    //         //html for email

    //         html: `<!DOCTYPE html>
    //                         <html>
    //                         <head>
    //                         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    //                         <style>
    //                         .card {
    //                             box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    //                             max-width: 300px;  margin: auto;  text-align: center; font-family: arial;
    //                         }
                            
    //                         .title { color: grey;font-size: 18px;
    //                         }
                            
    //                         p {
    //                             border: none; outline: 0;
    //                             display: inline-block;padding: 8px;
    //                             color: white;  background-color: #000;text-align: center;
    //                             cursor: pointer;  width: 100%; font-size: 18px;
    //                         }
                            
    //                         button {
    //                             text-decoration: none;
    //                             font-size: 22px;
    //                             color: black;
    //                         }
                            
    //                         button:hover, a:hover {
    //                             opacity: 0.7;
    //                         }
    //                         </style>
    //                         </head>
    //                         <body>
                            
    //                         <h2 style="text-align:center">Welcome ${req.body.firstName}</h2>
                            
    //                         <div class="card">
    //                             <img src="https://www.w3schools.com/w3images/team2.jpg" alt="John" style="width:100%">
    //                             <h1>${req.body.firstName}</h1>
    //                             <p class="title">Thanku.</p>
                            
    //                             <button><a href=${href} active">Verify Email</a></button>
    //                         </div>
                            
    //                         </body>
    //                     </html>`

    //     };

    //     //sending email method or function
    //     transporter.sendMail(mailOptions, function(error, info) {
    //         if (error) {
                
    //             // this will capture if error comes in email sent 
    //                 errs = new CaptureErrorsSchema({
    //                 error: error,
    //                 errorRoute: 'CustomerOrder ',
    //                 errorMethod:'Transporter_email',
    //                 email: req.body.customer_email
                 
                   
                   
    //             });
        
    
    //             errs.save();

    //         } else {
    //             console.log('Email sent: ' + info.response);
    //         }
    //     });


    //     return res.status(200).send({ response: admin, 'route': 'https://yahoo.com','Msg': 'Successfully Created Master User' });


    // } catch (error) {
    //     let str = `E11000 duplicate key error collection: test.masteradminsignups index`

     
    //         // This below code will capture error and store it to ERROR collection 

    //         if(error.code !==11000){
                
    //             errs = new CaptureErrorsSchema({
    //                 error: error,
    //                 errorRoute: 'CustomerOrder',
    //                 email: req.body.customer_email,
                    
                   
                   
    //             });
        
    
    //             await errs.save();
    
    
    
    //         }
            


    //     if (error.name === 'MongoError' && error.code === 11000) {
    //     let ermsg = error.errmsg.replace(str, `Duplicate key `).replace(/[':'",.<>\{\}\[\]\\\/]/gi, "").replace('dup key', '').replace('_1',' :')            
    //     console.log(error,"-------",ermsg)   
    //     return res.status(200).json({ errors:[{'msg':ermsg}] });
    //     } else {
    //         next(error);
    //     }
    // }

});

//http://localhost:3001/orders/qrcode
router.get('/qrcode', async (req, res, next) => {

    let qrcode = req.body.qrcode;
    //console.log(req.query.qrcode)
  
    if (req.query.qrcode !== undefined) {
      qrcode = req.query.qrcode
    }
  
    // QRCode.toString(qrcode,{type:'svg'}, function (err, url) {
    //   console.log(url)
    //   res.send(url)
    // })
  
    var opts = {
      errorCorrectionLevel: 'H',
      type: 'svg',
      quality: 0.3,
      width: 300,
      margin: 1,
      color: {
        dark: "#010599FF",
        light: "#FFBF60FF"
      }
    }
  
    //qrcode = `${req.body.qrcode}${req.body.address}${req.body.mobile}${req.body.name}`
    console.log("-->>", qrcode)
    QRCode.toString(qrcode, opts, function (err, url) {
      console.log("terminal--->>>", url)
      res.send(url)
    })
  
  
  })
  
  
  

module.exports = router;