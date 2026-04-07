/**
 * Image Viewer
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { imgProps } from '@/src/utils/types';
import { Image } from 'react-native';

export default function ImageViewer( props: imgProps) {
  const imageSource = props.selectedImage ? { uri: props.selectedImage } : props.imgSource;
  const { styles } = useTheme();

  return <Image source={imageSource} style={styles.imagest} />;
}