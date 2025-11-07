import React from 'react';
import {View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';

interface AttachmentAddOptionsProps {
  onTakePicture?: () => void;
  onUploadFiles?: () => void;
}

export function AttachmentAddOptions({
  onTakePicture,
  onUploadFiles,
}: AttachmentAddOptionsProps) {
  return (
    <View>
      <Card>
        <Card.Row
          icon="camera-outline"
          onPress={onTakePicture}
          accessibilityLabel="Take picture"
        >
          <ThemedText variant="label">Take picture</ThemedText>
        </Card.Row>
        <Card.Divider withIconOffset />
        <Card.Row
          icon="cloud-upload-outline"
          onPress={onUploadFiles}
          accessibilityLabel="Upload from device"
        >
          <ThemedText variant="label">Upload from device</ThemedText>
        </Card.Row>
      </Card>
    </View>
  );
}
