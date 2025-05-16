import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { Shield, CreditCard, AlertCircle, CheckCircle2, Mail, MapPin } from 'lucide-react';
import './PaymentForm.css';

const CustomizedPaymentForm = ({
  amount,
  frequency,
  customerInfo,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const baseUrl = process.env.NODE_ENV === 'development'
    ? (process.env.REACT_APP_API_BASE_URL_LOCAL || 'http://localhost:8000')
    : (process.env.REACT_APP_API_BASE_URL_DEPLOY || 'https://lovelyserenitybackend.onrender.com');

  // Convert amount to a number if it's not already and convert to cents
  const numericAmount = Math.round((typeof amount === 'number' ? amount : parseFloat(amount) || 0) * 100);

  const getInterval = () => {
    if (frequency.includes('Every Week')) return 'week';
    if (frequency.includes('Every 2 Weeks')) return 'two_weeks';
    if (frequency.includes('Every 4 Weeks')) return 'month';
    return 'one_time';
  };

  const handlePostalCodeChange = (e) => {
    // Allow alphanumeric characters for postal code
    setPostalCode(e.target.value.toUpperCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    // Get the individual card elements
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    
    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setProcessing(false);
      setError('Card elements not properly initialized');
      return;
    }

    try {
      // Create payment method with separated elements
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          phone: customerInfo.mobile,
          address: {
            postal_code: postalCode
          }
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Prepare payment data 
      const paymentData = {
        amount: numericAmount,
        currency: 'cad', 
        customer_email: customerInfo.email,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_phone: customerInfo.mobile,
        customer_postal_code: postalCode,
        payment_type: frequency.includes('One Time') ? 'one_time' : 'recurring',
        interval: getInterval(),
        payment_method_id: paymentMethod.id
      };

      console.log("Sending payment data:", paymentData);

      // Make payment request to backend
      const response = await fetch(`${baseUrl}/api/stripe/payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      console.log("Payment response:", result);

      if (!result.success) {
        throw new Error(result.error || 'Payment processing failed');
      }

      // Check if additional action is required (3D Secure etc.)
      if (result.requires_action && result.client_secret) {
        console.log("Payment requires additional action");
        
        // Handle 3D Secure or other authentication
        let confirmationResult;
        
        // For subscription payments with requires_action, we need to handle differently
        if (result.subscription_id) {
          // Use confirmCardPayment for subscription's first payment
          confirmationResult = await stripe.confirmCardPayment(result.client_secret);
        } else {
          // Use confirmCardPayment for one-time payments
          confirmationResult = await stripe.confirmCardPayment(result.client_secret);
        }
        
        if (confirmationResult.error) {
          throw new Error(confirmationResult.error.message);
        }
        
        // Show success with email notification message
        setSuccess('Payment processed successfully! Your booking has been confirmed. A confirmation email will be sent to you shortly.');
        onPaymentSuccess({
          paymentId: result.payment_id,
          customerId: result.customer_id || null,
          subscriptionId: result.subscription_id || null,
        });
      } else {
        // Payment was automatically confirmed by the backend
        setSuccess('Payment processed successfully! Your booking has been confirmed. A confirmation email will be sent to you shortly.');
        onPaymentSuccess({
          paymentId: result.payment_id,
          customerId: result.customer_id || null,
          subscriptionId: result.subscription_id || null,
        });
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      onPaymentError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Common options for Stripe Elements
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="secure-badge">
        <Shield size={30} className="icon" />
        <span>Secure Payment</span>
      </div>

      <div className="payment-summary">
        <div className="payment-amount">
          <span>Total Payment:</span>
          <span className="amount">CAD ${(numericAmount / 100).toFixed(2)}</span>
        </div>
        <div className="payment-frequency">
          {frequency.includes('One Time') ? (
            <span>One-time payment</span>
          ) : (
            <span>Recurring payment - {frequency}</span>
          )}
        </div>
      </div>

      {/* Display success message */}
      {success && (
        <div className="payment-message success">
          <div className="success-message">
            <CheckCircle2 size={20} className="message-icon" />
            <span>{success}</span>
          </div>
          <div className="email-confirmation">
            <Mail size={18} className="icon" />
            <span>Please check your email for booking details.</span>
          </div>
        </div>
      )}

      {/* Display error message */}
      {error && (
        <div className="payment-message error">
          <AlertCircle size={20} className="message-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Only show the payment form if payment is not successful yet */}
      {!success && (
        <>
          
            <label>
              <CreditCard size={18} className="icon" />
              Card Number
            </label>
            <div className="card-element-container">
              <CardNumberElement options={cardElementOptions} />
            </div>
        

          <div className="form-row ">
            <div className="form-group">
              <label>
                <CreditCard size={18} className="icon" />
                Expiration Date
              </label>
              <div className="card-element-container">
                <CardExpiryElement options={cardElementOptions} />
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <CreditCard size={18} className="icon" />
                CVC
              </label>
              <div className="card-element-container">
                <CardCvcElement options={cardElementOptions} />
              </div>
            </div>
          </div>

            <label htmlFor="postal-code">
              <MapPin size={18} className="icon" />
              Postal Code
            </label>
            <input
              id="postal-code"
              type="text"
              className="postal-code-input"
              value={postalCode}
              onChange={handlePostalCodeChange}
              placeholder="e.g. A1A 1A1"
              autoComplete="postal-code"
            />

          <button
            type="submit"
            disabled={!stripe || processing || !postalCode}
            className={`payment-button ${processing ? 'processing' : ''}`}
          >
            {processing ? (
              <span className="processing-text">
                <div className="spinner"></div>
                Processing...
              </span>
            ) : (
              <span>Pay Now</span>
            )}
          </button>
        </>
      )}
    </form>
  );
};

export default CustomizedPaymentForm;