import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
} from "react";

import {
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  TextInput,
  RadioButton,
  Modal,
  Portal,
  Provider,
  Icon,
} from "react-native-paper";

import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

import { AuthContext } from "../../context/AuthContext";
import userService from "../../services/connection/userService";

import ROUTES from "../../constants/routes";

import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
import AddressInput from "../../components/shared/AddressInput";
import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
import CleanerManagementModal from "./CleanerManagementModal";

import useLocationPermission from "../../components/shared/UseLocationPermission";

import { propertyList } from "../../data";

import { geocodeAddress } from "../../utils/geocodeAddress";
import { tSafe } from "../../utils/tSafe";

import { GOOGLE_MAPS_API_KEY } from "../../env";

import { useTheme } from "../../theme";
import AppText from "../../ui/AppText";
import AppCard from "../../ui/AppCard";
import AppButton from "../../ui/AppButton";


/*
 * ================================================================
 * HELPERS
 * ================================================================
 */

const withAlpha = (
  color,
  alpha,
  fallback
) => {
  if (
    typeof color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback || color;
};


const getRoomIcon = (type) => {
  switch (type) {
    case "Bedroom":
      return "bed-outline";

    case "Bathroom":
      return "shower";

    case "Livingroom":
      return "sofa-outline";

    case "Kitchen":
      return "silverware-fork-knife";

    default:
      return "home-outline";
  }
};


const getShadow = (theme) => ({
  shadowColor:
    theme.shadow?.color ||
    "#000000",

  shadowOpacity:
    theme.shadow?.opacity ??
    0.08,

  shadowOffset: {
    width: 0,
    height: 3,
  },

  shadowRadius: 8,

  elevation: 3,
});


/*
 * ================================================================
 * COMPONENT
 * ================================================================
 */

export default function AddProperty() {
  const { theme } = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  /*
   * ------------------------------------------------------------
   * PAPER THEME
   *
   * Important:
   * React Native Paper uses several color tokens internally.
   * Supplying only `primary` and `onSurface` is not enough for
   * reliable dark-mode rendering.
   * ------------------------------------------------------------
   */

  const paperTheme = useMemo(
    () => ({
      roundness: 14,

      colors: {
        primary:
          theme.border.focus ||
          theme.brand.primary,

        background:
          theme.input.background,

        surface:
          theme.surface.default,

        surfaceVariant:
          theme.surface.selected,

        text:
          theme.input.text ||
          theme.text.primary,

        onSurface:
          theme.input.text ||
          theme.text.primary,

        onSurfaceVariant:
          theme.text.secondary,

        placeholder:
          theme.input.placeholder ||
          theme.text.muted,

        outline:
          theme.input.border ||
          theme.border.default,

        outlineVariant:
          theme.border.default,

        error:
          theme.status.error,

        errorContainer:
          withAlpha(
            theme.status.error,
            "18",
            theme.surface.selected
          ),

        onError:
          theme.text.inverse,

        disabled:
          theme.text.disabled,

        onSurfaceDisabled:
          theme.text.disabled,

        backdrop:
          theme.overlay,
      },
    }),
    [theme]
  );

  /*
   * ------------------------------------------------------------
   * AUTH / NAVIGATION
   * ------------------------------------------------------------
   */

  const {
    currentUserId,
    geolocationData,
  } = useContext(AuthContext);

  const {
    hasPermission,
  } = useLocationPermission();

  const navigation =
    useNavigation();

  /*
   * ------------------------------------------------------------
   * REFS
   * ------------------------------------------------------------
   */

  const scrollViewRef =
    useRef(null);

  const instructionInputRef =
    useRef(null);

  /*
   * ------------------------------------------------------------
   * ROOM STATE
   * ------------------------------------------------------------
   */

  const [
    roomDetails,
    setRoomDetails,
  ] = useState([
    {
      type: "Bedroom",
      number: 0,
      size: 120,
      size_range: "Small",
    },
    {
      type: "Bathroom",
      number: 0,
      size: 120,
      size_range: "Small",
    },
    {
      type: "Livingroom",
      number: 0,
      size: 150,
      size_range: "Medium",
    },
    {
      type: "Kitchen",
      number: 0,
      size: 140,
      size_range: "Small",
    },
  ]);

  /*
   * ------------------------------------------------------------
   * PROPERTY STATE
   * ------------------------------------------------------------
   */

  const [
    aptType,
    setAptType,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    firstname,
    setFirstname,
  ] = useState("");

  const [
    lastname,
    setLastname,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    avatar,
    setAvatar,
  ] = useState("");

  const [
    inputs,
    setInputs,
  ] = useState({
    apt_name: "",
    instructions: "",
    cleaning_supplies: "",
    contact_phone: "",
    created_on: "",
    roomInfo: [],
  });

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [
    checked,
    setChecked,
  ] = useState("");

  /*
   * ------------------------------------------------------------
   * LOCATION
   * ------------------------------------------------------------
   */

  const [
    latitude,
    setLatitude,
  ] = useState(null);

  const [
    longitude,
    setLongitude,
  ] = useState(null);

  const [
    city,
    setCity,
  ] = useState(null);

  const [
    coordinates,
    setCoordinates,
  ] = useState(null);

  const [
    showGoogleAutocomplete,
    setShowGoogleAutocomplete,
  ] = useState(true);

  const [
    autocompleteError,
    setAutocompleteError,
  ] = useState(null);

  /*
   * ------------------------------------------------------------
   * CLEANERS
   * ------------------------------------------------------------
   */

  const [
    preferredCleaners,
    setPreferredCleaners,
  ] = useState([]);

  const [
    invitedCleanerEmail,
    setInvitedCleanerEmail,
  ] = useState("");

  const [
    invitedCleanerPhone,
    setInvitedCleanerPhone,
  ] = useState("");

  const [
    invitedCleaners,
    setInvitedCleaners,
  ] = useState([]);

  const [
    cleanerModalVisible,
    setCleanerModalVisible,
  ] = useState(false);

  const [
    platformCleaners,
    setPlatformCleaners,
  ] = useState([]);

  /*
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    keyboardHeight,
    setKeyboardHeight,
  ] = useState(0);

  const [
    errors,
    setErrors,
  ] = useState({
    apt_name: null,
    address: null,
    apt_type: null,
    contact_phone: null,
    instructions: null,
    room_count: {},
    room_size: {},
  });

  /*
   * ==============================================================
   * DERIVED VALUES
   * ==============================================================
   */

  const totalRooms =
    roomDetails.reduce(
      (total, room) =>
        total + room.number,
      0
    );

  const totalBedrooms =
    roomDetails.find(
      (room) =>
        room.type === "Bedroom"
    )?.number || 0;

  const totalBathrooms =
    roomDetails.find(
      (room) =>
        room.type === "Bathroom"
    )?.number || 0;

  const hasVerifiedAddress =
    !!address &&
    !!coordinates?.latitude &&
    !!coordinates?.longitude;

  const roomConfigurationComplete =
    totalRooms > 0 &&
    roomDetails.every(
      (room) =>
        room.number > 0 &&
        room.size >= 50 &&
        room.size <= 600
    );

  /*
   * ==============================================================
   * INITIALIZATION
   * ==============================================================
   */

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener =
      Keyboard.addListener(
        "keyboardDidShow",
        (event) => {
          setKeyboardHeight(
            event.endCoordinates
              .height
          );
        }
      );

    const keyboardDidHideListener =
      Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setKeyboardHeight(0);
        }
      );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  /*
   * ==============================================================
   * GOOGLE PLACES
   * ==============================================================
   */

  useEffect(() => {
    const checkApiKey =
      async () => {
        /*
         * Keep the existing behavior here.
         *
         * GoogleAutocomplete itself will determine whether
         * the configured key is usable.
         */
        if (!GOOGLE_MAPS_API_KEY) {
          setShowGoogleAutocomplete(
            false
          );

          setAutocompleteError(
            tSafe(
              "address_service_unavailable",
              "Address service unavailable. Please enter manually."
            )
          );
        }
      };

    if (showGoogleAutocomplete) {
      checkApiKey();
    }
  }, [showGoogleAutocomplete]);

  /*
   * ==============================================================
   * PLATFORM CLEANERS
   * ==============================================================
   */

  useEffect(() => {
    if (
      !coordinates?.latitude ||
      !coordinates?.longitude
    ) {
      return;
    }

    fetchPlatformCleaners(
      coordinates.latitude,
      coordinates.longitude
    );
  }, [coordinates]);

  const fetchPlatformCleaners =
    async (
      lat,
      lng
    ) => {
      try {
        const response =
          await userService.getPlatformCleaners(
            {
              latitude: lat,
              longitude: lng,
              radius: 100,
            }
          );

        setPlatformCleaners(
          Array.isArray(
            response?.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.log(
          "Failed to fetch platform cleaners",
          error
        );

        setPlatformCleaners([]);
      }
    };

  /*
   * ==============================================================
   * USER
   * ==============================================================
   */

  const fetchUser =
    async () => {
      try {
        const response =
          await userService.getUser(
            currentUserId
          );

        const res =
          response?.data;

        if (!res) {
          return;
        }

        setFirstname(
          res.firstname || ""
        );

        setLastname(
          res.lastname || ""
        );

        setEmail(
          res.email || ""
        );

        setAvatar(
          res.avatar || ""
        );

        setCity(
          res.location?.city ||
            null
        );
      } catch (error) {
        console.log(
          "Unable to load user profile",
          error
        );
      }
    };

  /*
   * ==============================================================
   * ADDRESS HANDLING
   * ==============================================================
   */

  const handleAutocompleteSelect =
    async (
      selectedAddress
    ) => {
      try {
        const {
          latitude:
            selectedLatitude,
          longitude:
            selectedLongitude,
        } =
          await geocodeAddress(
            selectedAddress
          );

        setCoordinates({
          latitude:
            selectedLatitude,
          longitude:
            selectedLongitude,
        });

        setLatitude(
          selectedLatitude
        );

        setLongitude(
          selectedLongitude
        );

        setAddress(
          selectedAddress
        );

        setAutocompleteError(
          null
        );

        setErrors(
          (previous) => ({
            ...previous,
            address: null,
          })
        );
      } catch (error) {
        console.error(
          "Geocoding failed:",
          error
        );

        setCoordinates(null);

        setLatitude(null);
        setLongitude(null);

        setAutocompleteError(
          tSafe(
            "failed_verify_address",
            "Failed to verify address. Please enter manually."
          )
        );

        setShowGoogleAutocomplete(
          false
        );
      }
    };

  const handleAutocompleteError =
    (error) => {
      if (
        [
          "ZERO_RESULTS",
          "REQUEST_DENIED",
          "INVALID_REQUEST",
          "UNKNOWN_ERROR",
        ].includes(error)
      ) {
        setAutocompleteError(
          tSafe(
            "address_service_unavailable",
            "Address service unavailable. Please enter manually."
          )
        );

        setShowGoogleAutocomplete(
          false
        );
      }
    };

  const handleManualAddressChange =
    (value) => {
      setAddress(value);

      setCoordinates(null);
      setLatitude(null);
      setLongitude(null);

      setErrors(
        (previous) => ({
          ...previous,
          address: null,
        })
      );

      setAutocompleteError(
        null
      );
    };

  const handleManualVerification =
    (coords) => {
      if (
        !coords?.latitude ||
        !coords?.longitude
      ) {
        return;
      }

      setCoordinates(coords);

      setLatitude(
        coords.latitude
      );

      setLongitude(
        coords.longitude
      );

      setErrors(
        (previous) => ({
          ...previous,
          address: null,
        })
      );

      setAutocompleteError(
        null
      );
    };

  /*
   * ==============================================================
   * ROOM HANDLING
   * ==============================================================
   */

  const getRoomSizeCategory =
    (size) => {
      if (size < 150) {
        return tSafe(
          "size_small",
          "Small"
        );
      }

      if (size <= 300) {
        return tSafe(
          "size_medium",
          "Medium"
        );
      }

      return tSafe(
        "size_large",
        "Large"
      );
    };

  const handleRoomCountChange =
    (
      roomType,
      action
    ) => {
      setRoomDetails(
        (previousRooms) =>
          previousRooms.map(
            (room) => {
              if (
                room.type !==
                roomType
              ) {
                return room;
              }

              const newCount =
                action === "add"
                  ? room.number +
                    1
                  : Math.max(
                      0,
                      room.number -
                        1
                    );

              setErrors(
                (
                  previousErrors
                ) => ({
                  ...previousErrors,
                  room_count: {
                    ...previousErrors.room_count,
                    [roomType]:
                      newCount >
                      0
                        ? null
                        : previousErrors
                            .room_count?.[
                            roomType
                          ],
                  },
                })
              );

              return {
                ...room,
                number:
                  newCount,
              };
            }
          )
      );
    };

  const handleRoomSizeChange =
    (
      type,
      size
    ) => {
      setRoomDetails(
        (previous) =>
          previous.map(
            (room) =>
              room.type === type
                ? {
                    ...room,
                    size,
                    size_range:
                      getRoomSizeCategory(
                        size
                      ),
                  }
                : room
          )
      );
    };

  const handleConfirmRoomSelection =
    () => {
      if (totalRooms <= 0) {
        const roomErrors =
          {};

        roomDetails.forEach(
          (room) => {
            roomErrors[
              room.type
            ] = tSafe(
              "room_count_error",
              "{type} count must be greater than 0",
              {
                type: room.type,
              }
            );
          }
        );

        setErrors(
          (previous) => ({
            ...previous,
            room_count:
              roomErrors,
          })
        );

        return;
      }

      setModalVisible(true);
    };

  const handleCloseModal =
    () => {
      setRoomDetails(
        (previous) =>
          previous.map(
            (room) => ({
              ...room,
              size_range:
                getRoomSizeCategory(
                  room.size
                ),
            })
          )
      );

      setModalVisible(false);
    };

  /*
   * ==============================================================
   * INPUT HANDLING
   * ==============================================================
   */

  const handleChange = (
    text,
    input
  ) => {
    setInputs(
      (previous) => ({
        ...previous,
        [input]: text,
      })
    );

    if (errors[input]) {
      setErrors(
        (previous) => ({
          ...previous,
          [input]: null,
        })
      );
    }
  };

  const formatPhoneNumber =
    (input) => {
      const cleaned =
        String(input).replace(
          /\D/g,
          ""
        );

      const match =
        cleaned.match(
          /^(\d{3})(\d{3})(\d{4})$/
        );

      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }

      return input;
    };

  const handleInputChange =
    (text) => {
      setPhoneNumber(
        formatPhoneNumber(text)
      );

      if (
        errors.contact_phone
      ) {
        setErrors(
          (previous) => ({
            ...previous,
            contact_phone:
              null,
          })
        );
      }
    };

  /*
   * ==============================================================
   * CLEANER INVITATION
   * ==============================================================
   */

  const handleInviteCleaner =
    () => {
      if (
        !invitedCleanerEmail &&
        !invitedCleanerPhone
      ) {
        Alert.alert(
          tSafe(
            "error_title",
            "Error"
          ),
          tSafe(
            "email_or_phone_required",
            "Email or phone is required"
          )
        );

        return;
      }

      const tempId =
        uuidv4();

      setPreferredCleaners(
        (previous) => [
          ...previous,
          {
            id: tempId,
            type: "invited",
          },
        ]
      );

      setInvitedCleaners(
        (previous) => [
          ...previous,
          {
            tempId,
            email:
              invitedCleanerEmail ||
              null,
            phone:
              invitedCleanerPhone ||
              null,
          },
        ]
      );

      setInvitedCleanerEmail(
        ""
      );

      setInvitedCleanerPhone(
        ""
      );
    };

  /*
   * ==============================================================
   * VALIDATION
   * ==============================================================
   */

  const validate = () => {
    let isValid = true;

    const newErrors = {
      apt_name: null,
      address: null,
      apt_type: null,
      contact_phone: null,
      instructions: null,
      room_count: {},
      room_size: {},
    };

    /*
     * Property name
     */

    if (
      !inputs.apt_name.trim()
    ) {
      newErrors.apt_name =
        tSafe(
          "property_name_required",
          "Property name is required"
        );

      isValid = false;
    }

    /*
     * Address
     */

    if (!address.trim()) {
      newErrors.address =
        tSafe(
          "address_required",
          "Address is required"
        );

      isValid = false;
    } else if (!coordinates) {
      newErrors.address =
        showGoogleAutocomplete
          ? tSafe(
              "verify_address_suggestions",
              "Please verify address by selecting from suggestions"
            )
          : tSafe(
              "verify_address",
              "Please verify your address"
            );

      isValid = false;
    }

    /*
     * Property type
     */

    if (!aptType.trim()) {
      newErrors.apt_type =
        tSafe(
          "property_type_required",
          "Property Type is required"
        );

      isValid = false;
    }

    /*
     * Rooms
     */

    roomDetails.forEach(
      (room) => {
        if (room.number <= 0) {
          newErrors.room_count[
            room.type
          ] = tSafe(
            "room_count_error",
            "{type} count must be greater than 0",
            {
              type: room.type,
            }
          );

          isValid = false;
        }

        if (
          room.size < 50 ||
          room.size > 600
        ) {
          newErrors.room_size[
            room.type
          ] = tSafe(
            "room_size_error",
            "{type} size must be between 50 and 600 sq ft",
            {
              type: room.type,
            }
          );

          isValid = false;
        }
      }
    );

    /*
     * Phone
     */

    const cleanedPhone =
      phoneNumber.replace(
        /\D/g,
        ""
      );

    if (
      !/^[0-9]{10}$/.test(
        cleanedPhone
      )
    ) {
      newErrors.contact_phone =
        tSafe(
          "valid_phone_required",
          "Enter a valid 10-digit phone number"
        );

      isValid = false;
    }

    /*
     * Instructions
     */

    if (
      inputs.instructions &&
      inputs.instructions.length <
        5
    ) {
      newErrors.instructions =
        tSafe(
          "instructions_min_length",
          "Instructions must be at least 5 characters long"
        );

      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  /*
   * ==============================================================
   * SUBMIT
   * ==============================================================
   */

  const onSubmit =
    async () => {
      if (loading) {
        return;
      }

      Keyboard.dismiss();

      setLoading(true);

      const valid =
        validate();

      if (!valid) {
        setLoading(false);

        setTimeout(() => {
          scrollViewRef.current?.scrollTo(
            {
              y: 0,
              animated: true,
            }
          );
        }, 100);

        return;
      }

      if (
        !coordinates?.latitude ||
        !coordinates?.longitude
      ) {
        setLoading(false);

        Alert.alert(
          tSafe(
            "error_title",
            "Error"
          ),
          tSafe(
            "verify_address",
            "Please verify your address"
          )
        );

        return;
      }

      try {
        const owner_info = {
          firstname,
          lastname,
          email,
          userId:
            currentUserId,
          avatar,
        };

        const propertyData = {
          userId:
            currentUserId,

          owner_info,

          apt_name:
            inputs.apt_name.trim(),

          instructions:
            inputs.instructions,

          cleaning_supplies:
            checked,

          contact_phone:
            phoneNumber.replace(
              /\D/g,
              ""
            ),

          address,

          latitude:
            coordinates.latitude.toFixed(
              4
            ),

          longitude:
            coordinates.longitude.toFixed(
              4
            ),

          created_on:
            moment().format(
              "YYYY-MM-DD HH:mm:ss"
            ),

          apt_type: aptType,

          preferredCleaners:
            preferredCleaners.map(
              (cleaner) => ({
                id: cleaner.id,
                type: cleaner.type,
              })
            ),

          invitedCleaners,

          roomDetails,
        };

        console.log(
          "Property data:",
          propertyData
        );

        const propertyResponse =
          await userService.addApartment(
            propertyData
          );

        if (
          propertyResponse?.status ===
          200
        ) {
          const {
            propertyId,
            checklistId,
          } =
            propertyResponse.data ||
            {};

          navigation.replace(
            ROUTES.host_apt_dashboard,
            {
              propertyId,
            }
          );

          return;
        }

        Alert.alert(
          tSafe(
            "error_title",
            "Error"
          ),
          tSafe(
            "property_creation_failed",
            "Property creation failed"
          )
        );
      } catch (error) {
        console.log(
          "Error creating property:",
          error
        );

        Alert.alert(
          tSafe(
            "error_title",
            "Error"
          ),
          tSafe(
            "something_went_wrong",
            "Something went wrong, please try again"
          )
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * ==============================================================
   * ERROR COMPONENT
   * ==============================================================
   */

  const FieldError =
    ({ message }) => {
      if (!message) {
        return null;
      }

      return (
        <View
          style={
            styles.fieldError
          }
        >
          <Icon
            source="alert-circle-outline"
            size={14}
            color={
              theme.status.error
            }
          />

          <AppText
            variant="caption"
            style={
              styles.fieldErrorText
            }
          >
            {message}
          </AppText>
        </View>
      );
    };

  /*
   * ==============================================================
   * SECTION HEADER
   * ==============================================================
   */

  const SectionHeader = ({
    number,
    title,
    description,
    complete = false,
  }) => (
    <View
      style={
        styles.sectionHeader
      }
    >
      <View
        style={[
          styles.sectionNumber,
          complete &&
            styles.sectionNumberComplete,
        ]}
      >
        {complete ? (
          <Icon
            source="check"
            size={17}
            color={
              theme.text.inverse
            }
          />
        ) : (
          <AppText
            style={
              styles.sectionNumberText
            }
          >
            {number}
          </AppText>
        )}
      </View>

      <View
        style={
          styles.sectionHeaderText
        }
      >
        <AppText
          variant="h6"
          style={
            styles.sectionTitle
          }
        >
          {title}
        </AppText>

        {!!description && (
          <AppText
            variant="caption"
            color="secondary"
            style={
              styles.sectionDescription
            }
          >
            {description}
          </AppText>
        )}
      </View>
    </View>
  );

  /*
   * ==============================================================
   * ADDRESS INPUTS
   * ==============================================================
   */

  const renderAddressInputs =
    () => (
      <View>
        {showGoogleAutocomplete ? (
          <GoogleAutocomplete
            label={tSafe(
              "property_address_label",
              "Property Address"
            )}
            apiKey={
              GOOGLE_MAPS_API_KEY
            }
            selected_address={
              handleAutocompleteSelect
            }
            handleError={
              handleAutocompleteError
            }
          />
        ) : (
          <AddressInput
            label={tSafe(
              "property_address_label",
              "Property Address"
            )}
            value={address}
            onChange={
              handleManualAddressChange
            }
            onCoordinatesSet={
              handleManualVerification
            }
            error={
              errors.address
            }
          />
        )}

        {hasPermission ===
          false && (
          <View
            style={
              styles.permissionWarning
            }
          >
            <View
              style={
                styles.permissionIcon
              }
            >
              <Icon
                source="map-marker-alert-outline"
                size={18}
                color={
                  theme.status.warning
                }
              />
            </View>

            <AppText
              variant="caption"
              style={
                styles.permissionText
              }
            >
              {tSafe(
                "location_permission_required",
                "Location permission required for address verification"
              )}
            </AppText>
          </View>
        )}

        {autocompleteError &&
          !showGoogleAutocomplete &&
          !coordinates && (
            <View
              style={
                styles.addressError
              }
            >
              <Icon
                source="alert-circle-outline"
                size={15}
                color={
                  theme.status.error
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.addressErrorText
                }
              >
                {
                  autocompleteError
                }
              </AppText>
            </View>
          )}

        {errors.address &&
          !coordinates && (
            <View
              style={
                styles.addressError
              }
            >
              <Icon
                source="alert-circle-outline"
                size={15}
                color={
                  theme.status.error
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.addressErrorText
                }
              >
                {errors.address}
              </AppText>
            </View>
          )}

        {hasVerifiedAddress && (
          <View
            style={
              styles.verifiedAddress
            }
          >
            <View
              style={
                styles.verifiedIcon
              }
            >
              <Icon
                source="check"
                size={15}
                color={
                  theme.status.success
                }
              />
            </View>

            <View
              style={
                styles.verifiedContent
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.verifiedTitle
                }
              >
                {tSafe(
                  "address_verified",
                  "Address verified"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={{
                  color: theme.text.secondary,
                }}
                numberOfLines={2}
              >
                {address}
              </AppText>
            </View>
          </View>
        )}
      </View>
    );

  /*
   * ==============================================================
   * ROOM CARD
   * ==============================================================
   */

  const renderRoomCard =
    (room) => {
      const countError =
        errors?.room_count?.[
          room.type
        ];

      const sizeError =
        errors?.room_size?.[
          room.type
        ];

      const hasError =
        !!countError ||
        !!sizeError;

      return (
        <View
          key={room.type}
          style={[
            styles.roomCard,
            hasError &&
              styles.roomCardError,
          ]}
        >
          <View
            style={
              styles.roomInformation
            }
          >
            <View
              style={
                styles.roomIcon
              }
            >
              <Icon
                source={getRoomIcon(
                  room.type
                )}
                size={21}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <View
              style={
                styles.roomInformationText
              }
            >
              <AppText
                style={
                  styles.roomType
                }
              >
                {room.type}
              </AppText>

              <AppText
                variant="caption"
                style={{
                  color: theme.text.secondary,
                }}
              >
                {tSafe(
                  "size_label",
                  "Size:"
                )}{" "}
                {room.size}{" "}
                {tSafe(
                  "sq_ft",
                  "sq ft"
                )}{" "}
                ·{" "}
                {room.size_range}
              </AppText>
            </View>
          </View>

          <View
            style={
              styles.counter
            }
          >
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                handleRoomCountChange(
                  room.type,
                  "minus"
                )
              }
              style={[
                styles.counterButton,
                room.number ===
                  0 &&
                  styles.counterButtonDisabled,
              ]}
            >
              <AppText
                style={
                  styles.counterSymbol
                }
                color={
                  room.number ===
                  0
                    ? "disabled"
                    : "primary"
                }
              >
                −
              </AppText>
            </TouchableOpacity>

            <AppText
              style={
                styles.roomCount
              }
            >
              {room.number}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                handleRoomCountChange(
                  room.type,
                  "add"
                )
              }
              style={
                styles.counterButton
              }
            >
              <AppText
                style={
                  styles.counterSymbol
                }
                color="primary"
              >
                +
              </AppText>
            </TouchableOpacity>
          </View>

          {hasError && (
            <View
              style={
                styles.roomError
              }
            >
              <Icon
                source="alert-circle-outline"
                size={13}
                color={
                  theme.status.error
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.roomErrorText
                }
              >
                {countError ||
                  sizeError}
              </AppText>
            </View>
          )}
        </View>
      );
    };

  /*
   * ==============================================================
   * RENDER
   * ==============================================================
   */

  return (
    <Provider
      theme={paperTheme}
    >
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={["top"]}
      >
        <StatusBar
          backgroundColor={
            theme.background.default
          }
          barStyle={
            theme.background.default ===
              "#000000" ||
            theme.background.default ===
              "#121212" ||
            theme.background.default ===
              "#101010"
              ? "light-content"
              : "dark-content"
          }
        />

        <KeyboardAvoidingView
          style={
            styles.container
          }
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          keyboardVerticalOffset={
            Platform.OS === "ios"
              ? 64
              : 0
          }
        >
          <ScrollView
            ref={
              scrollViewRef
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom:
                  Math.max(
                    32,
                    keyboardHeight +
                      24
                  ),
              },
            ]}
          >
            {/* ==================================================
                HEADER
            =================================================== */}

            <View
              style={
                styles.pageHeader
              }
            >
              <View
                style={
                  styles.headerText
                }
              >
                <AppText
                  variant="h4"
                  style={
                    styles.pageTitle
                  }
                >
                  {tSafe(
                    "add_apartment",
                    "Add Apartment"
                  )}
                </AppText>

                <AppText
                  variant="body2"
                  color="secondary"
                  style={
                    styles.pageSubtitle
                  }
                >
                  {tSafe(
                    "add_property_description",
                    "Tell us about your property so we can create the right cleaning experience."
                  )}
                </AppText>
              </View>

              <View
                style={
                  styles.headerIcon
                }
              >
                <Icon
                  source="home-plus-outline"
                  size={23}
                  color={
                    theme.brand.primary
                  }
                />
              </View>
            </View>

            {/* ==================================================
                PROGRESS
            =================================================== */}

            <View
              style={
                styles.progressCard
              }
            >
              <View
                style={
                  styles.progressTop
                }
              >
                <View>
                  <AppText
                    variant="caption"
                    style={{
                      color: theme.text.secondary,
                    }}
                  >
                    {tSafe(
                      "property_setup",
                      "Property setup"
                    )}
                  </AppText>

                  <AppText
                    style={
                      styles.progressTitle
                    }
                  >
                    {hasVerifiedAddress &&
                    aptType &&
                    roomConfigurationComplete
                      ? tSafe(
                          "almost_ready",
                          "Almost ready"
                        )
                      : tSafe(
                          "property_details",
                          "Property details"
                        )}
                  </AppText>
                </View>

                <AppText
                  variant="caption"
                  style={
                    styles.progressPercent
                  }
                >
                  {hasVerifiedAddress
                    ? aptType &&
                      roomConfigurationComplete
                      ? "100%"
                      : "66%"
                    : "33%"}
                </AppText>
              </View>

              <View
                style={
                  styles.progressTrack
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        hasVerifiedAddress
                          ? aptType &&
                            roomConfigurationComplete
                            ? "100%"
                            : "66%"
                          : "33%",
                    },
                  ]}
                />
              </View>
            </View>

            {/* ==================================================
                PROPERTY INFORMATION
            =================================================== */}

            <AppCard
              variant="default"
              style={
                styles.sectionCard
              }
            >
              <SectionHeader
                number="1"
                title={tSafe(
                  "property_information",
                  "Property information"
                )}
                description={tSafe(
                  "property_information_description",
                  "Give your property a name and verify its location."
                )}
                complete={
                  !!inputs.apt_name &&
                  hasVerifiedAddress
                }
              />

              <View
                style={
                  styles.formSpacing
                }
              >
                <TextInput
                  mode="outlined"
                  label={tSafe(
                    "property_title_label",
                    "Property Title"
                  )}
                  placeholder={tSafe(
                    "property_title_placeholder",
                    "Property Title"
                  )}
                  value={
                    inputs.apt_name
                  }
                  onChangeText={(
                    text
                  ) =>
                    handleChange(
                      text,
                      "apt_name"
                    )
                  }
                  error={
                    !!errors.apt_name
                  }
                  theme={
                    paperTheme
                  }
                  style={
                    styles.textInput
                  }
                  textColor={
                    theme.input.text
                  }
                  placeholderTextColor={
                    theme.input
                      .placeholder
                  }
                />

                <FieldError
                  message={
                    errors.apt_name
                  }
                />

                <View
                  style={
                    styles.addressHeader
                  }
                >
                  <View
                    style={
                      styles.addressHeaderText
                    }
                  >
                    <AppText
                      style={
                        styles.fieldTitle
                      }
                    >
                      {tSafe(
                        "property_address_label",
                        "Property Address"
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={{
                        color: theme.text.secondary,
                      }}
                    >
                      {tSafe(
                        "address_verification_description",
                        "A verified location helps us find cleaners near your property."
                      )}
                    </AppText>
                  </View>

                  {hasVerifiedAddress && (
                    <View
                      style={
                        styles.verifiedPill
                      }
                    >
                      <Icon
                        source="check-circle"
                        size={14}
                        color={
                          theme.status
                            .success
                        }
                      />

                      <AppText
                        variant="caption"
                        style={
                          styles.verifiedPillText
                        }
                      >
                        {tSafe(
                          "verified",
                          "Verified"
                        )}
                      </AppText>
                    </View>
                  )}
                </View>

                {renderAddressInputs()}
              </View>
            </AppCard>

            {/* ==================================================
                EVERYTHING BELOW ADDRESS
            =================================================== */}

            {hasVerifiedAddress && (
              <>
                {/* ==================================================
                    PROPERTY TYPE
                =================================================== */}

                <AppCard
                  variant="default"
                  style={
                    styles.sectionCard
                  }
                >
                  <SectionHeader
                    number="2"
                    title={tSafe(
                      "property_type",
                      "Property type"
                    )}
                    description={tSafe(
                      "property_type_description",
                      "Choose the type that best describes this property."
                    )}
                    complete={
                      !!aptType
                    }
                  />

                  <View
                    style={
                      styles.formSpacing
                    }
                  >
                    <FloatingLabelPickerSelect
                      label={tSafe(
                        "select_property_type",
                        "Select Property Type"
                      )}
                      items={
                        propertyList
                      }
                      value={
                        aptType
                      }
                      onValueChange={(
                        value
                      ) => {
                        setAptType(
                          value
                        );

                        if (
                          errors.apt_type
                        ) {
                          setErrors(
                            (
                              previous
                            ) => ({
                              ...previous,
                              apt_type:
                                null,
                            })
                          );
                        }
                      }}
                    />

                    <FieldError
                      message={
                        errors.apt_type
                      }
                    />
                  </View>
                </AppCard>

                {/* ==================================================
                    ROOMS
                =================================================== */}

                <AppCard
                  variant="default"
                  style={
                    styles.sectionCard
                  }
                >
                  <SectionHeader
                    number="3"
                    title={tSafe(
                      "rooms",
                      "Rooms"
                    )}
                    description={tSafe(
                      "rooms_description",
                      "Set the number of rooms and adjust their approximate sizes."
                    )}
                    complete={
                      roomConfigurationComplete
                    }
                  />

                  <View
                    style={
                      styles.roomSummary
                    }
                  >
                    <View
                      style={
                        styles.summaryItem
                      }
                    >
                      <AppText
                        style={
                          styles.summaryValue
                        }
                      >
                        {
                          totalRooms
                        }
                      </AppText>

                      <AppText
                        variant="caption"
                        style={{
                          color: theme.text.secondary,
                        }}
                      >
                        {tSafe(
                          "total_rooms",
                          "Total rooms"
                        )}
                      </AppText>
                    </View>

                    <View
                      style={
                        styles.summaryDivider
                      }
                    />

                    <View
                      style={
                        styles.summaryItem
                      }
                    >
                      <AppText
                        style={
                          styles.summaryValue
                        }
                      >
                        {
                          totalBedrooms
                        }
                      </AppText>

                      <AppText
                        variant="caption"
                        style={{
                          color: theme.text.secondary,
                        }}
                      >
                        {tSafe(
                          "bedrooms",
                          "Bedrooms"
                        )}
                      </AppText>
                    </View>

                    <View
                      style={
                        styles.summaryDivider
                      }
                    />

                    <View
                      style={
                        styles.summaryItem
                      }
                    >
                      <AppText
                        style={
                          styles.summaryValue
                        }
                      >
                        {
                          totalBathrooms
                        }
                      </AppText>

                      <AppText
                        variant="caption"
                        style={{
                          color: theme.text.secondary,
                        }}
                      >
                        {tSafe(
                          "bathrooms",
                          "Bathrooms"
                        )}
                      </AppText>
                    </View>
                  </View>

                  <View
                    style={
                      styles.roomsList
                    }
                  >
                    {roomDetails.map(
                      renderRoomCard
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={
                      handleConfirmRoomSelection
                    }
                    style={
                      styles.adjustSizeButton
                    }
                  >
                    <View
                      style={
                        styles.adjustSizeIcon
                      }
                    >
                      <Icon
                        source="tune-variant"
                        size={18}
                        color={
                          theme.brand
                            .primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.adjustSizeText
                      }
                    >
                      <AppText
                        style={
                          styles.adjustSizeTitle
                        }
                      >
                        {tSafe(
                          "adjust_room_sizes",
                          "Adjust room sizes"
                        )}
                      </AppText>

                      <AppText
                        variant="caption"
                        style={{
                          color: theme.text.secondary,
                        }}
                      >
                        {tSafe(
                          "adjust_room_sizes_description",
                          "Set approximate square footage for each room."
                        )}
                      </AppText>
                    </View>

                    <Icon
                      source="chevron-right"
                      size={22}
                      color={
                        theme.icon.muted
                      }
                    />
                  </TouchableOpacity>
                </AppCard>

                {/* ==================================================
                    SUPPLIES
                =================================================== */}

                <AppCard
                  variant="default"
                  style={
                    styles.sectionCard
                  }
                >
                  <SectionHeader
                    number="4"
                    title={tSafe(
                      "cleaning_supplies",
                      "Cleaning supplies"
                    )}
                    description={tSafe(
                      "cleaning_supplies_description",
                      "Let the cleaner know whether supplies are available at the property."
                    )}
                    complete={
                      !!checked
                    }
                  />

                  <View
                    style={
                      styles.supplyOptions
                    }
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setChecked(
                          "yes"
                        )
                      }
                      style={[
                        styles.supplyOption,
                        checked ===
                          "yes" &&
                          styles.supplyOptionSelected,
                      ]}
                    >
                      <RadioButton.Android
                        value="yes"
                        status={
                          checked ===
                          "yes"
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() =>
                          setChecked(
                            "yes"
                          )
                        }
                        color={
                          theme.brand
                            .primary
                        }
                        uncheckedColor={
                          theme.icon
                            .muted
                        }
                      />

                      <View
                        style={
                          styles.optionText
                        }
                      >
                        <AppText
                          style={
                            styles.optionTitle
                          }
                        >
                          {tSafe(
                            "yes",
                            "Yes"
                          )}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={{
                            color: theme.text.secondary,
                          }}
                        >
                          {tSafe(
                            "supplies_available",
                            "Supplies are available"
                          )}
                        </AppText>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setChecked(
                          "no"
                        )
                      }
                      style={[
                        styles.supplyOption,
                        checked ===
                          "no" &&
                          styles.supplyOptionSelected,
                      ]}
                    >
                      <RadioButton.Android
                        value="no"
                        status={
                          checked ===
                          "no"
                            ? "checked"
                            : "unchecked"
                        }
                        onPress={() =>
                          setChecked(
                            "no"
                          )
                        }
                        color={
                          theme.brand
                            .primary
                        }
                        uncheckedColor={
                          theme.icon
                            .muted
                        }
                      />

                      <View
                        style={
                          styles.optionText
                        }
                      >
                        <AppText
                          style={
                            styles.optionTitle
                          }
                        >
                          {tSafe(
                            "no",
                            "No"
                          )}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={{
                            color: theme.text.secondary,
                          }}
                        >
                          {tSafe(
                            "cleaner_should_bring_supplies",
                            "Cleaner should bring supplies"
                          )}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  </View>
                </AppCard>

                {/* ==================================================
                    DETAILS
                =================================================== */}

                <AppCard
                  variant="default"
                  style={
                    styles.sectionCard
                  }
                >
                  <SectionHeader
                    number="5"
                    title={tSafe(
                      "property_details",
                      "Property details"
                    )}
                    description={tSafe(
                      "property_details_description",
                      "Add instructions and a contact number for the property."
                    )}
                  />

                  <View
                    style={
                      styles.formSpacing
                    }
                  >
                    <TextInput
                      ref={
                        instructionInputRef
                      }
                      mode="outlined"
                      label={tSafe(
                        "specific_instruction_label",
                        "Specific Instruction"
                      )}
                      placeholder={tSafe(
                        "specific_instruction_placeholder",
                        "Specific Instruction"
                      )}
                      value={
                        inputs.instructions
                      }
                      onChangeText={(
                        text
                      ) =>
                        handleChange(
                          text,
                          "instructions"
                        )
                      }
                      error={
                        !!errors.instructions
                      }
                      multiline
                      numberOfLines={5}
                      theme={
                        paperTheme
                      }
                      textColor={
                        theme.input.text
                      }
                      placeholderTextColor={
                        theme.input
                          .placeholder
                      }
                      style={
                        styles.multilineInput
                      }
                      onFocus={() => {
                        setErrors(
                          (
                            previous
                          ) => ({
                            ...previous,
                            instructions:
                              null,
                          })
                        );

                        setTimeout(
                          () => {
                            if (
                              instructionInputRef.current
                            ) {
                              instructionInputRef.current.measure(
                                (
                                  x,
                                  y,
                                  width,
                                  height,
                                  pageX,
                                  pageY
                                ) => {
                                  const scrollToY =
                                    Math.max(
                                      0,
                                      pageY -
                                        keyboardHeight +
                                        height +
                                        30
                                    );

                                  scrollViewRef.current?.scrollTo(
                                    {
                                      y: scrollToY,
                                      animated:
                                        true,
                                    }
                                  );
                                }
                              );
                            }
                          },
                          300
                        );
                      }}
                    />

                    <FieldError
                      message={
                        errors.instructions
                      }
                    />

                    <TextInput
                      label={tSafe(
                        "contact_phone_label",
                        "Contact Phone Number"
                      )}
                      placeholder={tSafe(
                        "contact_phone_placeholder",
                        "Contact Phone Number"
                      )}
                      mode="outlined"
                      value={
                        phoneNumber
                      }
                      onChangeText={
                        handleInputChange
                      }
                      keyboardType="phone-pad"
                      error={
                        !!errors.contact_phone
                      }
                      theme={
                        paperTheme
                      }
                      textColor={
                        theme.input.text
                      }
                      placeholderTextColor={
                        theme.input
                          .placeholder
                      }
                      style={
                        styles.textInput
                      }
                    />

                    <FieldError
                      message={
                        errors.contact_phone
                      }
                    />
                  </View>
                </AppCard>

                {/* ==================================================
                    CLEANERS
                =================================================== */}

                <AppCard
                  variant="default"
                  style={
                    styles.sectionCard
                  }
                >
                  <SectionHeader
                    number="6"
                    title={tSafe(
                      "preferred_cleaners",
                      "Preferred cleaners"
                    )}
                    description={tSafe(
                      "preferred_cleaners_description",
                      "Optionally select cleaners you would like to work with."
                    )}
                  />

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      setCleanerModalVisible(
                        true
                      )
                    }
                    style={
                      styles.cleanerButton
                    }
                  >
                    <View
                      style={
                        styles.cleanerIcon
                      }
                    >
                      <Icon
                        source="account-group-outline"
                        size={22}
                        color={
                          theme.brand
                            .primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.cleanerText
                      }
                    >
                      <AppText
                        style={
                          styles.cleanerTitle
                        }
                      >
                        {tSafe(
                          "manage_cleaners",
                          "Manage Cleaners"
                        )}
                      </AppText>

                      <AppText
                        variant="caption"
                        style={{
                          color: theme.text.secondary,
                        }}
                      >
                        {preferredCleaners.length
                          ? `${preferredCleaners.length} ${tSafe(
                              "selected",
                              "selected"
                            )}`
                          : tSafe(
                              "no_cleaners_selected",
                              "No preferred cleaners selected"
                            )}
                      </AppText>
                    </View>

                    <Icon
                      source="chevron-right"
                      size={22}
                      color={
                        theme.icon.muted
                      }
                    />
                  </TouchableOpacity>
                </AppCard>

                {/* ==================================================
                    FINAL SUMMARY
                =================================================== */}

                <View
                  style={
                    styles.finalSummary
                  }
                >
                  <View
                    style={
                      styles.finalSummaryIcon
                    }
                  >
                    <Icon
                      source="check-circle-outline"
                      size={22}
                      color={
                        theme.status.success
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.finalSummaryText
                    }
                  >
                    <AppText
                      style={
                        styles.finalSummaryTitle
                      }
                    >
                      {tSafe(
                        "ready_to_create",
                        "Ready to create your property?"
                      )}
                    </AppText>

                    <AppText
                      variant="caption"
                      style={{
                        color: theme.text.secondary,
                      }}
                    >
                      {tSafe(
                        "ready_to_create_description",
                        "Review your information and create the property."
                      )}
                    </AppText>
                  </View>
                </View>

                <AppButton
                  title={tSafe(
                    "add_apartment",
                    "Add Apartment"
                  )}
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                  onPress={onSubmit}
                  style={
                    styles.submitButton
                  }
                />

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.submitHint
                  }
                >
                  {tSafe(
                    "property_creation_hint",
                    "You can update your property details later."
                  )}
                </AppText>
              </>
            )}
          </ScrollView>

          {/* ========================================================
              ROOM SIZE MODAL
          ========================================================= */}

          <Portal>
            <Modal
              visible={
                modalVisible
              }
              onDismiss={
                handleCloseModal
              }
              contentContainerStyle={
                styles.modalContent
              }
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <View
                  style={
                    styles.modalHeaderText
                  }
                >
                  <AppText
                    variant="h6"
                    style={
                      styles.modalTitle
                    }
                  >
                    {tSafe(
                      "adjust_room_sizes",
                      "Adjust Room Sizes"
                    )}
                  </AppText>

                  <AppText
                    variant="caption"
                    style={{
                      color: theme.text.secondary,
                    }}
                  >
                    {tSafe(
                      "room_size_modal_description",
                      "Use the sliders to set the approximate size of each room."
                    )}
                  </AppText>
                </View>

                <TouchableOpacity
                  onPress={
                    handleCloseModal
                  }
                  style={
                    styles.modalClose
                  }
                >
                  <Icon
                    source="close"
                    size={20}
                    color={
                      theme.icon.default
                    }
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.modalScroll
                }
              >
                {roomDetails.map(
                  (room) =>
                    room.number >
                      0 && (
                      <View
                        key={
                          room.type
                        }
                        style={
                          styles.sliderCard
                        }
                      >
                        <View
                          style={
                            styles.sliderHeader
                          }
                        >
                          <View
                            style={
                              styles.sliderIdentity
                            }
                          >
                            <View
                              style={
                                styles.sliderIcon
                              }
                            >
                              <Icon
                                source={getRoomIcon(
                                  room.type
                                )}
                                size={18}
                                color={
                                  theme
                                    .brand
                                    .primary
                                }
                              />
                            </View>

                            <View>
                              <AppText
                                style={
                                  styles.sliderRoomName
                                }
                              >
                                {
                                  room.type
                                }
                              </AppText>

                              <AppText
                                variant="caption"
                                cstyle={{
                                  color: theme.text.secondary,
                                }}
                              >
                                {
                                  room.number
                                }{" "}
                                {room.number ===
                                1
                                  ? tSafe(
                                      "room",
                                      "room"
                                    )
                                  : tSafe(
                                      "rooms",
                                      "rooms"
                                    )}
                              </AppText>
                            </View>
                          </View>

                          <View
                            style={
                              styles.sizeBadge
                            }
                          >
                            <AppText
                              variant="caption"
                              style={
                                styles.sizeBadgeText
                              }
                            >
                              {
                                room.size
                              }{" "}
                              {tSafe(
                                "sq_ft",
                                "sq ft"
                              )}
                            </AppText>
                          </View>
                        </View>

                        <Slider
                          style={
                            styles.slider
                          }
                          minimumValue={
                            50
                          }
                          maximumValue={
                            600
                          }
                          step={10}
                          value={
                            room.size
                          }
                          onValueChange={(
                            value
                          ) =>
                            handleRoomSizeChange(
                              room.type,
                              value
                            )
                          }
                          minimumTrackTintColor={
                            theme.brand
                              .primary
                          }
                          maximumTrackTintColor={
                            theme.border
                              .default
                          }
                          thumbTintColor={
                            theme.brand
                              .primary
                          }
                        />

                        <View
                          style={
                            styles.sliderRange
                          }
                        >
                          <AppText
                            variant="caption"
                            style={{
                              color: theme.text.secondary,
                            }}
                          >
                            50 sq ft
                          </AppText>

                          <AppText
                            variant="caption"
                            style={
                              styles.sliderCategory
                            }
                          >
                            {
                              room.size_range
                            }
                          </AppText>

                          <AppText
                            variant="caption"
                            style={{
                              color: theme.text.secondary,
                            }}
                          >
                            600 sq ft
                          </AppText>
                        </View>
                      </View>
                    )
                )}
              </ScrollView>

              <AppButton
                title={tSafe(
                  "done",
                  "Done"
                )}
                variant="primary"
                onPress={
                  handleCloseModal
                }
                style={
                  styles.modalDone
                }
              />
            </Modal>
          </Portal>

          {/* ========================================================
              CLEANER MANAGEMENT
          ========================================================= */}

          <CleanerManagementModal
            visible={
              cleanerModalVisible
            }
            onClose={() =>
              setCleanerModalVisible(
                false
              )
            }
            platformCleaners={
              platformCleaners
            }
            preferredCleaners={
              preferredCleaners
            }
            setPreferredCleaners={
              setPreferredCleaners
            }
            invitedCleaners={
              invitedCleaners
            }
            setInvitedCleaners={
              setInvitedCleaners
            }
          />

          {/* ========================================================
              LOADING
          ========================================================= */}

          {loading && (
            <View
              style={
                styles.loadingOverlay
              }
              pointerEvents="auto"
            >
              <View
                style={
                  styles.loadingCard
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    theme.brand.primary
                  }
                />

                <AppText
                  style={
                    styles.loadingTitle
                  }
                >
                  {tSafe(
                    "creating_property",
                    "Creating property..."
                  )}
                </AppText>

                <AppText
                  variant="caption"
                  color="secondary"
                  style={
                    styles.loadingDescription
                  }
                >
                  {tSafe(
                    "creating_property_description",
                    "Please wait while we save your property details."
                  )}
                </AppText>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Provider>
  );
}


/*
 * ================================================================
 * STYLES
 * ================================================================
 */

const createStyles = (
  theme
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 12,
    },

    /*
     * HEADER
     */

    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingTop: 10,
      paddingBottom: 20,
    },

    headerText: {
      flex: 1,
      paddingRight: 15,
    },

    pageTitle: {
      color: theme.text.primary,
      fontWeight: "700",
      letterSpacing: -0.5,
    },

    pageSubtitle: {
      marginTop: 6,
      maxWidth: 330,
      lineHeight: 19,
      color: theme.text.secondary,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "18",
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    /*
     * PROGRESS
     */

    progressCard: {
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      ...getShadow(theme),
    },

    progressTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },

    progressTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text.primary,
      marginTop: 2,
    },

    progressPercent: {
      color: theme.brand.primary,
      fontWeight: "700",
    },

    progressTrack: {
      height: 7,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor:
        theme.hero.progressTrack ||
        theme.border.default,
    },

    progressFill: {
      height: "100%",
      borderRadius: 10,
      backgroundColor:
        theme.hero.progressFill ||
        theme.brand.primary,
    },

    /*
     * SECTIONS
     */

    sectionCard: {
      marginBottom: 16,
      padding: 18,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    sectionNumber: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "18",
          theme.surface.selected
        ),
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    sectionNumberComplete: {
      backgroundColor:
        theme.status.success,
    },

    sectionNumberText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.brand.primary,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontWeight: "700",
      color: theme.text.primary,
    },

    sectionDescription: {
      marginTop: 2,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    formSpacing: {
      marginTop: 20,
    },

    textInput: {
      fontSize: 14,
      backgroundColor:
        theme.input.background,
      color: theme.input.text,
    },

    multilineInput: {
      minHeight: 120,
      fontSize: 14,
      backgroundColor:
        theme.input.background,
      color: theme.input.text,
      textAlignVertical:
        "top",
    },

    /*
     * ERRORS
     */

    fieldError: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },

    fieldErrorText: {
      flex: 1,
      color: theme.status.error,
      marginLeft: 5,
      lineHeight: 17,
    },

    /*
     * ADDRESS
     */

    addressHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      marginTop: 20,
      marginBottom: 8,
    },

    addressHeaderText: {
      flex: 1,
      paddingRight: 12,
    },

    fieldTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text.primary,
      marginBottom: 3,
    },

    verifiedPill: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      paddingHorizontal: 9,
      paddingVertical: 5,
      backgroundColor:
        withAlpha(
          theme.status.success,
          "18",
          theme.surface.selected
        ),
    },

    verifiedPillText: {
      color: theme.status.success,
      fontWeight: "700",
      marginLeft: 4,
    },

    verifiedAddress: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        withAlpha(
          theme.status.success,
          "10",
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.success,
          "35",
          theme.border.default
        ),
    },

    verifiedIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.status.success,
          "20",
          theme.surface.selected
        ),
      marginRight: 10,
    },

    verifiedContent: {
      flex: 1,
    },

    verifiedTitle: {
      color: theme.status.success,
      fontWeight: "700",
      marginBottom: 2,
    },

    addressError: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 7,
    },

    addressErrorText: {
      flex: 1,
      color: theme.status.error,
      marginLeft: 5,
      lineHeight: 17,
    },

    permissionWarning: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      padding: 11,
      borderRadius: 12,
      backgroundColor:
        withAlpha(
          theme.status.warning,
          "12",
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.warning,
          "35",
          theme.border.default
        ),
    },

    permissionIcon: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.status.warning,
          "18",
          theme.surface.selected
        ),
    },

    permissionText: {
      flex: 1,
      marginLeft: 8,
      color: theme.text.secondary,
      lineHeight: 17,
    },

    /*
     * ROOMS
     */

    roomSummary: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 18,
      marginBottom: 16,
      padding: 14,
      borderRadius: 16,
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    summaryItem: {
      flex: 1,
      alignItems: "center",
    },

    summaryValue: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text.primary,
    },

    summaryDivider: {
      width: 1,
      height: 30,
      backgroundColor:
        theme.divider,
    },

    roomsList: {
      gap: 10,
    },

    roomCard: {
      minHeight: 76,
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      backgroundColor:
        theme.card.background,
      flexDirection: "row",
      alignItems: "center",
    },

    roomCardError: {
      borderColor:
        theme.status.error,
    },

    roomInformation: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    roomIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "18",
          theme.surface.selected
        ),
      marginRight: 10,
    },

    roomInformationText: {
      flex: 1,
    },

    roomType: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 3,
    },

    counter: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
    },

    counterButton: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    counterButtonDisabled: {
      opacity: 0.45,
    },

    counterSymbol: {
      fontSize: 21,
      lineHeight: 22,
      fontWeight: "600",
    },

    roomCount: {
      minWidth: 32,
      textAlign: "center",
      fontSize: 15,
      fontWeight: "800",
      color: theme.text.primary,
    },

    roomError: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: -17,
      flexDirection: "row",
      alignItems: "center",
    },

    roomErrorText: {
      flex: 1,
      color: theme.status.error,
      marginLeft: 4,
      fontSize: 10,
    },

    adjustSizeButton: {
      marginTop: 18,
      padding: 13,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      backgroundColor:
        theme.surface.selected,
      flexDirection: "row",
      alignItems: "center",
    },

    adjustSizeIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "18",
          theme.surface.default
        ),
      marginRight: 11,
    },

    adjustSizeText: {
      flex: 1,
    },

    adjustSizeTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 2,
    },

    /*
     * SUPPLIES
     */

    supplyOptions: {
      marginTop: 18,
      gap: 10,
    },

    supplyOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 9,
      paddingHorizontal: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      backgroundColor:
        theme.card.background,
    },

    supplyOptionSelected: {
      borderColor:
        theme.brand.primary,
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "12",
          theme.surface.selected
        ),
    },

    optionText: {
      flex: 1,
      marginLeft: 3,
    },

    optionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 2,
    },

    /*
     * CLEANERS
     */

    cleanerButton: {
      marginTop: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      backgroundColor:
        theme.surface.selected,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
    },

    cleanerIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "18",
          theme.surface.default
        ),
      marginRight: 11,
    },

    cleanerText: {
      flex: 1,
    },

    cleanerTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 3,
    },

    /*
     * FINAL
     */

    finalSummary: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
      marginBottom: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor:
        withAlpha(
          theme.status.success,
          "10",
          theme.surface.selected
        ),
      borderWidth: 1,
      borderColor:
        withAlpha(
          theme.status.success,
          "30",
          theme.border.default
        ),
    },

    finalSummaryIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.status.success,
          "18",
          theme.surface.selected
        ),
      marginRight: 11,
    },

    finalSummaryText: {
      flex: 1,
    },

    finalSummaryTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 2,
    },

    submitButton: {
      marginTop: 4,
      minHeight: 52,
      borderRadius: 16,
    },

    submitHint: {
      textAlign: "center",
      marginTop: 9,
      marginBottom: 12,
      color: theme.text.secondary,
    },

    /*
     * MODAL
     */

    modalContent: {
      backgroundColor:
        theme.surface.elevated,
      marginHorizontal: 14,
      borderRadius: 24,
      padding: 20,
      maxHeight: "88%",
      ...getShadow(theme),
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      marginBottom: 18,
    },

    modalHeaderText: {
      flex: 1,
      paddingRight: 12,
    },

    modalTitle: {
      fontWeight: "800",
      color: theme.text.primary,
      marginBottom: 3,
    },

    modalClose: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        theme.background.sunken,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    modalScroll: {
      paddingBottom: 4,
    },

    sliderCard: {
      padding: 14,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      backgroundColor:
        theme.card.background,
      marginBottom: 12,
    },

    sliderHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    sliderIdentity: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    sliderIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          "18",
          theme.surface.selected
        ),
      marginRight: 9,
    },

    sliderRoomName: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text.primary,
      marginBottom: 2,
    },

    sizeBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    sizeBadgeText: {
      color: theme.brand.primary,
      fontWeight: "700",
    },

    slider: {
      width: "100%",
      height: 38,
      marginTop: 8,
    },

    sliderRange: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    sliderCategory: {
      color: theme.brand.primary,
      fontWeight: "700",
    },

    modalDone: {
      marginTop: 8,
      minHeight: 48,
      borderRadius: 15,
    },

    /*
     * LOADING
     */

    loadingOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor:
        theme.overlay,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    loadingCard: {
      width: "100%",
      maxWidth: 330,
      borderRadius: 22,
      padding: 26,
      alignItems: "center",
      backgroundColor:
        theme.surface.elevated,
      borderWidth: 1,
      borderColor:
        theme.border.default,
      ...getShadow(theme),
    },

    loadingTitle: {
      marginTop: 15,
      fontSize: 16,
      fontWeight: "800",
      color: theme.text.primary,
      textAlign: "center",
    },

    loadingDescription: {
      textAlign: "center",
      marginTop: 5,
      lineHeight: 18,
      color: theme.text.secondary,
    },
  });







// import React, { useState, useEffect, useContext, useRef } from "react";
// import { TextInput, Checkbox, RadioButton } from 'react-native-paper';
// import { StyleSheet, Text, KeyboardAvoidingView, findNodeHandle, Keyboard, Alert, Platform, StatusBar, Linking, FlatList, ScrollView, Image, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// import Button from "../../components/shared/Button";
// import { Modal, Portal, Provider } from "react-native-paper";
// import Slider from "@react-native-community/slider";
// import { AuthContext } from "../../context/AuthContext";
// import { SafeAreaView } from "react-native-safe-area-context";
// import COLORS from "../../constants/colors";
// import GoogleAutocomplete from "../../components/shared/GooglePlacesAutocomplete";
// import userService from "../../services/connection/userService";
// import { geocodeAddress } from "../../utils/geocodeAddress";
// import ROUTES from "../../constants/routes";
// import FloatingLabelPickerSelect from "../../components/shared/FloatingLabelPicker";
// import { propertyList } from "../../data";
// import moment from 'moment';
// import AddressInput from "../../components/shared/AddressInput";
// import { Icon } from 'react-native-paper';
// import useLocationPermission from "../../components/shared/UseLocationPermission";
// import { useNavigation } from "@react-navigation/native";
// import { createDefaultChecklist, generateTasksForRoomType } from "../../utils/createDefaultChecklist";
// import PlatformCleanerPicker from "../../components/host/PlatformCleanerPicker";
// import 'react-native-get-random-values';
// import { v4 as uuidv4 } from 'uuid';
// import CleanerManagementModal from "./CleanerManagementModal";
// import { tSafe } from "../../utils/tSafe";
// import { GOOGLE_MAPS_API_KEY } from "../../env";

// // Fallback Colors if COLORS is missing
// const FALLBACK_COLORS = {
//     primary: "#007AFF",
//     accent: COLORS.deepBlue,
// };

// export default function AddProperty() {
//     const { currentUserId } = useContext(AuthContext);
//     const { hasPermission } = useLocationPermission();
//     const navigation = useNavigation();

//     // Room State
//     const [roomDetails, setRoomDetails] = useState([
//       { type: "Bedroom", number: 0, size: 120, size_range: "Small" },
//       { type: "Bathroom", number: 0, size: 120, size_range: "Small" },
//       { type: "Livingroom", number: 0, size: 150, size_range: "Medium" },
//       { type: "Kitchen", number: 0, size: 140, size_range: "Small" },
//     ]);

//     const scrollViewRef = useRef(null);
//     const [keyboardHeight, setKeyboardHeight] = useState(0);
//     const [instructionInputY, setInstructionInputY] = useState(0);
//     const instructionInputRef = useRef(null);

//     const [modalVisible, setModalVisible] = useState(false);
//     const [aptName, setAptName] = useState("");
//     const [address, setAddress] = useState("");
//     const [apt_type, setAptType] = useState("");

//     const [firstname, setFirstname] = useState("");
//     const [lastname, setLastname] = useState("");
//     const [email, setEmail] = useState("");
//     const [avatar, setAvatar] = useState("");
//     const [errors, setErrors] = useState({
//       room_count: {},
//       room_size: {}
//     });

//     const [loading, setLoading] = React.useState(false);
//     const [selectedValue, setSelectedValue] = useState(null);

//     const { geolocationData } = useContext(AuthContext);
//     const phoneInput = useRef();
//     const [inputs, setInputs] = useState({
//         apt_name: "",
//         instructions: "",
//         cleaning_supplies: "",
//         contact_phone: "",
//         created_on: "",
//         roomInfo: []
//     });
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [checked, setChecked] = useState('');
//     const [latitude, setLatitude] = useState(null);
//     const [longitude, setLongitude] = useState(null);
//     const [city, setCity] = useState(null);
//     const [textInputBottomMargin, setTextInputBottomMargin] = useState(0);

//     const [manualAddressRequired, setManualAddressRequired] = useState(false);
//     const [autocompleteError, setAutocompleteError] = useState(null);
//     const [coordinates, setCoordinates] = useState(null);
//     const [showGoogleAutocomplete, setShowGoogleAutocomplete] = useState(true);

//     const [preferredCleaners, setPreferredCleaners] = useState([]);
//     const [invitedCleanerEmail, setInvitedCleanerEmail] = useState('');
//     const [invitedCleanerPhone, setInvitedCleanerPhone] = useState('');
//     const [invitedCleaners, setInvitedCleaners] = useState([]);

//     const [cleanerModalVisible, setCleanerModalVisible] = useState(false);
//     const [platformCleaners, setPlatformCleaners] = useState([]);

//     useEffect(() => {
//         const checkApiKey = async () => {
//           const isValid = await testGooglePlacesApiKey();
//           if (!isValid) {
//             setShowGoogleAutocomplete(false);
//             setAutocompleteError(tSafe('address_service_unavailable', 'Address service unavailable. Please enter manually.'));
//           }
//         };
//         if (showGoogleAutocomplete) {
//           checkApiKey();
//         }
//     }, [showGoogleAutocomplete]);

//     useEffect(() => {
//         if (!coordinates?.latitude || !coordinates?.longitude) return;
//         fetchPlatformCleaners(coordinates.latitude, coordinates.longitude);
//     }, [coordinates]);

//     const fetchPlatformCleaners = async (lat, lng) => {
//         try {
//           const res = await userService.getPlatformCleaners({
//             latitude: lat,
//             longitude: lng,
//             radius: 100 // miles
//           });
//           console.log("Recommended cleaners-----", res.data);
//           setPlatformCleaners(res.data);
//         } catch (err) {
//           console.log('Failed to fetch platform cleaners', err);
//         }
//     };

//     // Handle autocomplete selection
//     const handleAutocompleteSelect = async (selectedAddress) => {
//       try {
//         const { latitude, longitude } = await geocodeAddress(selectedAddress);
//         setCoordinates({ latitude, longitude });
//         setAddress(selectedAddress);
//         setAutocompleteError(null);
//         setErrors(prev => ({...prev, address: null}));
//       } catch (error) {
//         console.error('Geocoding failed:', error);
//         setCoordinates(null);
//         setAutocompleteError(tSafe('failed_verify_address', 'Failed to verify address. Please enter manually.'));
//         setShowGoogleAutocomplete(false);
//       }
//     };

//     const handleAutocompleteError = (error) => {
//       if (error === 'ZERO_RESULTS' || error === 'REQUEST_DENIED' ||
//           error === 'INVALID_REQUEST' || error === 'UNKNOWN_ERROR') {
//         setAutocompleteError(tSafe('address_service_unavailable', 'Address service unavailable. Please enter manually.'));
//         setShowGoogleAutocomplete(false);
//       }
//     };

//     const handleManualAddressChange = (val) => {
//       setAddress(val);
//       setCoordinates(null);
//       setErrors(prev => ({...prev, address: null}));
//       setAutocompleteError(null);
//     };

//     const handleManualVerification = (coords) => {
//       setCoordinates(coords);
//       setErrors(prev => ({...prev, address: null}));
//       setAutocompleteError(null);
//     };

//     useEffect(() => {
//       const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
//         setKeyboardHeight(e.endCoordinates.height);
//       });
//       const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
//         setKeyboardHeight(0);
//       });
//       return () => {
//         keyboardDidShowListener.remove();
//         keyboardDidHideListener.remove();
//       };
//     }, []);

//     useEffect(() => {
//       fetchUser();
//     }, []);

//     const fetchUser = async () => {
//       try {
//         await userService.getUser(currentUserId)
//         .then(response => {
//           const res = response.data;
//           setFirstname(res.firstname);
//           setLastname(res.lastname);
//           setEmail(res.email);
//           setAvatar(res.avatar);
//           setCity(res.location.city);
//         });
//       } catch(e) {
//         // error reading value
//       }
//     };

//     const getRoomSizeCategory = (size) => {
//       if (size < 150) return tSafe('size_small', 'Small');
//       if (size >= 150 && size <= 300) return tSafe('size_medium', 'Medium');
//       return tSafe('size_large', 'Large');
//     };

//     const handleRoomCountChange = (roomType, action) => {
//       setRoomDetails(prevRooms =>
//           prevRooms.map(room => {
//               if (room.type === roomType) {
//                   const newCount = action === "add" ? room.number + 1 : Math.max(0, room.number - 1);
//                   setErrors(prevErrors => ({
//                       ...prevErrors,
//                       room_count: {
//                           ...prevErrors.room_count,
//                           [roomType]: newCount > 0 ? null : prevErrors.room_count[roomType],
//                       },
//                   }));
//                   return { ...room, number: newCount };
//               }
//               return room;
//           })
//       );
//     };

//     const handleRoomSizeChange = (type, size) => {
//       setRoomDetails((prev) =>
//         prev.map((room) =>
//           room.type === type
//             ? { ...room, size, size_range: getRoomSizeCategory(size) }
//             : room
//         )
//       );
//     };

//     const handleConfirmRoomSelection = () => {
//       const totalRooms = roomDetails.reduce((acc, room) => acc + room.number, 0);
//       if (totalRooms > 0) {
//         setModalVisible(true);
//       }
//     };

//     const handleSelectedAddress = async (selectedAddress) => {
//       try {
//         const { latitude, longitude } = await geocodeAddress(selectedAddress);
//         setCoordinates({ latitude, longitude });
//         setAddress(selectedAddress);
//         setErrors(prev => ({...prev, address: null}));
//       } catch (error) {
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe('failed_geocode_address', 'Failed to geocode address')
//         );
//         setCoordinates(null);
//       }
//     };

//     const formatPhoneNumber = (input) => {
//       const cleaned = ('' + input).replace(/\D/g, '');
//       const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
//       if (match) {
//         return '(' + match[1] + ') ' + match[2] + '-' + match[3];
//       }
//       return input;
//     };

//     const handleInputChange = (text) => {
//       setPhoneNumber(formatPhoneNumber(text));
//     };

//     const handleChange = (text, input) => {
//       setInputs(prevState => ({...prevState, [input]: text}));
//     };

//     const onSubmit = async () => {
//       setLoading(true);
    
//       if (!validate()) {
//         setLoading(false);
//         return;
//       }
    
//       try {
//         const owner_info = {
//           firstname,
//           lastname,
//           email,
//           userId: currentUserId,
//           avatar
//         };
    
//         const propertyData = {
//           userId: currentUserId,
//           owner_info,
//           apt_name: inputs.apt_name,
//           instructions: inputs.instructions,
//           cleaning_supplies: checked,
//           contact_phone: phoneNumber.replace(/\D/g, ''),
//           address,
//           latitude: coordinates.latitude.toFixed(4),
//           longitude: coordinates.longitude.toFixed(4),
//           created_on: moment().format('YYYY-MM-DD HH:mm:ss'),
//           apt_type,
//           preferredCleaners: preferredCleaners.map(c => ({
//             id: c.id,
//             type: c.type
//           })),
//           invitedCleaners,
//           roomDetails,
//         };
    
//         console.log("Property data-------------|-------|", propertyData);
    
//         const propertyResponse = await userService.addApartment(propertyData);
    
//         if (propertyResponse.status === 200) {
//           const { propertyId, checklistId } = propertyResponse.data;
    
//           // ✅ Navigate to PropertyDashboard with the new property ID
//           navigation.replace(ROUTES.host_apt_dashboard, { propertyId });
//         } else {
//           Alert.alert(
//             tSafe('error_title', 'Error'),
//             tSafe('property_creation_failed', 'Property creation failed')
//           );
//         }
//       } catch (err) {
//         console.log("Error creating property:", err);
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe('something_went_wrong', 'Something went wrong, please try again')
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     const handleError = (error, input) => {
//       setErrors(prevState => ({...prevState, [input]: error}));
//     };

//     const validateRoomDetails = (roomDetails) => {
//       let isValid = true;
//       let newErrors = { room_count: {}, room_size: {} };

//       for (const room of roomDetails) {
//           if (room.number <= 0) {
//               newErrors.room_count[room.type] = tSafe('room_count_error', '{type} count must be greater than 0', { type: room.type });
//               isValid = false;
//           }
//           if (room.size < 50 || room.size > 600) {
//               newErrors.room_size[room.type] = tSafe('room_size_error', '{type} size must be between 50 and 600 sq ft', { type: room.type });
//               isValid = false;
//           }
//       }

//       setErrors((prevErrors) => ({
//           ...prevErrors,
//           room_count: newErrors.room_count,
//           room_size: newErrors.room_size
//       }));

//       return isValid;
//     };

//     const validate = () => {
//       let isValid = true;
//       const newErrors = {
//         apt_name: null,
//         address: null,
//         apt_type: null,
//         contact_phone: null,
//         instructions: null,
//         room_count: {},
//         room_size: {}
//       };

//       if (!inputs.apt_name.trim()) {
//         newErrors.apt_name = tSafe('property_name_required', 'Property name is required');
//         isValid = false;
//       }

//       if (!address.trim()) {
//         newErrors.address = tSafe('address_required', 'Address is required');
//         isValid = false;
//       } else if (!coordinates) {
//         if (showGoogleAutocomplete) {
//           newErrors.address = tSafe('verify_address_suggestions', 'Please verify address by selecting from suggestions');
//         } else {
//           newErrors.address = tSafe('verify_address', 'Please verify your address');
//         }
//         isValid = false;
//       }

//       if (!apt_type.trim()) {
//         newErrors.apt_type = tSafe('property_type_required', 'Property Type is required');
//         isValid = false;
//       }

//       roomDetails.forEach((room) => {
//         if (room.number <= 0) {
//           newErrors.room_count[room.type] = tSafe('room_count_error', '{type} count must be greater than 0', { type: room.type });
//           isValid = false;
//         }
//         if (room.size < 50 || room.size > 600) {
//           newErrors.room_size[room.type] = tSafe('room_size_error', '{type} size must be between 50 and 600 sq ft', { type: room.type });
//           isValid = false;
//         }
//       });

//       const phoneRegex = /^[0-9]{10}$/;
//       const cleanedPhone = phoneNumber.replace(/\D/g, '');
//       if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
//         newErrors.contact_phone = tSafe('valid_phone_required', 'Enter a valid 10-digit phone number');
//         isValid = false;
//       }

//       if (inputs.instructions && inputs.instructions.length < 5) {
//         newErrors.instructions = tSafe('instructions_min_length', 'Instructions must be at least 5 characters long');
//         isValid = false;
//       }

//       setErrors(newErrors);
//       return isValid;
//     };

//     const renderAddressInputs = () => (
//       <>
//         {showGoogleAutocomplete && (
//           <GoogleAutocomplete
//             label={tSafe('property_address_label', 'Property Address')}
//             apiKey={GOOGLE_MAPS_API_KEY}
//             selected_address={handleAutocompleteSelect}
//             handleError={handleAutocompleteError}
//           />
//         )}

//         {!showGoogleAutocomplete && (
//           <AddressInput
//             label={tSafe('property_address_label', 'Property Address')}
//             value={address}
//             onChange={handleManualAddressChange}
//             onCoordinatesSet={handleManualVerification}
//             error={errors.address}
//           />
//         )}

//         {!hasPermission && (
//           <View style={styles.permissionWarningContainer}>
//             <Icon
//               source="alert-circle-outline"
//               size={16}
//               color={COLORS.orange}
//             />
//             <Text style={styles.permissionWarningText}>
//               {tSafe('location_permission_required', 'Location permission required for address verification')}
//             </Text>
//           </View>
//         )}

//         {autocompleteError && !showGoogleAutocomplete && !coordinates && (
//           <Text style={styles.errorText}>{autocompleteError}</Text>
//         )}
//         {errors.address && !coordinates && (
//           <Text style={styles.errorText}>{errors.address}</Text>
//         )}
//       </>
//     );

//     const generateUniqueToken = () => {
//       return (
//         Date.now().toString(36) +
//         Math.random().toString(36).substring(2, 10)
//       );
//     };

//     const handleInviteCleaner = () => {
//       if (!invitedCleanerEmail && !invitedCleanerPhone) {
//         Alert.alert(
//           tSafe('error_title', 'Error'),
//           tSafe('email_or_phone_required', 'Email or phone is required')
//         );
//         return;
//       }

//       const tempId = uuidv4();

//       setPreferredCleaners(prev => [
//         ...prev,
//         { id: tempId, type: "invited" }
//       ]);

//       setInvitedCleaners(prev => [
//         ...prev,
//         {
//           tempId,
//           email: invitedCleanerEmail || null,
//           phone: invitedCleanerPhone || null
//         }
//       ]);

//       setInvitedCleanerEmail("");
//       setInvitedCleanerPhone("");
//     };

//     const handleCloseModal = () => {
//       setRoomDetails((prev) =>
//         prev.map((room) => ({
//           ...room,
//           size_range: getRoomSizeCategory(room.size),
//         }))
//       );
//       setModalVisible(false);
//     };

//     return (
//       <Provider>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
//         >
//           <View style={{ flex: 1, paddingHorizontal:20, backgroundColor:"white" }}>
//             <StatusBar backgroundColor={COLORS.white} barStyle="dark-content"/>
//             <ScrollView
//               ref={scrollViewRef}
//               contentContainerStyle={{ paddingBottom: keyboardHeight }}
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//             >
//               <TextInput
//                 mode="outlined"
//                 label={tSafe('property_title_label', 'Property Title')}
//                 placeholder={tSafe('property_title_placeholder', 'Property Title')}
//                 placeholderTextColor={COLORS.darkGray}
//                 outlineColor="#CCC"
//                 value={inputs.apt_name}
//                 activeOutlineColor={COLORS.primary}
//                 style={{marginBottom:0, marginTop:40, fontSize:14, backgroundColor:"#fff"}}
//                 onChangeText={text => handleChange(text, 'apt_name')}
//                 onFocus={() => handleError(null, 'apt_name')}
//                 iconName="email-outline"
//                 error={errors.apt_name}
//               />
//               {errors.apt_name && <Text style={styles.errorText}>{errors.apt_name}</Text>}

//               {renderAddressInputs()}

//               {coordinates && (
//                 <>
//                   {/* Updated FloatingLabelPickerSelect with validation */}
//                   <FloatingLabelPickerSelect
//                     label={tSafe('select_property_type', 'Select Property Type')}
//                     items={propertyList}
//                     value={apt_type}
//                     onValueChange={(value) => {
//                       setAptType(value);
//                       if (errors.apt_type) {
//                         setErrors(prev => ({ ...prev, apt_type: null }));
//                       }
//                     }}
//                   />
//                   {errors.apt_type && <Text style={styles.errorText}>{errors.apt_type}</Text>}

//                   <View style={styles.add_rooms}>
//                     <Text style={styles.label}>{tSafe('select_number_of_rooms', 'Select Number of Rooms')}</Text>

//                     {roomDetails?.map((room, index) => (
//                       <View key={index} style={styles.roomContainer}>
//                         <View style={{ flex: 1 }}>
//                           <Text style={styles.roomType}>{room.type}</Text>
//                           <Text style={styles.roomSize}>
//                             {tSafe('size_label', 'Size:')} {room.size} {tSafe('sq_ft', 'sq ft')} ({room.size_range})
//                           </Text>
//                         </View>

//                         <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "minus")} style={styles.counterButton}>
//                           <Text style={styles.buttonSign}>-</Text>
//                         </TouchableOpacity>

//                         <Text style={styles.roomCount}>{room.number}</Text>

//                         <TouchableOpacity onPress={() => handleRoomCountChange(room.type, "add")} style={styles.counterButton}>
//                           <Text style={styles.buttonSign}>+</Text>
//                         </TouchableOpacity>

//                         {errors?.room_count?.[room.type] && (
//                           <Text style={styles.errorTextRoom}>{errors.room_count[room.type]}</Text>
//                         )}
//                         {errors?.room_size?.[room.type] && (
//                           <Text style={styles.errorTextRoom}>{errors.room_size[room.type]}</Text>
//                         )}
//                       </View>
//                     ))}

//                     <TouchableOpacity onPress={handleConfirmRoomSelection} style={styles.confirmButton}>
//                       <Text style={{ alignSelf: 'center', fontWeight: '500' }}>
//                         {tSafe('adjust_size', 'Adjust Size')}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.radioButtonMainContainer}>
//                     <View>
//                       <Text>{tSafe('have_cleaning_supplies', 'Have Cleaning Supplies:')}</Text>
//                     </View>
//                     <View style={styles.radioButtonContainer}>
//                       <RadioButton.Android
//                         value="yes"
//                         status={checked === 'yes' ? 'checked' : 'unchecked'}
//                         onPress={() => setChecked('yes')}
//                         color={COLORS.primary}
//                       />
//                       <Text>{tSafe('yes', 'Yes')}</Text>
//                     </View>
//                     <View style={styles.radioButtonContainer}>
//                       <RadioButton.Android
//                         value="no"
//                         status={checked === 'no' ? 'checked' : 'unchecked'}
//                         onPress={() => setChecked('no')}
//                         color={COLORS.primary}
//                       />
//                       <Text>{tSafe('no', 'No')}</Text>
//                     </View>
//                   </View>

//                   <TextInput
//                     mode="outlined"
//                     label={tSafe('specific_instruction_label', 'Specific Instruction')}
//                     placeholder={tSafe('specific_instruction_placeholder', 'Specific Instruction')}
//                     placeholderTextColor={COLORS.gray}
//                     outlineColor="#D8D8D8"
//                     value={inputs.instructions}
//                     activeOutlineColor={COLORS.primary}
//                     style={{ marginBottom: 5, color: COLORS.gray, fontSize: 14, backgroundColor: "#fff" }}
//                     onChangeText={text => handleChange(text, 'instructions')}
//                     onFocus={() => {
//                       handleError(null, 'instruction');
//                       setTimeout(() => {
//                         if (instructionInputRef.current && keyboardHeight > 0) {
//                           instructionInputRef.current.measure((x, y, width, height, pageX, pageY) => {
//                             const scrollToY = Math.max(0, y - keyboardHeight + height + 20);
//                             scrollViewRef.current?.scrollTo({ y: scrollToY, animated: true });
//                           });
//                         }
//                       }, 300);
//                     }}
//                     error={errors.instructions}
//                     iconName="email-outline"
//                     multiline
//                   />

//                   <TextInput
//                     label={tSafe('contact_phone_label', 'Contact Phone Number')}
//                     placeholder={tSafe('contact_phone_placeholder', 'Contact Phone Number')}
//                     mode="outlined"
//                     outlineColor="#CCC"
//                     activeOutlineColor={COLORS.primary}
//                     value={phoneNumber}
//                     onChangeText={handleInputChange}
//                     keyboardType="phone-pad"
//                     style={{ marginBottom: 10, fontSize: 14, width: '100%', backgroundColor: "#fff" }}
//                     onFocus={() => handleError(null, 'contact_phone')}
//                     error={errors.contact_phone}
//                   />
//                   {errors.contact_phone && <Text style={styles.errorText}>{errors.contact_phone}</Text>}

//                   {/* <TouchableOpacity onPress={() => setCleanerModalVisible(true)} style={styles.confirmButton}>
//                     <Text style={{ alignSelf: 'center', fontWeight: '500' }}>
//                       {tSafe('manage_cleaners', 'Manage Cleaners')} ({preferredCleaners.length} {tSafe('selected', 'selected')})
//                     </Text>
//                   </TouchableOpacity> */}

//                   <Button title={tSafe('add_apartment', 'Add Apartment')} loading={loading} onPress={onSubmit} />
//                 </>
//               )}
//             </ScrollView>

//             <Portal>
//               <Modal visible={modalVisible} onDismiss={handleCloseModal} contentContainerStyle={styles.modalContent}>
//                 <ScrollView>
//                   <Text style={styles.modalTitle}>{tSafe('adjust_room_sizes', 'Adjust Room Sizes')}</Text>
//                   {roomDetails.map((room, index) =>
//                     room.number > 0 ? (
//                       <View key={index} style={{ marginBottom: 10 }}>
//                         <Text>{room.type} {tSafe('size_label', 'Size')} ({room.size_range})</Text>
//                         <Slider
//                           style={{ width: "100%", height: 20, marginLeft:0 }}
//                           minimumValue={100}
//                           maximumValue={500}
//                           step={10}
//                           value={room.size}
//                           onValueChange={(value) => handleRoomSizeChange(room.type, value)}
//                           minimumTrackTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                           maximumTrackTintColor={COLORS.light_gray}
//                           thumbTintColor={COLORS.primary || FALLBACK_COLORS.primary}
//                         />
//                         <Text style={styles.square_foot}>{room.size} {tSafe('sq_ft', 'sq ft')}</Text>
//                       </View>
//                     ) : null
//                   )}
//                 </ScrollView>
//                 <TouchableOpacity mode="contained" onPress={handleCloseModal} style={styles.submitButton}>
//                   <Text style={styles.submitButtonText}>{tSafe('done', 'Done')}</Text>
//                 </TouchableOpacity>
//               </Modal>
//             </Portal>
//           </View>
//           <CleanerManagementModal
//             visible={cleanerModalVisible}
//             onClose={() => setCleanerModalVisible(false)}
//             platformCleaners={platformCleaners}
//             preferredCleaners={preferredCleaners}
//             setPreferredCleaners={setPreferredCleaners}
//             invitedCleaners={invitedCleaners}
//             setInvitedCleaners={setInvitedCleaners}
//           />
//         </KeyboardAvoidingView>
//       </Provider>
//     );
// }

// const styles = StyleSheet.create({
//     label: {
//       fontSize: 14,
//       fontWeight: "400",
//       marginTop: 5,
//       color: COLORS.gray
//     },
//     input: {
//       borderBottomWidth: 1,
//       marginBottom: 15,
//       paddingVertical: 5,
//     },
//     confirmButton: {
//       marginTop: 20,
//       backgroundColor: COLORS.white || FALLBACK_COLORS.accent,
//       padding:10,
//       borderRadius:50,
//       borderColor: COLORS.light_gray,
//       borderWidth:1
//     },
//     submitButton: {
//       marginTop: 10,
//       backgroundColor: COLORS.primary || FALLBACK_COLORS.primary,
//       padding:10,
//       borderRadius:50
//     },
//     submitButtonText:{
//       color:'white',
//       alignSelf:'center',
//       fontWeight:'600',
//       fontSize:16
//     },
//     modalContent: {
//       backgroundColor: "white",
//       padding: 20,
//       marginHorizontal: 20,
//       borderRadius: 10,
//     },
//     modalTitle: {
//       fontSize: 18,
//       fontWeight: "bold",
//       marginBottom: 10,
//     },
//     radioButtonContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginVertical: 1,
//     },
//     radioButtonMainContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     add_rooms:{
//       borderWidth:1,
//       borderColor:"#D8D8D8",
//       borderRadius:10,
//       padding:10,
//       marginTop:10
//     },
//     errorText: {
//       color: "#D32F2F",
//       fontSize: 12,
//       marginTop:2
//     },
//     square_foot:{
//       marginTop:-10,
//       fontSize:12
//     },
//     roomContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingBottom: 18,
//       paddingTop:5,
//       borderBottomWidth: 1,
//       borderBottomColor: "#ddd",
//     },
//     roomType: {
//       fontSize: 14,
//       fontWeight: "500",
//     },
//     roomSize: {
//       fontSize: 14,
//       color: "#666",
//     },
//     counterContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 12
//     },
//     counterButton: {
//       width: 36,
//       height: 36,
//       borderRadius: 18,
//       borderWidth: 1,
//       borderColor: COLORS.light_gray_1,
//       justifyContent: "center",
//       alignItems: "center",
//       backgroundColor: COLORS.light_gray_1,
//       shadowColor: "#000",
//       shadowOpacity: 0.08,
//       shadowOffset: { width: 0, height: 1 },
//       shadowRadius: 1,
//       elevation: 1
//     },
//     counterText: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: "#222"
//     },
//     buttonSign:{
//       fontSize:18
//     },
//     roomCount: {
//       fontSize: 14,
//       fontWeight: "500",
//       minWidth: 24,
//       color: COLORS.gray,
//       textAlign: "center"
//     },
//     errorTextRoom: {
//       color: "#D32F2F",
//       fontSize: 12,
//       marginTop: 5,
//       position:"absolute",
//       left:0,
//       top:40
//     },
//     manualInputContainer: {
//       marginTop: 10,
//       borderTopWidth: 1,
//       borderTopColor: COLORS.lightGray,
//       paddingTop: 15
//     },
//     manualPrompt: {
//       color: COLORS.gray,
//       marginBottom: 10,
//       fontStyle: 'italic'
//     },
//     permissionWarningContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: '#FFF8E6',
//       padding: 10,
//       borderRadius: 4,
//       borderLeftWidth: 3,
//       borderLeftColor: COLORS.orange,
//       marginVertical: 10,
//     },
//     permissionWarningText: {
//       fontSize: 12,
//       color: COLORS.darkGray,
//       marginLeft: 8,
//     },
// });