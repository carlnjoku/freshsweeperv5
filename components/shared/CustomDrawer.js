import React, { useContext } from 'react';
import { SafeAreaView,StyleSheet, Image, ImageBackground, Text, View, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import COLORS from '../../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/connection/userService';








const CustomDrawer = (props) => {
    const { logout, currentUserId, currentUser, applicationCounts }  = useContext(AuthContext)
    

    // const[currentUserId, setCurrentUserId] = React.useState("2387t328738yrh87337")
    // const[logout, setLogout] = React.useState("")

    const[firstname, setFirstname] = React.useState("")
    const[lastname, setLastname] = React.useState("")
    const[city, setCity] = React.useState("")
    const[state, setState] = React.useState("")
    const[avatar, setAvatar] = React.useState("")

console.log("treeeeeeeeeeeeeeeeee1000000000000")
console.log(avatar)
console.log("treeeeeeeeeeeeeeeeee1000000000000")

    const getUser = async () => {
      
        try {
          
          await userService.getUser(currentUserId)
          .then(response => {
            const res = response.data
            setFirstname(res.firstname)
            setLastname(res.lastname)
            // setUsername(res.username)
            setCity(res.location.city)
            setState(res.location.region)
            setAvatar(res.avatar)
            
          })
          
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch(e) {
          // error reading value
        }
    }


    React.useEffect(() => {
        getUser()
    },[])

    const logUserOut = (id) => {

        logout()
        const data = {userId:id}
        userService.logOut(data)
            .then(response => {
                const res = response.data.data
                // console.log(res)
        
            })
    }
    
    return(
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props}
                contentContainerStyle={{
                    backgroundColor: COLORS.primary,
                    padding: 0,
                    margin: -18, // removes any margin
                    width:'120%', 
                  }}
                  style={{ margin: 0, padding: 0 }} // extra safety
            >
                <ImageBackground style={{padding:20, marginLeft:30, marginTop:-5, backgroundColor:COLORS.primary}}>
                    {/* {currentUser.avatar ? 
                        <Image 
                            source={{uri:avatar}}
                            style={{height:100, width:100, borderRadius:50, borderWidth:2, borderColor:COLORS.light_gray_1, marginBottom:10}} 
                        />
                        :

                        <Avatar.Image
                            size={100}
                            source={require('../assets/default_avatar.png')}
                            style={{ backgroundColor: COLORS.gray }}
                        />
                    } */}

                    <Image
                        source={
                            avatar
                            ? { uri: avatar }
                            : require('../../assets/images/default_avatar.png') // Fallback image
                        }
                        style={{height:100, width:100, borderRadius:50, borderWidth:2, borderColor:COLORS.light_gray_1, marginBottom:10}} 
                    />

                    
                    <Text style={{color:"#f3f3f3",  fontSize:18, fontWeight:"600"}}>{firstname} {lastname}</Text>
                    {city ? 
                    <View style={{flexDirection:"row"}}>
                        <Text style={{color:COLORS.white, fontSize:14, fontWeight:"normal"}}>{city}, {state}</Text>
                        <Ionicons name="flag-outline" color = "#ddd" style={{marginTop:5, marginLeft:5}} />
                    </View>
                    :

                    <View style={{flexDirection:"row"}}>
                        
                    </View>
                    }
                </ImageBackground>
                <View style={{backgroundColor:"#fff", paddingLeft:20, height:'100%'}}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={{padding:20, borderTopWidth:1, borderTopColor:"#eee"}}>
                <TouchableOpacity style={{paddingVertical:15}} onPress = {logout} >
                    <View style={{ flexDirection:"row", alignItems:'center'}}>
                        <Ionicons name='log-out-outline' size={22} />
                        <Text style={{fontSize:15, marginLeft:10, color:"#333"}}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}


export default CustomDrawer