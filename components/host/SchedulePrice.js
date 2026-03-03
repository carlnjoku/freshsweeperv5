import {Text, StyleSheet} from 'react-native'
import COLORS from '../../constants/colors'

export const SchedulePrice = ({price, currency}) => {
    
    return (
        <Text style={styles.price}>{currency}{price}</Text>
    )
}


const styles = StyleSheet.create({
    price :{ 
        fontSize : 26,
        fontWeight:'600',
        color:COLORS.primary
    }
})