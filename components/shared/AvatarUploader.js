import React, { useState, useEffect, useContext } from 'react';
import { Image, View, Platform, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


import AsyncStorage from '@react-native-async-storage/async-storage';
// import uploadFile from '../firebase/UploadFile';
import uploadFile from '../../services/firebase/UploadFile';
import COLORS from '../../constants/colors';
import { Avatar } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';


export default function UploadImage(props) {

  const {update_avatar, currentUser} = useContext(AuthContext)

  // console.log(props)
  const{userId, image_type, default_photo, get_uploaded_photo} = props;
  
  const[image, setImage] = useState("");
  const[photoUrl, setPhotoURL] = useState(null);
  const[userDetails, setUserDetails] = useState("")

  const getPhoto = (e) => {
    get_uploaded_photo(e)
  }
  
  useEffect(()=>{
    // alert(default_photo)
    setImage(default_photo)  
    setTimeout(async()=> {
      let tokenU;
      tokenU = null

      try {
        const jsonValue = await AsyncStorage.getItem('@storage_Key')
        const userInfo = JSON.parse(jsonValue)
        console.log(userInfo._id)
        setUserDetails(userInfo)

        console.log("EEEEEEEEEEEEEEEEE")
        // console.log(userInfo)
        console.log("EEEEEEEEEEEEEEEEE")

        // console.log(business_info)
  
      } catch(e) {
        // error reading value
      }
    
      //  setIsLoading(false)
    }, 1000)
  },[])
  
  const addImage = async()=>{
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
  });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        upload(result.assets[0].uri)
      }
      
  };

  const upload = async(file) => {
    
    if(image_type === 'avatar'){
    const imageName = 'avatar_'+currentUser._id + '.' + file?.split('.')?.pop();
    const img = await uploadFile(
        file,
        `profile/${imageName}`
        // `profile/${currentUser?._id}/${imageName}`
    );

    getPhoto(img)

   

    }else{
      const imageName = userDetails._id + '.' + file?.split('.')?.pop();
      const img = await uploadFile(
          file,
          `profile/${userDetails?._id}/${imageName}`
      );

      getPhoto(img)
      update_avatar(img)
    }
        
  }



  return (
        <View style={styles.container}>
            
                  {default_photo ? 
                    <Image 
                        source={{uri:default_photo}}
                        style={{height:120, width:120, marginBottom:0}} 
                    />
                    :
                    image_type === "logo" ? 
                      <Avatar.Image
                          size={120}
                          source={require('../../assets/images/store-icon.png')}
                          style={{ backgroundColor: COLORS.gray, width:80, height:80,  marginBottom:0 }}
                      />
                      :
                      <Avatar.Image
                          size={120}
                          source={require('../../assets/images/default_avatar.png')}
                          style={{ backgroundColor: COLORS.gray, marginBottom:0 }}
                      />

                    
                    }
                <View style={styles.uploadBtnContainer}>
                    <TouchableOpacity onPress={addImage} style={styles.uploadBtn} >
                        <Text style={{fontSize:12}}>{image ? 'Change' : 'Upload'} { image_type === "avatar" ? 'avatar' : 'photo' }</Text>
                        <AntDesign name="camera" size={20} color="black" />
                    </TouchableOpacity>
                </View>
        </View>
  );
}
const styles=StyleSheet.create({
    container:{
        elevation:2,
        height:120,
        width:120,
        backgroundColor:'#efefef',
        // position:'relative',
        borderRadius:999,
        overflow:'hidden',
        marginTop:0
    },
    uploadBtnContainer:{
        opacity:0.7,
        position:'absolute',
        right:0,
        bottom:0,
        backgroundColor:'lightgrey',
        width:'100%',
        height:'37%',
        paddingTop:5
    },
    uploadBtn:{
        display:'flex',
        alignItems:"center",
        justifyContent:'center'
    }
})

