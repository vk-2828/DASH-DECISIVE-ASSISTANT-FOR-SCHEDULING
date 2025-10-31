import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import { toast } from 'react-toastify'; // Import toast

const VerifyOtpPage = () => {
  const [emailOtp, setEmailOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyOtp({ userId, emailOtp });
      toast.success('Account verified successfully! Please log in.'); // Replace alert
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.'); // Replace error state
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp(email);
      toast.info('A new verification code has been sent.'); // Use info toast
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
      <div className="w-full bg-white rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
            Check Your Email
          </h1>
          <p className="text-sm text-gray-600">Enter the 6-digit code sent to <strong>{email}</strong>.</p>
          <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="emailOtp" className="block mb-2 text-sm font-medium text-gray-900">Verification Code</label>
              <input type="text" name="emailOtp" id="emailOtp" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" placeholder="_ _ _ _ _ _" required />
            </div>
            <button type="submit" disabled={loading} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-400">
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
            <div className="text-sm text-center">
                <button type="button" onClick={handleResend} className="font-medium text-blue-600 hover:underline">
                    Didn't get the code? Resend
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;









