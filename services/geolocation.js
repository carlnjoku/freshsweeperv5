// import axios from 'axios';

// const fetchIPGeolocation = async () => {
//   try {
//     const response = await axios.get('https://api.ipdata.co?api-key=e06531431e4db6191aa06f006e20767e607e189182d563f2ea54795c')
//     console.log("MyGeo", response.data)
//     return response.data
//   } catch (error) {
//     console.log('Error fetching IP geolocation:', error);
//     return null;
//   }
// };

// export default fetchIPGeolocation;


// import axios from 'axios';

// const fetchIPGeolocation = async () => {
//   const providers = [
//     {
//       name: 'ipdata',
//       url: 'https://api.ipdata.co?api-key=e06531431e4db6191aa06f006e20767e607e189182d563f2ea54795c',
//       parser: (data) => ({
//         city: data.city,
//         region: data.region,
//         country: data.country_name,
//         latitude: data.latitude,
//         longitude: data.longitude,
//         ip: data.ip,
//         provider: 'ipdata',
//       }),
//     },

//     {
//       name: 'ipapi',
//       url: 'https://ipapi.co/json/',
//       parser: (data) => ({
//         city: data.city,
//         region: data.region,
//         country: data.country_name,
//         latitude: data.latitude,
//         longitude: data.longitude,
//         ip: data.ip,
//         provider: 'ipapi',
//       }),
//     },

//     {
//       name: 'ipwhois',
//       url: 'https://ipwho.is/',
//       parser: (data) => ({
//         city: data.city,
//         region: data.region,
//         country: data.country,
//         latitude: data.latitude,
//         longitude: data.longitude,
//         ip: data.ip,
//         provider: 'ipwhois',
//       }),
//     },
//   ];

//   for (const provider of providers) {
//     try {
//       console.log(`Trying ${provider.name}...`);

//       const response = await axios.get(provider.url, {
//         timeout: 5000,
//       });

//       if (response.data) {
//         const parsedData = provider.parser(response.data);

//         console.log('✅ Geolocation success:', parsedData);

//         return parsedData;
//       }
//     } catch (error) {
//       console.log(`❌ ${provider.name} failed:`, error.message);
//     }
//   }

//   console.log('❌ All geolocation providers failed');

//   return null;
// };

// export default fetchIPGeolocation;

// import axios from 'axios';

// const fetchIPGeolocation = async () => {
//   const providers = [
//     {
//       name: 'ipdata',
//       url: 'https://api.ipdata.co?api-key=YOUR_API_KEY',
//       parser: (data) => ({
//         city: data.city,
//         region: data.region,
//         region_code: data.region_code,
//         country: data.country_name,
//         latitude: data.latitude,
//         longitude: data.longitude,
//         ip: data.ip,
//         provider: 'ipdata',
//       }),
//     },

//     {
//       name: 'ipapi',
//       url: 'https://ipapi.co/json/',
//       parser: (data) => ({
//         city: data.city,
//         region: data.region,
//         region_code: data.region_code,
//         country: data.country_name,
//         latitude: data.latitude,
//         longitude: data.longitude,
//         ip: data.ip,
//         provider: 'ipapi',
//       }),
//     },

//     {
//       name: 'ipwhois',
//       url: 'https://ipwho.is/',
//       parser: (data) => ({
//         city: data.city,
//         region: data.region,
//         region_code: data.region_code,
//         country: data.country,
//         latitude: data.latitude,
//         longitude: data.longitude,
//         ip: data.ip,
//         provider: 'ipwhois',
//       }),
//     },
//   ];

//   for (const provider of providers) {
//     try {
//       console.log(`Trying ${provider.name}...`);

//       const response = await axios.get(provider.url, {
//         timeout: 5000,
//       });

//       const parsedData = provider.parser(response.data);

//       // VALIDATE REQUIRED FIELDS
//       const isValid =
//         parsedData.city &&
//         parsedData.region &&
//         parsedData.region_code &&
//         parsedData.country;

//       if (isValid) {
//         console.log('✅ Valid geolocation:', parsedData);
//         return parsedData;
//       }

//       console.log(`⚠️ ${provider.name} missing required fields`);

//     } catch (error) {
//       console.log(`❌ ${provider.name} failed:`, error.message);
//     }
//   }

//   console.log('❌ All providers failed');

//   return null;
// };

// export default fetchIPGeolocation;


// import axios from 'axios';

// const fetchIPGeolocation = async () => {
//   const providers = [
//     {
//       name: 'ipdata',
//       url: 'https://api.ipdata.co?api-key=YOUR_API_KEY',

//       parser: (data) => ({
//         ip: data.ip || null,

//         city: data.city || null,
//         region: data.region || null,
//         region_code: data.region_code || null,

//         country: data.country_name || null,
//         country_code: data.country_code || null,

//         latitude: data.latitude || null,
//         longitude: data.longitude || null,

//         postal_code: data.postal || null,

//         timezone: data.time_zone?.name || null,

//         isp: data.asn?.name || null,

//         currency: data.currency?.code || null,

//         language: data.languages?.[0]?.code || null,

//         is_proxy: data.threat?.is_proxy || false,
//         is_vpn:
//           data.threat?.is_tor ||
//           data.threat?.is_icloud_relay ||
//           false,

//         provider: 'ipdata',

//         raw: data,
//       }),
//     },

//     {
//       name: 'ipapi',
//       url: 'https://ipapi.co/json/',

//       parser: (data) => ({
//         ip: data.ip || null,

//         city: data.city || null,
//         region: data.region || null,
//         region_code: data.region_code || null,

//         country: data.country_name || null,
//         country_code: data.country_code || null,

//         latitude: data.latitude || null,
//         longitude: data.longitude || null,

//         postal_code: data.postal || null,

//         timezone: data.timezone || null,

//         isp: data.org || null,

//         currency: data.currency || null,

//         language: data.languages
//           ? data.languages.split(',')[0]
//           : null,

//         is_proxy: false,
//         is_vpn: false,

//         provider: 'ipapi',

//         raw: data,
//       }),
//     },

//     {
//       name: 'ipwhois',
//       url: 'https://ipwho.is/',

//       parser: (data) => ({
//         ip: data.ip || null,
//         city: data.city || null,
//         region: data.region || null,
//         region_code: data.region_code || null,
//         country: data.country || null,
//         country_code: data.country_code || null,
//         latitude: data.latitude || null,
//         longitude: data.longitude || null,
//         postal_code: data.postal || null,
//         timezone: data.timezone?.id || null,
//         isp: data.connection?.isp || null,
//         currency: data.currency?.code || null,
//         language: data.languages?.[0]?.code || null,
//         is_proxy: false,
//         is_vpn: false,
//         provider: 'ipwhois',
//         raw: data,
//       }),
//     },
//   ];

//   for (const provider of providers) {
//     try {
//       console.log(`🌍 Trying ${provider.name}...`);

//       const response = await axios.get(provider.url, {
//         timeout: 5000,
//       });

//       const parsedData = provider.parser(response.data);

//       // FLEXIBLE VALIDATION
//       const isValid =
//         parsedData.country &&
//         parsedData.country_code &&
//         parsedData.latitude &&
//         parsedData.longitude &&
//         parsedData.currency

//       if (isValid) {
//         console.log(
//           `✅ ${provider.name} success`,
//           parsedData
//         );

//         return parsedData;
//       }

//       console.log(
//         `⚠️ ${provider.name} returned incomplete data`
//       );

//     } catch (error) {
//       console.log(
//         `❌ ${provider.name} failed:`,
//         error.message
//       );
//     }
//   }

//   console.log('❌ All geolocation providers failed');

//   return {
//     ip: null,

//     city: null,
//     region: null,
//     region_code: null,

//     country: null,
//     country_code: null,

//     latitude: null,
//     longitude: null,

//     postal_code: null,

//     timezone: null,

//     isp: null,

//     currency: null,

//     language: null,

//     is_proxy: false,
//     is_vpn: false,

//     provider: null,

//     raw: null,
//   };
// };

// export default fetchIPGeolocation;



import axios from 'axios';

// FALLBACK CURRENCY SYMBOLS
const currencySymbols = {
  USD: '$',   // United States
  CAD: '$',   // Canada
  GBP: '£',   // United Kingdom
  EUR: '€',   // Europe
  NGN: '₦',   // Nigeria
  INR: '₹',   // India
  CNY: '¥',   // China
  JPY: '¥',   // Japan
  AUD: '$',   // Australia
  BRL: 'R$',  // Brazil
  MXN: '$',   // Mexico
  ZAR: 'R',   // South Africa
};

// GET CURRENCY SYMBOL
const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return null;

  return currencySymbols[currencyCode.toUpperCase()] || currencyCode;
};

const fetchIPGeolocation = async () => {
  const providers = [
    {
      name: 'ipdata',
      url: 'https://api.ipdata.co?api-key=YOUR_API_KEY',

      parser: (data) => {
        const currencyCode = data.currency?.code || null;

        return {
          ip: data.ip || null,

          city: data.city || null,
          region: data.region || null,
          region_code: data.region_code || null,

          country: data.country_name || null,
          country_code: data.country_code || null,

          latitude: data.latitude || null,
          longitude: data.longitude || null,

          postal_code: data.postal || null,

          timezone: data.time_zone?.name || null,

          isp: data.asn?.name || null,

          currency: currencyCode,
          currency_symbol:
            data.currency?.symbol ||
            getCurrencySymbol(currencyCode),

          language: data.languages?.[0]?.code || null,

          is_proxy: data.threat?.is_proxy || false,

          is_vpn:
            data.threat?.is_tor ||
            data.threat?.is_icloud_relay ||
            false,

          provider: 'ipdata',

          raw: data,
        };
      },
    },

    {
      name: 'ipapi',
      url: 'https://ipapi.co/json/',

      parser: (data) => {
        const currencyCode = data.currency || null;

        return {
          ip: data.ip || null,

          city: data.city || null,
          region: data.region || null,
          region_code: data.region_code || null,

          country: data.country_name || null,
          country_code: data.country_code || null,

          latitude: data.latitude || null,
          longitude: data.longitude || null,

          postal_code: data.postal || null,

          timezone: data.timezone || null,

          isp: data.org || null,

          currency: currencyCode,

          currency_symbol:
            getCurrencySymbol(currencyCode),

          language: data.languages
            ? data.languages.split(',')[0]
            : null,

          is_proxy: false,
          is_vpn: false,

          provider: 'ipapi',

          raw: data,
        };
      },
    },

    {
      name: 'ipwhois',
      url: 'https://ipwho.is/',

      parser: (data) => {
        const currencyCode =
          data.currency?.code || null;

        return {
          ip: data.ip || null,

          city: data.city || null,
          region: data.region || null,
          region_code: data.region_code || null,

          country: data.country || null,
          country_code: data.country_code || null,

          latitude: data.latitude || null,
          longitude: data.longitude || null,

          postal_code: data.postal || null,

          timezone: data.timezone?.id || null,

          isp: data.connection?.isp || null,

          currency: currencyCode,

          currency_symbol:
            data.currency?.symbol ||
            getCurrencySymbol(currencyCode),

          language: data.languages?.[0]?.code || null,

          is_proxy: false,
          is_vpn: false,

          provider: 'ipwhois',

          raw: data,
        };
      },
    },
  ];

  for (const provider of providers) {
    try {
      console.log(`🌍 Trying ${provider.name}...`);

      const response = await axios.get(provider.url, {
        timeout: 5000,
      });

      const parsedData = provider.parser(response.data);

      // FLEXIBLE VALIDATION
      const isValid =
        parsedData.country &&
        parsedData.country_code &&
        parsedData.latitude &&
        parsedData.longitude &&
        parsedData.currency &&
        parsedData.currency_symbol;

      if (isValid) {
        console.log(
          `✅ ${provider.name} success`,
          parsedData
        );

        return parsedData;
      }

      console.log(
        `⚠️ ${provider.name} returned incomplete data`
      );

    } catch (error) {
      console.log(
        `❌ ${provider.name} failed:`,
        error.message
      );
    }
  }

  console.log('❌ All geolocation providers failed');

  return {
    ip: null,

    city: null,
    region: null,
    region_code: null,

    country: null,
    country_code: null,

    latitude: null,
    longitude: null,

    postal_code: null,

    timezone: null,

    isp: null,

    currency: null,
    currency_symbol: null,

    language: null,

    is_proxy: false,
    is_vpn: false,

    provider: null,

    raw: null,
  };
};

export default fetchIPGeolocation;