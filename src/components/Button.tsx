/**
 * Button
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { ButtonProps } from '@/src/utils/types';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import {
  Pressable,
  Text,
  useWindowDimensions
} from 'react-native';

export default function Button(props: ButtonProps) {
    const { styles, colors } = useTheme();
    const { width, height } = useWindowDimensions();

    return (
      <Pressable style={({ pressed }) => [styles.buttonth, 
                          pressed && {backgroundColor: colors.gray},
                         {width: width*props.widthSize, height: height*props.heightSize},
                          props.isFormValid && styles.buttonDisabled]}
                 onPress={props.onPress}
                 disabled={props.isFormValid} >
        {props.icon && (
          <Icon name={props.icon as any} 
                size={20} 
                color={props.isFormValid ? "#A1A1A1" : "white"}
          />
        )}
        <Text style={[styles.buttonText, 
                     {fontSize: props.fontSize},
                     props.isFormValid && styles.buttonTextDisabled
                    ]}>
          {props.label}
        </Text>
      </Pressable>
    );    
}