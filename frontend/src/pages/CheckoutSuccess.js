import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { checkoutAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { CheckCircle, Package, Loader2, Clock, MapPin, CreditCard, Phone, Mail } from 'lucide-react';
import axios from 'axios';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionId = searchParams.get('session_id');
  const orderNumberFromState = location.state?.orderNumber;
  const paymentMethodFromState = location.state?.paymentMethod;
  
  const [status, setStatus] = useState(sessionId ? 'checking' : 'success');
  const [attempts, setAttempts] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId, attempts]);

  const checkPaymentStatus = async () => {
    try {
      const response = await checkoutAPI.getStatus(sessionId);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
      } else if (attempts < 5) {
        setTimeout(() => setAttempts(attempts + 1), 2000);
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      if (attempts < 5) {
        setTimeout(() => setAttempts(attempts + 1), 2000);
      } else {
        setStatus('error');
      }
    }
  };

  return (
    <div data-testid="checkout-success-page" className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="text-center space-y-6 max-w-md">
        {status === 'checking' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-[#0071E3] animate-spin" />
            <h2 data-testid="checking-payment" className="text-2xl font-bold">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h2 data-testid="payment-success" className="text-3xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
            <div className="flex flex-col gap-3 pt-4">
              <Link to="/orders">
                <Button data-testid="view-orders-button" size="lg" className="w-full">
                  <Package className="w-5 h-5 mr-2" />
                  View My Orders
                </Button>
              </Link>
              <Link to="/products">
                <Button data-testid="continue-shopping-button" variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <Package className="w-16 h-16 mx-auto text-yellow-500" />
            <h2 className="text-2xl font-bold text-yellow-600">Payment Pending</h2>
            <p className="text-gray-600">
              Your payment is being processed. You'll receive a confirmation email once completed.
            </p>
            <Link to="/orders">
              <Button data-testid="view-orders-button" size="lg">
                View My Orders
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-4xl">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600">Payment Error</h2>
            <p className="text-gray-600">
              There was an issue verifying your payment. Please contact support.
            </p>
            <Link to="/">
              <Button variant="outline" size="lg">
                Go to Home
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;