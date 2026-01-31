// use-profile-edit.ts
import {useCallback, useState} from 'react';
import {useProfile} from './use-profile';

export function useProfileEdit() {
  const {
    // Name
    firstName,
    lastName,
    updateName,

    // Phone
    phoneNumber,
    updatePhoneNumber,

    // Address
    address,
    city,
    province,
    postalCode,
    country,
    updateAddress,

    // Email
    email,
    pendingEmail,
    pendingEmailExpiresAt,
    updateEmail,

    // Date of Birth
    dateOfBirth,
    updateDateOfBirth,

    // Common
    isLoading,
  } = useProfile();

  // --------------------
  // Name
  // --------------------
  const [firstNameValue, setFirstNameValue] = useState(firstName);
  const [lastNameValue, setLastNameValue] = useState(lastName);

  const saveName = useCallback(async () => {
    await updateName(firstNameValue.trim(), lastNameValue.trim());
  }, [firstNameValue, lastNameValue, updateName]);

  // --------------------
  // Phone
  // --------------------
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

  // --------------------
  // Address
  // --------------------
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

  // --------------------
  // Email
  // --------------------
  const [emailValue, setEmailValue] = useState(email);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const startEditingEmail = useCallback(() => {
    setIsEditingEmail(true);
  }, []);

  const cancelEditingEmail = useCallback(() => {
    setIsEditingEmail(false);
    setEmailValue(email);
  }, [email]);

  // Android/Web: always allow save
  const saveEmail = useCallback(async () => {
    if (emailValue !== email) {
      await updateEmail(emailValue);
    }
  }, [emailValue, email, updateEmail]);

  // iOS: only save if user entered edit mode
  const saveEmailIfEditing = useCallback(async () => {
    if (isEditingEmail && emailValue !== email) {
      await updateEmail(emailValue);
    }
  }, [isEditingEmail, emailValue, email, updateEmail]);

  // --------------------
  // Date of birth
  // --------------------
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
      pendingEmail,
      pendingEmailExpiresAt,
      emailValue,
      setEmailValue,
      isEditing: isEditingEmail,
      startEditing: startEditingEmail,
      cancelEditing: cancelEditingEmail,
      save: saveEmail, // android/web
      saveIfEditing: saveEmailIfEditing, // ios
    },

    dateOfBirth: {
      dateOfBirth,
      selectedDate,
      setSelectedDate,
      save: saveDateOfBirth,
    },
  };
}
