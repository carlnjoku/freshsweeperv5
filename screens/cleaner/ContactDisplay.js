// import React from 'react';
// import { SafeAreaView,Text, StyleSheet, StatusBar, Linking, FlatList, ScrollView, Modal, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import CardNoPrimary from '../../components/shared/CardNoPrimary';
// import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
// import COLORS from '../../constants/colors';
// import {IconButton } from 'react-native-paper';

// export default function ContactDisplay({contact, handleOpenContact}) {

//   return (
//     <CardNoPrimary>
//         <View style={styles.titleContainer}>
//         <Text bold style={styles.title}>Contact</Text> 
//         <View style={styles.actions}>
//             <CircleIconNoLabel 
//                 iconName="pencil"
//                 buttonSize={30}
//                 radiusSise={15}
//                 iconSize={16}
//                 onPress={handleOpenContact}
//             /> 
//         </View>
//         </View>
//         <View style={styles.line}></View>

//         <View style={styles.infoRow}>
//           <IconButton icon="map-marker" size={20} />
//           <Text style={styles.text}>{contact.address}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <IconButton icon="phone" size={20} />
//           <Text style={styles.text}>{contact.phone}</Text>
//         </View>


//         {/* <View style={styles.content}>
//             <Text>Address</Text>
//             <Text style={styles.address}>{contact.address}</Text>
//         </View>
//         <View style={styles.content}>
//             <Text>Phone</Text>
//             <Text style={styles.address}>{contact.phone}</Text>
//         </View>
//         <View style={styles.content}>
//             <Text>Social Security #</Text>
//             <Text style={styles.address}>{contact.ssn}</Text>
//         </View> */}
//     </CardNoPrimary>
//   )
// }


// const styles = StyleSheet.create({
//     header:{
//       margin:0
//     },
//     name:{
//       color:COLORS.white,
//       fontSize:18,
//     },
//     location:{
//       color:COLORS.white
//     },
//     container:{
//       margin:10
//     },
//     avatar_background:{
//       paddingTop:80,
//       paddingBottom:10,
//       minHeighteight:200,
//       backgroundColor:COLORS.primary,
//       justifyContent:'center',
//       alignItems:'center'
//     },
//     line:{
//       borderBottomWidth:0.8,
//       borderColor:COLORS.light_gray_1,
//       marginVertical:5,
//       height:4
//     },
//     titleContainer:{
//       flexDirection:'row',
//       justifyContent:'space-between',
//       alignItems:'center',
//       marginTop:0
//     },
//     title:{
//         fontSize:16,
//         fontWeight:'bold'
      
//     },
//     content:{
//       flexDirection:'row',
//       justifyContent:'space-between',
//       marginVertical:5
//     },
//     actions:{
//       flexDirection:'row',
  
//     },
//     address:{
//         color:COLORS.gray,
//         fontSize:14
//     },
//     infoRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginVertical: 3,
//     },
//     text: {
//       fontSize: 14,
//       flex: 1,
//       flexWrap: 'wrap',
//     },
//   })
  


// import React from 'react';
// import { 
//   SafeAreaView, 
//   Text, 
//   StyleSheet, 
//   StatusBar, 
//   Linking, 
//   FlatList, 
//   ScrollView, 
//   Modal, 
//   Image, 
//   View, 
//   TouchableOpacity, 
//   ActivityIndicator 
// } from 'react-native';
// import CardNoPrimary from '../../components/shared/CardNoPrimary';
// import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
// import COLORS from '../../constants/colors';
// import { IconButton } from 'react-native-paper';

// export default function ContactDisplay({ contact, handleOpenContact }) {
  
//   const handleCall = () => {
//     if (contact.phone) {
//       Linking.openURL(`tel:${contact.phone}`);
//     }
//   };

//   const handleOpenMaps = () => {
//     if (contact.address) {
//       const encodedAddress = encodeURIComponent(contact.address);
//       Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
//     }
//   };

//   return (
//     <CardNoPrimary style={styles.card}>
//       {/* Header with gradient background */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <Text style={styles.title}>Contact Information</Text>
//           <Text style={styles.subtitle}>Get in touch</Text>
//         </View>
//         <TouchableOpacity 
//           style={styles.editButton}
//           onPress={handleOpenContact}
//         >
//           <IconButton 
//             icon="pencil-outline" 
//             size={20} 
//             iconColor={COLORS.primary}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Contact Details */}
//       <View style={styles.content}>
//         {/* Address Section */}
//         <TouchableOpacity 
//           style={styles.contactItem}
//           onPress={handleOpenMaps}
//         >
//           <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
//             <IconButton 
//               icon="map-marker-outline" 
//               size={20} 
//               iconColor="#4CAF50"
//             />
//           </View>
//           <View style={styles.textContainer}>
//             <Text style={styles.label}>Address</Text>
//             <Text style={styles.value} numberOfLines={2}>
//               {contact.address || 'Not provided'}
//             </Text>
//           </View>
//           <IconButton 
//             icon="chevron-right" 
//             size={20} 
//             iconColor={COLORS.gray}
//           />
//         </TouchableOpacity>

//         {/* Divider */}
//         <View style={styles.divider} />

//         {/* Phone Section */}
//         <TouchableOpacity 
//           style={styles.contactItem}
//           onPress={handleCall}
//         >
//           <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
//             <IconButton 
//               icon="phone-outline" 
//               size={20} 
//               iconColor="#2196F3"
//             />
//           </View>
//           <View style={styles.textContainer}>
//             <Text style={styles.label}>Phone Number</Text>
//             <Text style={styles.value}>
//               {contact.phone || 'Not provided'}
//             </Text>
//           </View>
//           <IconButton 
//             icon="phone-forward" 
//             size={20} 
//             iconColor={COLORS.primary}
//           />
//         </TouchableOpacity>

//         {/* Additional Contact Info - Expandable if needed */}
//         {contact.email && (
//           <>
//             <View style={styles.divider} />
//             <View style={styles.contactItem}>
//               <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
//                 <IconButton 
//                   icon="email-outline" 
//                   size={20} 
//                   iconColor="#9C27B0"
//                 />
//               </View>
//               <View style={styles.textContainer}>
//                 <Text style={styles.label}>Email</Text>
//                 <Text style={styles.value}>{contact.email}</Text>
//               </View>
//             </View>
//           </>
//         )}

//         {contact.ssn && (
//           <>
//             <View style={styles.divider} />
//             <View style={styles.contactItem}>
//               <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
//                 <IconButton 
//                   icon="shield-account-outline" 
//                   size={20} 
//                   iconColor="#FF9800"
//                 />
//               </View>
//               <View style={styles.textContainer}>
//                 <Text style={styles.label}>Social Security #</Text>
//                 <Text style={styles.value}>•••-••-{contact.ssn.slice(-4)}</Text>
//               </View>
//               <IconButton 
//                 icon="eye-outline" 
//                 size={20} 
//                 iconColor={COLORS.gray}
//               />
//             </View>
//           </>
//         )}
//       </View>

//       {/* Quick Actions Footer */}
//       {/* <View style={styles.footer}>
//         <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
//           <IconButton icon="phone" size={18} iconColor="#FFF" />
//           <Text style={styles.actionText}>Call</Text>
//         </TouchableOpacity>
        
//         <View style={styles.actionSeparator} />
        
//         <TouchableOpacity style={styles.actionButton} onPress={handleOpenMaps}>
//           <IconButton icon="navigation" size={18} iconColor="#FFF" />
//           <Text style={styles.actionText}>Directions</Text>
//         </TouchableOpacity>
        
//         <View style={styles.actionSeparator} />
        
//         <TouchableOpacity style={styles.actionButton} onPress={handleOpenContact}>
//           <IconButton icon="content-copy" size={18} iconColor="#FFF" />
//           <Text style={styles.actionText}>Edit</Text>
//         </TouchableOpacity>
//       </View> */}
//     </CardNoPrimary>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     margin: 16,
//     borderRadius: 16,
//     backgroundColor: '#FFFFFF',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//     overflow: 'hidden',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//   },
//   headerContent: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     marginBottom: 2,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontWeight: '500',
//   },
//   editButton: {
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 12,
//     padding: 4,
//   },
//   content: {
//     padding: 4,
//   },
//   contactItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   iconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.gray,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 2,
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.dark,
//     lineHeight: 22,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#F0F0F0',
//     marginHorizontal: 16,
//   },
//   footer: {
//     flexDirection: 'row',
//     backgroundColor: '#F8F9FA',
//     borderTopWidth: 1,
//     borderTopColor: '#E9ECEF',
//     paddingVertical: 8,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   actionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 6,
//   },
//   actionSeparator: {
//     width: 1,
//     backgroundColor: '#E9ECEF',
//     marginVertical: 8,
//   },
// });



import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CardNoPrimary from '../../components/shared/CardNoPrimary';
import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
import COLORS from '../../constants/colors';

export default function ContactDisplay({ contact, handleOpenContact }) {
  const handleCall = () => {
    if (contact?.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleOpenMaps = () => {
    if (contact?.address) {
      const encodedAddress = encodeURIComponent(contact.address);
      Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    }
  };

  const handleEmail = () => {
    if (contact?.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  return (
    <CardNoPrimary style={styles.card}>
      {/* Header with title and edit button */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
        <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={20}
              color={COLORS.white}
            />
          </View>
          
          <Text style={styles.title}>Contact Information</Text>
        </View>
        <TouchableOpacity onPress={handleOpenContact} style={styles.editButton}>
          <CircleIconNoLabel
            onPress={handleOpenContact}
            iconName="pencil"
            buttonSize={36}
            radiusSise={18}
            iconSize={18}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Contact items */}
      <View style={styles.content}>
        {/* Address */}
        <TouchableOpacity
          style={styles.contactRow}
          onPress={handleOpenMaps}
          disabled={!contact?.address}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#E8F0FE' }]}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value} numberOfLines={1}>
              {contact?.address || 'Not provided'}
            </Text>
          </View>
          {contact?.address && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.gray}
            />
          )}
        </TouchableOpacity>

        {/* Phone */}
        <TouchableOpacity
          style={styles.contactRow}
          onPress={handleCall}
          disabled={!contact?.phone}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={20}
              color="#4CAF50"
            />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{contact?.phone || 'Not provided'}</Text>
          </View>
          {contact?.phone && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.gray}
            />
          )}
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={styles.contactRow}
          onPress={handleEmail}
          disabled={!contact?.email}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#F3E5F5' }]}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#9C27B0"
            />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value} numberOfLines={1}>
              {contact?.email || 'Not provided'}
            </Text>
          </View>
          {contact?.email && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.gray}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Optional footer with quick actions */}
      {(contact?.phone || contact?.address) && (
        <View style={styles.footer}>
          {contact?.phone && (
            <TouchableOpacity style={styles.footerButton} onPress={handleCall}>
              <MaterialCommunityIcons name="phone" size={18} color={COLORS.white} />
              <Text style={styles.footerText}>Call</Text>
            </TouchableOpacity>
          )}
          {contact?.address && (
            <TouchableOpacity style={styles.footerButton} onPress={handleOpenMaps}>
              <MaterialCommunityIcons name="map" size={18} color={COLORS.white} />
              <Text style={styles.footerText}>Directions</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </CardNoPrimary>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    marginLeft: 8,
  },
  editButton: {
    padding: 4,
    backgroundColor: '#F8F9FC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E9F0',
    marginBottom: 16,
  },
  content: {
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  // iconWrapper: {
  //   width: 44,
  //   height: 44,
  //   borderRadius: 12,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginRight: 12,
  // },
  textWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E1E2F',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flex: 0.45,
    justifyContent: 'center',
  },
  footerText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
});