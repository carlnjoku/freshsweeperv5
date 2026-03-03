// import React, { createContext, useContext, useState } from 'react';
// import { regular_cleaning } from '../data';

// const BookingContext = createContext();
// export const useBookingContext = () => useContext(BookingContext);

// export const BookingProvider = ({ children }) => {
//   const initialFormData = {
//     extra: [],
//     apartment_name: '',
//     address: '',
//     apartment_latitude: '',
//     apartment_longitude: '',
//     cleaning_date: '',
//     cleaning_time: '',
//     regular_cleaning: regular_cleaning,
//     totalPrice: '0',
//     total_cleaning_fee: 0
//   };

//   const [formData, setFormData] = useState(initialFormData);
//   const [extras, setExtras] = useState([]); // ✅ NEW
//   const [isSelectedList, setIsSelectedList] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalEVisible, setModalEVisible] = useState(false);
//   const [openModal, setOpenModal] = useState(false);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);

//   const toggleSelected = (value) => {
//     setIsSelectedList((prevSelected) => ({
//       ...prevSelected,
//       [value]: !prevSelected[value],
//     }));
//   };

//   const resetFormData = () => {
//     setFormData(initialFormData);
//     setExtras([]); // Reset extras when resetting form data
//   };

//   const handleEdit = (visible, schedule = null) => {
//     setModalEVisible(visible);
//     setSelectedSchedule(schedule);
//     setFormData(schedule?.schedule || initialFormData);

//     if (!visible) {
//       resetFormData();
//     }
//   };

//   const handleCreateSchedule = (value) => {
//     setModalVisible(value);
//   };

//   const handleEditSchedule = (value) => {
//     setModalEVisible(value);
//   };

//   return (
//     <BookingContext.Provider
//       value={{
//         formData,
//         setFormData,
//         extras,          // ✅ EXPOSE extras
//         setExtras,       // ✅ EXPOSE setExtras
//         isSelectedList,
//         handleEdit,
//         modalVisible,
//         modalEVisible,
//         setModalVisible,
//         setModalEVisible,
//         selectedSchedule,
//         openModal,
//         handleCreateSchedule,
//         handleEditSchedule,
//         resetFormData,
//         toggleSelected
//       }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };



import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { regular_cleaning } from '../data';

const BookingContext = createContext();
export const useBookingContext = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const initialFormData = {
    extra: [],
    apartment_name: '',
    address: '',
    apartment_latitude: '',
    apartment_longitude: '',
    cleaning_date: '',
    cleaning_time: '',
    regular_cleaning,
    totalPrice: '0',
    total_cleaning_fee: 0,
    aptId: null,
    checklistId: null,
    checklists: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [extras, setExtras] = useState([]);
  const [isSelectedList, setIsSelectedList] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEVisible, setModalEVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  /* ---------------- VALIDATION (single source of truth) ---------------- */

  const isPropertyStepValid = useMemo(() => {
    if (!formData.aptId) return false;
    if (!formData.checklistId && !formData.checklists?.length) return false;
    return true;
  }, [formData.aptId, formData.checklistId, formData.checklists]);

  /* ---------------- ACTIONS ---------------- */

  const resetFormData = () => {
    setFormData(initialFormData);
    setExtras([]);
  };

  const handleEdit = (visible, schedule = null) => {
    setModalEVisible(visible);
    setSelectedSchedule(schedule);

    setFormData(prev =>
      visible && schedule?.schedule
        ? { ...prev, ...schedule.schedule }
        : initialFormData
    );

    if (!visible) resetFormData();
  };

  const toggleSelected = value => {
    setIsSelectedList(prev => ({
      ...prev,
      [value]: !prev[value],
    }));
  };

  /* ---------------- CONTEXT VALUE ---------------- */

  const value = useMemo(
    () => ({
      formData,
      setFormData,
      extras,
      setExtras,
      isSelectedList,
      toggleSelected,
      modalVisible,
      modalEVisible,
      setModalVisible,
      setModalEVisible,
      selectedSchedule,
      handleEdit,
      resetFormData,
      isPropertyStepValid, // ✅ exposed validation
    }),
    [
      formData,
      extras,
      isSelectedList,
      modalVisible,
      modalEVisible,
      selectedSchedule,
      isPropertyStepValid,
    ]
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};