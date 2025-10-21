const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { sendEmail } = require('../services/emailService');
// NOTE: We no longer need the SMS service here.

// Helper function to generate a JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- CONTROLLER FUNCTIONS (UPDATED) ---

// 1. Register User (Only sends Email OTP)
exports.register = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
    try {
        const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or phone number already exists.' });
        }

        const user = await User.create({ name, email, phoneNumber, password });

        // --- CHANGE: We only generate and send an email OTP now ---
        const emailOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        await Otp.create({ identifier: email, otp: emailOtp });
        await sendEmail(email, 'Verify Your Email for DASH', `Your DASH verification code is: <strong>${emailOtp}</strong>`);

        res.status(201).json({
            message: 'Registration successful! Please check your email for a verification code.',
            userId: user._id,
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// 2. Verify OTP (Only checks Email OTP)
exports.verifyOtp = async (req, res) => {
    // --- CHANGE: We only expect the emailOtp from the frontend ---
    const { userId, emailOtp } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // --- CHANGE: We only check for the email OTP record in the database ---
        const emailOtpRecord = await Otp.findOne({ identifier: user.email, otp: emailOtp });
        if (!emailOtpRecord) {
            return res.status(400).json({ message: 'Invalid or expired email verification code.' });
        }

        // --- CHANGE: If email is verified, we mark the phone as verified too to allow login ---
        user.isEmailVerified = true;
        user.isPhoneVerified = true; // Auto-verify phone to bypass the check
        await user.save();

        // Delete the used OTP
        await Otp.deleteMany({ identifier: user.email });

        // Generate a token and send success response
        res.status(200).json({
            message: 'Account verified successfully! You can now log in.',
            // We are NOT logging them in automatically anymore.
            // This is a better user experience, guiding them to the login page.
        });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};

// 3. Login User (No changes needed here, but included for completeness)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (!user.isEmailVerified || !user.isPhoneVerified) {
            return res.status(403).json({ message: 'Please verify your account before logging in.' });
        }
        res.json({
            message: "Login successful",
            token: generateToken(user._id),
            user: { _id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


// 4. Resend OTP (Only resends Email OTP)
exports.resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email not found.' });
        if (user.isEmailVerified) return res.status(400).json({ message: 'This account is already verified.' });
        
        // --- CHANGE: Only generate and resend an email OTP ---
        const emailOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        await Otp.deleteMany({ identifier: user.email });
        await Otp.create({ identifier: user.email, otp: emailOtp });
        await sendEmail(user.email, 'New Verification Code for DASH', `Your new verification code is: <strong>${emailOtp}</strong>`);
        
        res.status(200).json({ message: 'A new verification code has been sent to your email.'});
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: 'Server error while resending OTPs.' });
    }
};
// Add this new function to your authController.js

exports.updateProfile = async (req, res) => {
    // We get the user from the authMiddleware
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

        if (req.body.password) {
            // If a new password is provided, we hash and save it
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};












// const User = require('../models/userModel');
// const Otp = require('../models/otpModel');
// const jwt = require('jsonwebtoken');
// const otpGenerator = require('otp-generator');
// const { sendEmail } = require('../services/emailService');
// const { sendSms } = require('../services/smsService');

// // Helper function to generate a JWT
// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: '30d', // Token will be valid for 30 days
//     });
// };

// // --- CONTROLLER FUNCTIONS ---

// // 1. Register User & Send OTPs
// exports.register = async (req, res) => {
//     const { name, email, phoneNumber, password } = req.body;

//     try {
//         // Check if user with the same email or phone number already exists
//         const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//         if (userExists) {
//             return res.status(400).json({ message: 'User with this email or phone number already exists.' });
//         }

//         // Create the user document in the database
//         const user = await User.create({ name, email, phoneNumber, password });

//         // Generate a 6-digit OTP for email and phone
//         const emailOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
//         const phoneOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

//         // Save the OTPs to the database so we can verify them later
//         await Otp.create({ identifier: email, otp: emailOtp });
//         await Otp.create({ identifier: phoneNumber, otp: phoneOtp });

//         // Trigger the email and SMS services
//         await sendEmail(email, 'Verify Your Email for DASH', `Your DASH verification code is: <strong>${emailOtp}</strong>`);
//         await sendSms(phoneNumber, `Your DASH verification code is: ${phoneOtp}`);

//         // Send a success response to the frontend
//         res.status(201).json({
//             message: 'Registration successful! Please check your email and phone for verification codes.',
//             userId: user._id, // Send userId so the frontend knows who to verify
//         });

//     } catch (error) {
//         console.error("Registration Error:", error);
//         res.status(500).json({ message: 'Server error during registration.' });
//     }
// };

// // 2. Verify OTPs & Activate Account
// exports.verifyOtp = async (req, res) => {
//     const { userId, emailOtp, phoneOtp } = req.body;

//     try {
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(400).json({ message: 'User not found.' });
//         }

//         // Find the OTPs in the database that match the user and the submitted codes
//         const emailOtpRecord = await Otp.findOne({ identifier: user.email, otp: emailOtp });
//         const phoneOtpRecord = await Otp.findOne({ identifier: user.phoneNumber, otp: phoneOtp });

//         if (!emailOtpRecord || !phoneOtpRecord) {
//             return res.status(400).json({ message: 'Invalid or expired verification codes.' });
//         }

//         // If OTPs are correct, update the user's status
//         user.isEmailVerified = true;
//         user.isPhoneVerified = true;
//         await user.save();

//         // OTPs have been used, so delete them
//         await Otp.deleteMany({ identifier: { $in: [user.email, user.phoneNumber] } });

//         // Send back a success response with a login token
//         res.status(200).json({
//             message: 'Account verified successfully! You are now logged in.',
//             token: generateToken(user._id),
//             user: { _id: user._id, name: user.name, email: user.email },
//         });

//     } catch (error) {
//         console.error("OTP Verification Error:", error);
//         res.status(500).json({ message: 'Server error during OTP verification.' });
//     }
// };

// // 3. Login User
// exports.login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });

//         // Check if user exists and password is correct
//         if (!user || !(await user.matchPassword(password))) {
//             return res.status(401).json({ message: 'Invalid email or password.' });
//         }

//         // Prevent login if account is not yet verified
//         if (!user.isEmailVerified || !user.isPhoneVerified) {
//             return res.status(403).json({ message: 'Your account is not verified. Please complete the OTP verification.' });
//         }

//         // If everything is correct, send back a token
//         res.json({
//             message: "Login successful",
//             token: generateToken(user._id),
//             user: { _id: user._id, name: user.name, email: user.email },
//         });
//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(500).json({ message: 'Server error during login.' });
//     }
// };

// // 4. Resend OTPs
// exports.resendOtp = async (req, res) => {
//     const { email } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User with this email not found.' });
//         }
//         if (user.isEmailVerified && user.isPhoneVerified) {
//             return res.status(400).json({ message: 'This account is already verified.' });
//         }

//         // Generate new OTPs
//         const emailOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
//         const phoneOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

//         // Remove old OTPs and save the new ones
//         await Otp.deleteMany({ identifier: { $in: [user.email, user.phoneNumber] } });
//         await Otp.create({ identifier: user.email, otp: emailOtp });
//         await Otp.create({ identifier: user.phoneNumber, otp: phoneOtp });
        
//         // Resend the new OTPs
//         await sendEmail(user.email, 'New Verification Code for DASH', `Your new verification code is: <strong>${emailOtp}</strong>`);
//         await sendSms(user.phoneNumber, `Your new DASH verification code is: ${phoneOtp}`);
        
//         res.status(200).json({ message: 'New verification codes have been sent.'});

//     } catch (error) {
//         console.error("Resend OTP Error:", error);
//         res.status(500).json({ message: 'Server error while resending OTPs.' });
//     }
// };