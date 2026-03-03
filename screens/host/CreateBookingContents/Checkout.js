import React from 'react'
import { View, Text, Button, StyleSheet, TouchableOpacity, Pressable, Platform, FlatList, ScrollView, useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import COLORS from '../../../constants/colors';
import { StripeProvider } from '@stripe/stripe-react-native';
import PaymentScreen from '../../../components/PaymentForm';

export default function Checkout({ navigation, route }) {


    const{pendingPayments} = route.params
    console.log("pendiinng.............")
    // console.log(pendingPayments)
    console.log("pendiinng.............")
    // Example array of pending payments
  const totalSum = pendingPayments.reduce((sum, schedule) => {
    const fee = parseFloat(schedule.total_cleaning_fee) || 0;
    return sum + fee;
  }, 0);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {pendingPayments.map((schedule, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>{schedule.serviceName}</Text>
            <Text style={styles.itemPrice}>${schedule.total_cleaning_fee}</Text>
          </View>
        ))}

        {/* Subtotal */}
        <View style={styles.subTotalContainer}>
          <Text style={styles.subTotalText}>Subtotal</Text>
          <Text style={styles.subTotalAmount}>${totalSum.toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <StripeProvider>
            {/* Your app content */}
            <PaymentScreen />
            </StripeProvider>
      </View>

      {/* Total Amount */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount Due</Text>
        <Text style={styles.totalAmount}>${totalSum.toFixed(2)}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.placeOrderButton}>
          <Text style={styles.buttonText}>Place Order</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9f9f9',
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600',
    },
    section: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 10,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    itemText: {
      fontSize: 16,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: '500',
    },
    subTotalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      marginTop: 10,
    },
    subTotalText: {
      fontSize: 16,
      color: '#777',
    },
    subTotalAmount: {
      fontSize: 16,
      fontWeight: '500',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    totalContainer: {
      marginTop: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: '600',
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000',
    },
    buttonContainer: {
      marginTop: 20,
    },
    placeOrderButton: {
      backgroundColor: '#5cb85c',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      marginTop: 10,
      backgroundColor: '#d9534f',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      color: '#fff',
      fontWeight: '500',
    },
  });
  
