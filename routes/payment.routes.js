import { Router } from "express";
import { allPayments, buySubscription, cancelSubscription, getRazorpayKey, verifySubscription } from "../controllers/payment.controllers.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/razorpay-key', isLoggedIn, getRazorpayKey);
router.post('/subscribe', isLoggedIn, buySubscription);
router.post('/verify', isLoggedIn, verifySubscription);
router.post('/unsubscribe', isLoggedIn, cancelSubscription);
router.get('/', isLoggedIn, authorizedRoles('Admin'), allPayments);

export default router;
