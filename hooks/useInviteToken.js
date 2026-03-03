import { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const useInviteToken = () => {
  const [inviteToken, setInviteToken] = useState(null);

  useEffect(() => {
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) handleUrl(url);
    };

    const handleUrl = (url) => {
      try {
        const parsed = new URL(url);
        const token = parsed.searchParams.get('token');
        if (token) {
          setInviteToken(token);
     
        }
      } catch (error) {
        console.error("Invalid URL:", url, error);
      }
    };

    const urlListener = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    getInitialUrl();

    return () => {
      urlListener.remove();
    };
  }, []);

  return inviteToken;
};

export default useInviteToken;