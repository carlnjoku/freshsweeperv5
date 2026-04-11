// import React from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import CardNoPrimary from '../../components/shared/CardNoPrimary';
// import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
// // import { EmptyPlaceholder } from '../../components/shared/EmptyPlaceHolder';
// import EmptyPlaceholder from '../../components/shared/EmptyPlaceholder';
// import COLORS from '../../constants/colors';


// export default function CertificationDisplay({ certification, handleOpenCertification, mode }) {
//   const renderItem = ({ item }) => (
//     <View style={styles.certItem}>
//       <Text style={styles.certName}>{item?.name}</Text>
//       <Text style={styles.certInstitution}>{item?.institution_name}</Text>
//       {item?.credentialUrl ? (
//         <Text style={styles.certUrl}>{item.credentialUrl}</Text>
//       ) : null}
//     </View>
//   );

//   return (
//     <CardNoPrimary style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.titleContainer}>
//           <MaterialCommunityIcons
//             name="certificate"
//             size={24}
//             color={COLORS.primary}
//             style={styles.icon}
//           />
//           <Text style={styles.title}>Certification or License</Text>
//         </View>
//         {mode === 'edit' && (
//           <View style={styles.actionButtons}>
//             <TouchableOpacity onPress={handleOpenCertification} style={styles.editButton}>
//               <CircleIconNoLabel
//                 iconName="pencil"
//                 buttonSize={30}
//                 radiusSise={15}
//                 iconSize={16}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleOpenCertification} style={styles.editButton}>
//               <CircleIconNoLabel
//                 iconName="plus"
//                 buttonSize={30}
//                 radiusSise={15}
//                 iconSize={22}
//               />
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       <View style={styles.divider} />

//       {certification && certification.length > 0 ? (
//         <FlatList
//           data={certification}
//           renderItem={renderItem}
//           keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
//           numColumns={2}
//           columnWrapperStyle={styles.columnWrapper}
//           contentContainerStyle={styles.listContent}
//           scrollEnabled={false}
//         />
//       ) : (
//         <EmptyPlaceholder
//           icon="certificate-outline"
//           message="No certifications or licenses added yet."
//         />
//       )}
//     </CardNoPrimary>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   icon: {
//     marginRight: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   editButton: {
//     padding: 4,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: COLORS.light_gray_1,
//     marginBottom: 12,
//   },
//   listContent: {
//     flexGrow: 1,
//   },
//   columnWrapper: {
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   certItem: {
//     flex: 1,
//     marginHorizontal: 4,
//     padding: 10,
//     backgroundColor: '#F9F9FC',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#EFEFEF',
//   },
//   certName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   certInstitution: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 2,
//   },
//   certUrl: {
//     fontSize: 11,
//     color: COLORS.primary,
//     textDecorationLine: 'underline',
//   },
// });





import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CardNoPrimary from '../../components/shared/CardNoPrimary';
import CircleIconNoLabel from '../../components/shared/CirecleIconNoLabel';
import EmptyPlaceholder from '../../components/shared/EmptyPlaceholder';
import COLORS from '../../constants/colors';
import { tSafe } from '../../utils/tSafe'; // added import

const CertificationDisplay = ({ certification, handleOpenCertification, mode, onEditCertification}) => {
  const renderItem = ({ item }) => (
    <View style={styles.certCard}>
      <View style={styles.certHeader}>
        <MaterialCommunityIcons name="certificate" size={20} color={COLORS.primary} />
        <Text style={styles.certName} numberOfLines={1}>{item?.name}</Text>
      </View>
      <Text style={styles.certInstitution} numberOfLines={1}>{item?.institution_name}</Text>
      {item?.credentialUrl ? (
        <Text style={styles.certUrl} numberOfLines={1}>{item.credentialUrl}</Text>
      ) : null}
      {mode === 'edit' && (
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => onEditCertification(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <CardNoPrimary style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="certificate-outline" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.title}>
            {tSafe('certifications_licenses', 'Certifications & Licenses')}
          </Text>
        </View>
        {mode === 'edit' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleOpenCertification} style={styles.editButton}>
              <CircleIconNoLabel
                onPress={handleOpenCertification}
                iconName="plus"
                buttonSize={36}
                radiusSise={18}
                iconSize={22}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {certification && certification.length > 0 ? (
        <FlatList
          data={certification}
          renderItem={renderItem}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyPlaceholder
          icon="certificate-outline"
          message={tSafe('no_certifications_added', 'No certifications or licenses added yet.')}
        />
      )}
    </CardNoPrimary>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    letterSpacing: 0.3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
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
  listContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  certCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: '#F9F9FC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    minHeight: 90,
    position: 'relative',
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  certName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
    flex: 1,
  },
  certInstitution: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  certUrl: {
    fontSize: 11,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  editIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default CertificationDisplay;