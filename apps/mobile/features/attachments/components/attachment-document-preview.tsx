import React, {useEffect} from 'react';
import {Linking, Platform} from 'react-native';
import {useHeaderHeight} from '@react-navigation/elements';
import WebView from 'react-native-webview';

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
  const headerHeight = useHeaderHeight();

  const previewUrl = attachment.sourceUrl;

  useEffect(() => {
    if (Platform.OS === 'web' && previewUrl) {
      Linking.openURL(previewUrl);
    }
  }, [previewUrl]);

  if (!previewUrl) return null;

  if (Platform.OS === 'web' || Platform.OS === 'android') return null;

  return (
    <WebView
      source={{uri: previewUrl}}
      originWhitelist={['*']}
      javaScriptEnabled
      removeClippedSubviews
      allowsBackForwardNavigationGestures
      contentInset={{top: headerHeight}}
      scrollIndicatorInsets={{
        top: headerHeight,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustsScrollIndicatorInsets={false}
    />
  );
}
