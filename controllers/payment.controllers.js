import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js";
import crypto from "crypto";

// Get Razorpay API key
const getRazorpayKey = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Razorpay API key',
    key: process.env.RAZORPAY_KEY_ID
  });
};

// Buy a subscription
const buySubscription = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError(400, 'Unauthorized, please log in again'));
  }

  if (user.role === 'Admin') {
    return next(new AppError(400, 'Admin cannot purchase a subscription'));
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1
    });

    // Update user subscription details
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscribed successfully',
      subscription_id: subscription.id
    });
  } catch (error) {
    return next(new AppError(500, 'Subscription purchase failed'));
  }
};

// Verify subscription payment
const verifySubscription = async (req, res, next) => {
  const { id } = req.user;
  const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError(400, 'Unauthorized, please log in again'));
  }

  const subscriptionId = user.subscription.id;

  // Generate signature using Razorpay secret and payment information
  const generateSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${razorpay_payment_id}|${subscriptionId}`)
    .digest('hex');

  if (generateSignature !== razorpay_signature) {
    return next(new AppError(400, 'Payment not verified, please try again'));
  }

  try {
    // Create payment record
    await Payment.create({
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id
    });

    // Update user subscription status to 'active'
    user.subscription.status = 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully!'
    });
  } catch (error) {
    return next(new AppError(500, 'Payment verification failed'));
  }
};

// Cancel subscription
const cancelSubscription = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError(400, 'Unauthorized, please log in again'));
  }

  const subscriptionId = user.subscription.id;

  try {
    // Cancel the subscription in Razorpay
    const subscription = await razorpay.subscriptions.cancel(subscriptionId);

    // Update user subscription status
    user.subscription.status = subscription.status;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully!'
    });
  } catch (error) {
    return next(new AppError(500, 'Failed to cancel the subscription'));
  }
};

// Get all payments details
const allPayments = async (req, res, next) => {
  const { count } = req.user;

  try {
    // Fetch all payments from Razorpay
    const payments = await razorpay.subscriptions.all({
      count: count || 10,
    });

    // Initialize an object to store the subscription count for each month
    const subscriptionCountByMonth = {};

    // Extract the year and month from the creation date of each payment 
    payments.forEach((payment) => {
        const createdDate = new Date(payment.created_at);
        const year = createdDate.getFullYear();
        const month = createdDate.getMonth() + 1;

        subscriptionCountByMonth[`${year}-${month}`] = 0;

        subscriptionCountByMonth[`${year}-${month}`]++
    });

    res.status(200).json({
      success: true,
      message: 'All payments detail',
      payments
    });
  } catch (error) {
    return next(new AppError(500, 'Failed to fetch payments'));
  }
};

export {
  getRazorpayKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments
};
