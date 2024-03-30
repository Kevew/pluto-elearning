const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// mongoDB User information Model
const User = require('../models/userInfoModel');
// mongoDB User Verification Model
const UserVerf = require('../models/userVerfModel');

// Remainder to get a phone number for the gmail's two step auth so that we are not
// using Kevin's phone number forever
const transporter = nodemailer.createTransport({
    host: "localhost:3010",
    port: 3011,
    secure: true,
    service: 'gmail',
    auth: {
      user: "plutolearning4@gmail.com",
      pass: "zxvj nyhd moke iyti",
    },
});

// Function to actually send the verification Email
async function sendVerfEmail(email, _id){

    // Server URL
    let currentUrl = "http://localhost:3010/";

    // Unique Identification for verification link
    let uniqueId = _id;

    // Information about the email
    let mailOptions = {
        from: 'plutolearning4@gmail.com',
        to: email,
        subject: "Pluto Verification Email",
        html: `<p>Verify your email address to complete the signup process.</p> \
               <p>This link will expire within 5 minutes.</p> \
               <p>Press <a href=${currentUrl + "api/verify/" + uniqueId}>here</a> to proceed</p>`
    };

    return await transporter.sendMail(mailOptions);
};

// User Signup
router.post('/signup', async function(req, res){
    let {username, email, password} = req.body;
    username = username.trim();
    email = email.trim();
    password = password.trim();
    // Check for valid inputs
    if (username == "" || email == "" || password == ""){
        res.status(400).json({
            status: "FAILED",
            message: "A Empty Input has been given!"
        });
    }else if(!/^[a-z0-9A-Z]+$/.test(username)){
        // Checking if username only consists of alphanumeric characters
        res.status(400).json({
            status: "FAILED",
            message: "Invalid Username Format!"
        });
    }else if(!/^\S+@\S+\.\S+$/.test(email)){
        // For email, it's impossible to check every possible email. 
        // Thus, this email is just a sanity check
        // The code is sending a email confirmation later anyways
        res.status(400).json({
            status: "FAILED",
            message: "Invalid Email Format!"
        });
    }else if(3 > password.length || password.length >= 30){
        res.status(400).json({
            status: "FAILED",
            message: "Invalid Password Length!"
        });
    }else{
        User.find({username: username, email: email}).then(async result => {
            if(result.length){
                //Username already exists
                res.status(500).json({
                    status: "FAILED",
                    message: "User already exists!"
                });
            }else{
                //Delete userverf items with same username/email
                try{
                    await UserVerf.deleteMany({username: username, email: email});
                }catch{
                    res.status(500).json({
                        status: "FAILED",
                        message: "Unable to delete previous users!"
                    });
                    return;
                }
                //Create new User Verification Document
                let newUser = new UserVerf();
                newUser.username = username;
                newUser.email = email;
                newUser.password = password;
                newUser.createdAt = new Date();
                // The expiresAt variable is exactly 5 minute after createdAt
                newUser.expiresAt = new Date(Date.now() + 300000);
                newUser.id = newUser._id.toString()
                
                // Adds the document to the userverification collection in database
                newUser.save().then(async result => {
                    // Sends verification email to user
                    try{
                        await sendVerfEmail(email, newUser._id.toString());
                    }catch{
                        res.status(500).json({
                            status: "FAILED",
                            message: "An error has occured when sending Verification Email!"
                        });
                        return;
                    }
                    res.status(500).json({
                        status: "PENDING",
                        message: "Verification Email Has been sent!",
                        data: result,
                    });
                }).catch(err => {
                    res.status(500).json({
                        status: "FAILED",
                        message: "An error has occured when saving user account!"
                    });
                })

                //NOTE TO SELF, MAKE SURE TO ADD O-AUTH LATER
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                status: "FAILED",
                message: "An error has occured when searching for the existing user!"
            });
        })
    }
});

// User Verification
router.get('/verify/:_id', async function(req, res){
    let userId = req.params._id;
    UserVerf.find({id : userId}).then(result => {
        if(result.length > 0){
            // User verification document exists
            let info = result[0];
            // Check if user verification document expired or not
            if(info.expiresAt >= Date.now()){
                let newUser = new User();
                newUser.username = info.username;
                newUser.email = info.email;
                newUser.password = info.password;
                newUser.userLevel = 1;
                newUser.courses = new Map();
                newUser.achievements = [];
                newUser.dateJoined = Date.now();

                newUser.save().then().catch(err => {
                    res.status(500).json({
                        status: "FAILED",
                        message: "An error has occured when saving user account!"
                    });
                })
            }
            // Deletes the verification document no matter what
            UserVerf.deleteOne({id: userId}).then().catch(err => {
                res.status(500).json({
                    status: "FAILED",
                    message: "A error has occured when clearing up expired user verification"
                });
            })
        }else{
            res.status(400).json({
                status: "FAILED",
                message: "User verification not found. Please sign up or log in."
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            status: "FAILED",
            message: "An error has occured when searching for the user verification!"
        });
    });
});


// User Verification
router.post('/login', async function(req, res){
    let email = req.body.email;
    let pwd = req.body.pwd;
    User.find({email: email, password: pwd}).then(result => {
        if(result.length > 0){
            res.status(200).json({
                status: "SUCCESS",
            })
        }else{
            res.status(200).json({
                status: "FAILED",
                message: "Unable to find user account based on login info!"
            })
        }
    }).catch(err => {
        res.status(500).json({
            status: "FAILED",
            message: "Internal Server Error"
        })
    })
});

module.exports = router;