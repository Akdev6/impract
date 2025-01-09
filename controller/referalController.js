const User = require('../model/userModel');

const userRegister = async (req, res, next) => {
    const { userName, mobileNumber } = req.body;
    const { referralCode } = req.params; // Extract referredBy as a string from params

    console.log(referralCode);
    
    // Check if required fields are provided
    if (!userName || !mobileNumber || !referralCode) {
        return res.status(400).json({
            success: false,
            message: 'UserName, Mobile Number fields and referredcode are mandatory ',
        });
    }

    try {
        // Check if the user already exists
        const finduser = await User.findOne({ mobileNumber });

        if (finduser) {
            return res.status(400).json({
                success: false,
                message: 'User already registered',
            });
        }

        const referredByCode=await User.findOne({ referralCode:referralCode });

        if (!referredByCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid referral code',
            });
        }

        // Generate unique referral code
        const createUniqueCode = () => {
            const characters = 'aksldjklsfjkcvnvdhfeirtyertyeirkjfbjh1233456789';
            const characterLimit = 6;
            let randomCode = '';

            for (let i = 0; i < characterLimit; i++) {
                const code = Math.floor(Math.random() * characters.length);
                randomCode += characters[code];
            }

            return randomCode;
        };

        const randomcode = createUniqueCode();

        // Save new user data
        const savedata = await User.create({
            userName: userName,
            mobileNumber: mobileNumber,
            referralCode: randomcode,
            referredBy: referralCode, 
        });

        if (!savedata) {
            return res.status(400).json({
                success: false,
                message: 'User failed to register',
            });
        }

        // Update referral count for the referredBy  
       
        await User.findOneAndUpdate(
            { referralCode: referralCode },
            { $inc: { referralCount: 1 } }
        );
   

        res.status(200).json({
            success: true,
            message: 'User registration successful',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration',
        });
    }
};

module.exports = userRegister;
