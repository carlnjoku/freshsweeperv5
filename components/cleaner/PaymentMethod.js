import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch,StatusBar, TouchableOpacity,Dimensions } from 'react-native';
import COLORS from '../../constants/colors';
import { TextInput } from 'react-native-paper';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { paymentTypes } from '../../utils/paymentTypes';
import { Picker } from '@react-native-picker/picker';
import BoxWithIcon2 from '../shared/BoxWithIcon2';
import * as Animatable from 'react-native-animatable';
 
const PaymentMethod = ({close_modal}) => {
    
    const [selectedOption, setSelectedOption] = useState('card');
    const [showPicker, setShowPicker] = useState(false);
    const[card, setCard]= useState({
        number:"",
        name:"",
        expiry_date:"",
        cvv:""
    })
    const[paypal, setPayPal]= useState({
        email:""
    })
    const[bank, setBank]= useState({
        name:"",
        account_number:"",
        routing_number:""
    })
    const[errors, setErrors]=useState({})


    const paymentOptions = [
        { iconName: 'credit-card', label: 'Credit/Debit', value: 'card' },
        { iconName: 'paypal', label: 'PayPal', value: 'paypal' },
        { iconName: 'bank', label: 'Bank Transfer', value: 'bank' },
    
        // Add more payment options as needed
    ];

    const handlePickerValueChange = (itemValue) => {
        setSelectedOption(itemValue);
    };

    const handleAChange = () => {
        
    }
    const handleError = (error, input) => {
        setErrors(prevState => ({...prevState, [input]: error}));
    };

    const onClose = () => {
        close_modal(false)
    }
   
    return (
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
         {/* <StatusBar translucent backgroundColor="transparent" /> */}

        <View style={styles.close_button}><MaterialCommunityIcons name="close" color={COLORS.gray} size={24} onPress={onClose} /></View>
        
        <Text style={styles.heading}>Add Payment Method</Text>
       
        <View style={{flexDirection:'row', marginBottom:0}}>
            
            {/* Display BoxWithIcon2 for each payment option */}
            {paymentOptions.map((option, index) => (
                <BoxWithIcon2
                    key={index}
                    iconName={option.iconName}
                    label={option.label}
                    onPress={() => handlePickerValueChange(option.value)}
                />
            ))}

               
        </View>


        {selectedOption==="card" && 

        <View style={{marginVertical:10}}>
            <Text style={{fontWeight:'500'}}>Debit or Credit card </Text>
            <Text style={{color:COLORS.gray, marginBottom:5}}>Visa, Mastercard, American Express, Discover</Text>
            <TextInput
                mode="outlined"
                label="Card Number"
                placeholder="Card Number"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                keyboardType="numeric"
                value={card.number}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.number}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 
            <TextInput
                mode="outlined"
                label="Name on Card"
                placeholder="Name on Card"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                // keyboardType="numeric"
                value={card.number}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.name}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 
            <TextInput
                mode="outlined"
                label="Expiry Date"
                placeholder="Expiry Date"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                keyboardType="numeric"
                value={card.expiry_date}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.expiry_date}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 
            <TextInput
                mode="outlined"
                label="CVV"
                placeholder="CVV"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                keyboardType="numeric"
                value={card.cvv}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.cvv}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 

                <TouchableOpacity 
                    style={styles.button} 
                    >
                    
                    <Text bold style={styles.button_text}> Add Card</Text>
                </TouchableOpacity>
            </View>

        }  

        {selectedOption==='paypal' && 
            <View style={{marginVertical:10}}>
            <Text style={{fontWeight:'500'}}>PayPal </Text>
            <Text style={{color:COLORS.gray, marginBottom:5}}>Enter email tied to your paypal account. 25% charge</Text>
                <TextInput
                mode="outlined"
                label="Email"
                placeholder="Enter Email"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                value={paypal.email}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.email}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 

                <TouchableOpacity 
                    style={styles.button} 
                    >
                    
                    <Text bold style={styles.button_text}> Add Paypal</Text>
                </TouchableOpacity>
            </View>
        }
        {selectedOption==='bank' && 
            <View style={{marginVertical:10}}>
            <Text style={{fontWeight:'500'}}>Bank Transfer </Text>
            <Text style={{color:COLORS.gray, marginBottom:5}}>Enter your bank details 20% charges</Text>
                <TextInput
                mode="outlined"
                label="Account Holder Name"
                placeholder="Account Holder Name"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                value={bank.name}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.name}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 
            <TextInput
                mode="outlined"
                label="Account Number"
                placeholder="Account Number"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                keyboardType="numeric"
                value={bank.account_number}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.account_number}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 
            <TextInput
                mode="outlined"
                label="Routing Number"
                placeholder="Routing Number"
                placeholderTextColor={COLORS.gray}
                outlineColor="#D8D8D8"
                keyboardType="numeric"
                value={bank.routing_number}
                activeOutlineColor={COLORS.primary}
                style={{marginBottom:10, color:COLORS.gray, fontSize:16, backgroundColor:"#fff"}}
                onChangeText={handleAChange}
                onFocus={() => handleError(null, 'address')}
                error={errors.routing_number}
                // left={<TextInput.Icon name={() => <MaterialIcons name="attach-money" size={24} color="black" />} />}
                // left={<TextInput.Icon  icon="account-outline" style={{marginTop:10}} fontSize="small" />}
            /> 
                <TouchableOpacity 
                    style={styles.button} 
                    >
                    
                    <Text bold style={styles.button_text}> Add Bank Account</Text>
                </TouchableOpacity>
            </View>
        }

        
          
        </View>
    </View>
    );
};
const windowHeight = Dimensions.get('window').height;
const modalHeight = windowHeight * 1;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:COLORS.backgroundColor,
      padding:20,
      justifyContent: 'center',
    alignItems: 'center',
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      detailsContainer: {
        marginBottom: 20,
      },
      label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      details: {
        fontSize: 16,
      },
      button: {
        flexDirection:'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical:20,
        justifyContent:'center',
        backgroundColor: COLORS.primary,
        borderRadius:50
      },
      button_text:{
        color:COLORS.white
      },
      modalContainer: {
        flex: 1,
        // justifyContent: 'flex-end',
        // alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.1)', // semi-transparent background
      },
      modalContent: {
        backgroundColor: 'white',
        padding: 20,
        // borderRadius: 10,
        borderTopRightRadius:10,
        borderTopLeftRadius:10,
        elevation: 5,
        height: modalHeight, // Set the height of the modal
        width: '100%',
      },
      close_button:{
       
        alignItems:'flex-end'
      },
      textInput: {
        marginBottom: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
    },
    picker: {
        height: 40,
        width: '100%',
    },
})

export default PaymentMethod;
