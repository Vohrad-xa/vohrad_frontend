import {useCallback, useState} from 'react';
import {Platform} from 'react-native';
import {useOidcFlow} from '@/features/auth/use-oidc-flow';
import {useAuth} from '@/providers';
import {useProfile} from './use-profile';

export function useProfileEdit() {
  const {startWebLogin} = useAuth();
  const {startFlow} = useOidcFlow();
  const {
    firstName,
    lastName,
    updateName,
    phoneNumber,
    updatePhoneNumber,
    address,
    city,
    province,
    postalCode,
    country,
    updateAddress,
    email,
    dateOfBirth,
    updateDateOfBirth,
    isLoading,
  } = useProfile();

  /* Name */
  const [firstNameValue, setFirstNameValue] = useState(firstName);
  const [lastNameValue, setLastNameValue] = useState(lastName);

  const saveName = useCallback(async () => {
    await updateName(firstNameValue.trim(), lastNameValue.trim());
  }, [firstNameValue, lastNameValue, updateName]);

  /* Phone */
  const [phoneValue, setPhoneValue] = useState(phoneNumber);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const startEditingPhone = useCallback(() => {
    setIsEditingPhone(true);
  }, []);

  const savePhone = useCallback(async () => {
    if (phoneValue !== phoneNumber) {
      await updatePhoneNumber(phoneValue);
    }
  }, [phoneValue, phoneNumber, updatePhoneNumber]);

  /* Address */
  const [addressValue, setAddressValue] = useState(address);
  const [cityValue, setCityValue] = useState(city);
  const [provinceValue, setProvinceValue] = useState(province);
  const [postalCodeValue, setPostalCodeValue] = useState(postalCode);
  const [countryValue, setCountryValue] = useState(country);

  const saveAddress = useCallback(async () => {
    await updateAddress({
      address: addressValue,
      city: cityValue,
      province: provinceValue,
      postal_code: postalCodeValue,
      country: countryValue,
    });
  }, [
    addressValue,
    cityValue,
    provinceValue,
    postalCodeValue,
    countryValue,
    updateAddress,
  ]);

  /* Email */
  const requestEmailChange = useCallback(async () => {
    if (Platform.OS === 'web') {
      const returnTo =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/';
      await startWebLogin(returnTo, {action: 'update_email'});
      return;
    }

    await startFlow({action: 'update_email'});
  }, [startFlow, startWebLogin]);

  // Date of birth
  const [selectedDate, setSelectedDate] = useState<Date>(
    dateOfBirth ? new Date(dateOfBirth) : new Date(),
  );

  const saveDateOfBirth = useCallback(async () => {
    await updateDateOfBirth(selectedDate);
  }, [selectedDate, updateDateOfBirth]);

  return {
    isLoading,

    name: {
      firstName,
      lastName,
      firstNameValue,
      lastNameValue,
      setFirstNameValue,
      setLastNameValue,
      save: saveName,
    },

    phone: {
      phoneNumber,
      phoneValue,
      setPhoneValue,
      isEditing: isEditingPhone,
      startEditing: startEditingPhone,
      save: savePhone,
    },

    address: {
      address,
      city,
      province,
      postalCode,
      country,
      addressValue,
      cityValue,
      provinceValue,
      postalCodeValue,
      countryValue,
      setAddressValue,
      setCityValue,
      setProvinceValue,
      setPostalCodeValue,
      setCountryValue,
      save: saveAddress,
    },

    email: {
      email,
      requestChange: requestEmailChange,
      save: requestEmailChange,
    },

    dateOfBirth: {
      dateOfBirth,
      selectedDate,
      setSelectedDate,
      save: saveDateOfBirth,
    },
  };
}
