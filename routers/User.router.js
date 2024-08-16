import express from 'express';
import UserController from '../Controllers/User.controller.js';
import validators from '../common/validators.js';

const router = express.Router();

router.post('/signup', validators.validate("signup"), validators.validationMiddleware, UserController.signupController);
router.post('/signin', validators.validate('signin'), validators.validationMiddleware, UserController.signinController);
router.post('/forgot-password', validators.validate('forgotPassword'), validators.validationMiddleware, UserController.forgotPassword);
router.post('/reset-password', validators.validate('resetPassword'), validators.validationMiddleware, UserController.resetPassword);

export default router;