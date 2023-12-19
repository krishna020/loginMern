const express = require('express')
const { body, validationResult } = require('express-validator');
const router = express.Router();
const userSchema = require('../model/user.model')
const mongoose = require('mongoose')
const upload = require('../helpers/upload')
//const jwt=require('../helpers/jwt')

router.post('/create_user', [
    // Validate first_name
    body('name').notEmpty().withMessage(' name is required'),

    // Validate last_name
    body('mobile_number').notEmpty().withMessage('mobile number is required').isLength({ min: 10, max: 10 }).withMessage('mobile number should be 10 digit'),

    // Validate email
    body('email').isEmail().withMessage('Invalid email address'),

    body('latitude').notEmpty().withMessage('latitude is required'),

    body('longitude').notEmpty().withMessage('longitude is required'),

    // Validate password
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    // Validate confirm_password
    body('confirm_password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
        .withMessage('Passwords do not match'),
], (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    else {
        const userData = new userSchema({
            name: req.body.name,
            mobile_number: req.body.mobile_number,
            email: req.body.email,
            password: req.body.password,
            profile_pics: req.body.profile_pics,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            isAdmin:req.body.isAdmin
        })

        userData.save()
            .then((data) => {
                res.status(201).json({
                    status: true,
                    message: 'userData is created',
                    userDetails: data
                })
            })
            .catch((err) => {
                res.status(400).json({
                    status: false,
                    message: err
                })
            })
    }
})

// update the user details

router.put('/update_user/:id', [
    body('first_name').optional().notEmpty().withMessage('Please enter the first name'),
    body('last_name').optional().notEmpty().withMessage('last name cannot be empty'),
    body('email').optional().notEmpty().withMessage('Please Enter the email'),
    body('password').optional().notEmpty().withMessage('please enetr the password')
], async (req, res) => {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // validate the objectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

        return res.status(400).json({ error: 'Invalid ObjectId' });
    }
    try {
        {
            const userDetails = await userSchema.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true, runValidators: true },
            )

            if (userDetails) {
                return res.status(200).json({
                    status: true,
                    message: 'user data is updated.',
                    updated_user: userDetails
                })
            }
            else {
                return res.status(400).json({
                    status: false,
                    message: 'User Not Found'
                })
            }
        }

    }
    catch (err) {
        return res.status(500).json({
            status: false,
            message: 'Internal server Error'
        })
    }
})

// get router
router.get('/get_user', async (req, res) => {
    try {
        const userData = await userSchema.find({})
        if (userData.length > 0) {
            return res.status(200).json({
                status: true,
                message: 'userDetails is fetched.',
                userData: userData
            })
        }
        else {
            return res.status(404).json({
                status: false,
                message: 'User Not Found'
            })
        }
    }
    catch (err) {
        //console.error(`Error in /get_user: ${err.message}`);
        // console.error(err.stack);
        console.error(err.message)
        return res.status(500).json({
            status: false,
            message: 'Internal server Error'
        })
    }
})

// find by id
router.get('/get_user/:id', async (req, res) => {
    // validate the objectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

        return res.status(400).json({ error: 'Invalid ObjectId' });
    }
    try {
        const userData = await userSchema.findOne({ _id: req.params.id })
        if (userData) {
            return res.status(200).json({
                status: true,
                message: ` ${req.params.id} userDetails is fetched.`,
                userData: userData
            })
        }
        else {
            return res.status(404).json({
                status: false,
                message: 'User Not Found'
            })
        }
    }
    catch (err) {
        console.error(err.message)
        return res.status(500).json({
            status: false,
            message: 'Internal server Error'
        })
    }
})



// Endpoint to get 5 nearest users based on latitude and longitude
router.get('/nearby/:userId', async (req, res) => {
    try {
        const currentUser = await userSchema.findById(req.params.userId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const nearbyUsers = await userSchema.find({
            _id: { $ne: currentUser._id }, // Exclude the current user
            latitude: { $gte: currentUser.latitude - 5, $lte: currentUser.latitude + 5 },
            longitude: { $gte: currentUser.longitude - 5, $lte: currentUser.longitude + 5 },
        }).limit(5);

        res.json(nearbyUsers);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//login api

router.post('/login', async (req, res) => {
    try {
        const userDetails = await userSchema.findOne({ email: req.body.email });
        console.log('userDetails :' + userDetails)

        if (!userDetails) {
            return res.status(400).json({
                status: false,
                message: 'User not found',
            });
        }

        const isPasswordValid = bcrypt.compare(req.body.password, userDetails.password);
        console.log("isPasswordValid : " + isPasswordValid)

        if (isPasswordValid) {
            const token = jwt.sign({ userId: userDetails._id, isAdmin: userDetails.isAdmin }, process.env.secret, { expiresIn: '1d' });

            return res.json({ user: userDetails.email, token: token });
        } else {
            res.status(400).json({
                status: false,
                message: 'Invalid username or password',
            });
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
});

// using aggregation
router.get('/aggregation', async (req, res) => {
    try {
        const aggregatedData = await userSchema.aggregate([
            {
                $group: {
                    _id: '$isAdmin',
                    count: { $sum: 1 }
                }
            }
        ]);
        if (aggregatedData) {
            return res.status(200).json({
                status: true,
                message: 'Aggregation Data',
                data: aggregatedData
            });
        }

        else {
            return res.status(400).json({
                status: false,
                message: 'something went wrong'
            });
        }


    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: 'Internal Server Error',
        });
    }
})


module.exports = router