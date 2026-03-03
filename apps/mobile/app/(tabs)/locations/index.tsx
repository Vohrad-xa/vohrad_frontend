import React from 'react';
import {LocationsList, useLocationsSource} from '@/features/location';
import {useSearch} from '@/providers';

export default function LocationsScreen() {
  const {searchQuery} = useSearch();

  const {locations, isLoading, hasNext, loadMore, refresh, lastUpdated} =
    useLocationsSource({searchQuery});

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
