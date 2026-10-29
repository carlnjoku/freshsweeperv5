import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppText from './AppText';
import { useTheme } from '../../theme';

const CircleIcon = ({
    iconName,
    onPress,
    buttonSize,
    roomSize,
    type,
    radiusSise,
    iconSize,
    title,
    title_color,
}) => {
    const { theme, isDark } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'column',
            alignItems: 'center',
        },

        button: {
            height: buttonSize,
            width: buttonSize,
            borderRadius: radiusSise,
            backgroundColor: theme.surface.elevated,
            borderWidth: 0.8,
            borderColor: theme.border.default,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 2,
        },

        title: {
            marginRight: 10,
            marginTop: 4,
            fontSize: 13,
            color: title_color || theme.text.secondary,
            textAlign: 'center',
        },

        roomSize: {
            fontSize: 11,
            marginTop: 2,
            color: theme.text.muted,
            textAlign: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={0.7}
                accessibilityRole={onPress ? 'button' : undefined}
                accessibilityLabel={`${title || ''} ${type || ''}`}
            >
                <MaterialCommunityIcons
                    name={iconName}
                    size={iconSize}
                    color={theme.icon.default}
                />
            </TouchableOpacity>

            <AppText style={styles.title}>
                {title} {type}
            </AppText>

            {roomSize !== undefined &&
                roomSize !== null &&
                roomSize !== '' && (
                    <AppText style={styles.roomSize}>
                        {roomSize} ft²
                    </AppText>
                )}
        </View>
    );
};

export default CircleIcon;