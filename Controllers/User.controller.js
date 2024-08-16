import userModel from "../models/User.models.js";
import auth from "../common/auth.js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const signupController = async (req, res) => {
  
    try {
        const { firstName, lastName, email, password } = req.body;

        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        const existingUser = await userModel.findOne({ email });

        if(existingUser){
            return res.status(400).json({message: "User already exists"})
        }

        const hashedPassword = await auth.hashPassword(password);

        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({message: "User created successfully"});
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal server error"});
    }
}

const signinController = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        const isPasswordValid = await auth.hashCompare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid password"});
        }
        const token = auth.createToken({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        });
        let userData = await userModel.findOne(
            { email: req.body.email },
            {_id: 0, password: 0, status: 0, createdAt: 0, email: 0}
        );
        res.status(200).json({message: "User logged in successfully", token, userData});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error"});
    }
}

const forgotPassword = async (req, res) => {
  const { email } = req.body;
try {
  
  let user = await userModel.findOne({ email: email });
  if(!user) {
      return res.status(404).json({ message: 'User not found' });
  }

  const generatedOTP = () => {
      const characters = '0123456789';
      return Array.from({ length: 6 },
          () => characters[Math.floor(Math.random() * characters.length)]
      ).join('');
  };

  const OTP = generatedOTP();
  user.resetPasswordOtp = OTP;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user:process.env.USER_MAILER,
          pass:process.env.PASS_MAILER,
      }
  });
  const mailOptions = {
      from: 'rpraveen1dme@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      html: `
            <p>Dear${user.firstName} ${user.lastName},</P>
            <p>we received a request to reset your password. Here is your One-Time Password (OTP): <strong>${OTP}</strong></P>
            <p>Please Click the following link to reset your password:</P>
            <a href='http://localhost:5173/reset-password'>Reset Password</a>
            <p>Thank You,</P>
          `,
  };

  await transporter.sendMail(mailOptions);

} catch (error) {
  console.log(error);
  res.status(500).json({ message:'Internal server error'})
  }
};

const resetPassword = async (req, res) => {

    try {
        const { OTP, password } = req.body;

        const user = await userModel.findOne({
            resetPasswordOtp: OTP,
            resetPasswordExpires: { $gt: Date.now() },
        });
        
        if(!user) {
            const message = user ? 'OTP has expired' : 'Invalid OTP';
            return res.status(400).json({ message });
        }

        const hashedPassword = await auth.hashPassword(password);
        user.password = hashedPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully'});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    signupController,
    signinController,
    forgotPassword,
    resetPassword
}