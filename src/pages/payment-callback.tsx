import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { Box, Typography, CircularProgress, Paper, Container, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { activateSubscription, verifyPayment } from '../services/subscriptionService';
import { updateSubscription } from '../redux/slices/authSlice';
import Head from 'next/head';

const PaymentCallback = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const isAuthenticated = useSelector((state: RootState) => state.auth.token !== null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/payment-callback');
      return;
    }

    const reference = router.query.reference as string;
    
    if (!reference) {
      // No reference in URL, probably direct navigation
      setLoading(false);
      setError('Invalid payment reference. Please try subscribing again.');
      return;
    }

    const processPayment = async () => {
      try {
        // Verify the payment
        const verified = await verifyPayment(reference);
        
        if (verified) {
          // Activate subscription with backend
          await activateSubscription(reference);
          setSuccess(true);
        } else {
          setError('Payment verification failed. Please contact support if you believe this is an error.');
        }
      } catch (err) {
        console.error('Error processing payment callback:', err);
        setError('An error occurred while processing your payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [router.query, router, isAuthenticated, dispatch]);

  const handleContinue = () => {
    router.push('/chat');
  };

  const handleTryAgain = () => {
    router.push('/pricing');
  };

  return (
    <>
      <Head>
        <title>Payment Status | dJetLawyer</title>
      </Head>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
            {loading ? (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h5" align="center">
                  Processing your payment...
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 2 }}>
                  Please wait while we confirm your subscription.
                </Typography>
              </>
            ) : success ? (
              <>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 3 }} />
                <Typography variant="h5" align="center">
                  Payment Successful!
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
                  Your subscription has been activated. You now have access to all premium features.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleContinue}
                >
                  Continue to Chat
                </Button>
              </>
            ) : (
              <>
                <ErrorIcon color="error" sx={{ fontSize: 80, mb: 3 }} />
                <Typography variant="h5" align="center">
                  Payment Failed
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  {error}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
                  Reference: {router.query.reference || 'Unknown'}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleTryAgain}
                >
                  Try Again
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default PaymentCallback; 