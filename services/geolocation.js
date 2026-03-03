import axios from 'axios';

const fetchIPGeolocation = async () => {
  try {
    const response = await axios.get('https://api.ipdata.co?api-key=e06531431e4db6191aa06f006e20767e607e189182d563f2ea54795c')
    console.log("MyGeo", response.data)
    return response.data
  } catch (error) {
    console.log('Error fetching IP geolocation:', error);
    return null;
  }
};

export default fetchIPGeolocation;
