import React, {useEffect} from 'react';
import {Linking, Platform, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
type DocumentFields = {
  sourceUrl?: string;
  originalFilename?: string;
  filename?: string;
  extension?: string;
  fileType?: string;
};

type AttachmentDocumentPreviewProps = {
  attachment: DocumentFields & {id: string};
};

export function AttachmentDocumentPreview({
  attachment,
}: AttachmentDocumentPreviewProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const previewUrl = attachment.sourceUrl;

  // Handle web/android linking
  useEffect(() => {
    if ((Platform.OS === 'web' || Platform.OS === 'android') && previewUrl) {
      Linking.openURL(previewUrl);
    }
  }, [previewUrl]);

  if (!previewUrl) {
    return null;
  }

  // For web/android linking will handle the navigation
  if (Platform.OS === 'web' || Platform.OS === 'android') {
    return null;
  }

  // iOS rendering with WebView
  return (
    <View style={styles.container}>
      <WebView
        source={{uri: previewUrl}}
        originWhitelist={['*']}
        allowsBackForwardNavigationGestures
        style={styles.webview}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}

const useStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      webview: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
