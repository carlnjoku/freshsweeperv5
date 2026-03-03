import axios from 'axios';

export const fetchPaymentIntentClientSecret = async (amount) => {
  try {
    const response = await axios.post('http://schedule/create-payment-intent/', {
      amount,
    });
    return response.data.clientSecret;
  } catch (error) {
    console.error('Error fetching client secrets:', error);
    return null;
  }
};