import React from 'react';
import {useIsFocused} from '@react-navigation/native';
import {LocationsList, useLocationsSource} from '@/features/location';
import {useSearch} from '@/providers';

export default function LocationsScreen() {
  const isFocused = useIsFocused();
  const {searchQuery} = useSearch();

  const {locations, isLoading, hasNext, loadMore, refresh, lastUpdated} =
    useLocationsSource({searchQuery, enabled: isFocused});

  return (
    <LocationsList
      locations={locations}
      onLocationPress={() => {}}
      onRefresh={refresh}
      onEndReached={hasNext ? loadMore : undefined}
      isLoading={isLoading}
      lastUpdated={lastUpdated}
    />
  );
}
