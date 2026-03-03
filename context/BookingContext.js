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

//   const [scheduleStep, setScheduleStep] = useState(null);
//   const [selectedChecklistId, setSelectedChecklistId] = useState(null);
//   const [resumeAfterChecklist, setResumeAfterChecklist] = useState(false);
  

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
//         toggleSelected,


//         scheduleStep,
//         setScheduleStep,
//         selectedChecklistId,
//         setSelectedChecklistId,
//         resumeAfterChecklist,
//         setResumeAfterChecklist,
//       }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };




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
//   const [extras, setExtras] = useState([]);
//   const [isSelectedList, setIsSelectedList] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalEVisible, setModalEVisible] = useState(false);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);

//   const toggleSelected = (value) => {
//     setIsSelectedList((prevSelected) => ({
//       ...prevSelected,
//       [value]: !prevSelected[value],
//     }));
//   };

//   const resetFormData = () => {
//     setFormData(initialFormData);
//     setExtras([]);
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
//         extras,
//         setExtras,
//         isSelectedList,
//         handleEdit,
//         modalVisible,
//         modalEVisible,
//         setModalVisible,
//         setModalEVisible,
//         selectedSchedule,
//         handleCreateSchedule,
//         handleEditSchedule,
//         resetFormData,
//         toggleSelected,
//       }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };



// import React, { createContext, useContext, useState } from 'react';
// import { regular_cleaning } from '../data';

// const BookingContext = createContext();
// export const useBookingContext = () => useContext(BookingContext);

// export const BookingProvider = ({ children }) => {
//   const initialFormData = {
//     aptId: null,
//     checklistId: null,

//     apartment_name: '',
//     address: '',
//     apartment_latitude: '',
//     apartment_longitude: '',

//     cleaning_date: '',
//     cleaning_time: '',

//     regular_cleaning,
//     extra: [],

//     totalPrice: '0',
//     total_cleaning_fee: 0,
//   };

//   const [formData, setFormData] = useState(initialFormData);
//   const [extras, setExtras] = useState([]);
//   const [isSelectedList, setIsSelectedList] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalEVisible, setModalEVisible] = useState(false);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);

//   const toggleSelected = (value) => {
//     setIsSelectedList(prev => ({
//       ...prev,
//       [value]: !prev[value],
//     }));
//   };

//   const resetFormData = () => {
//     setFormData(prev => ({
//       ...initialFormData,
//       aptId: prev.aptId, // preserve if needed
//     }));
//     setExtras([]);
//   };

//   /** ---------- OPEN CREATE ---------- */
//   const openCreateSchedule = useCallback(() => {
//     setSelectedSchedule(null);
//     setFormData(initialFormData);
//     setModalVisible(true);
//   }, []);

//   /** ---------- CLOSE CREATE ---------- */
//   const closeCreateSchedule = useCallback(() => {
//     setModalVisible(false);

//     // 🔥 defer reset until modal is gone
//     setTimeout(() => {
//       setFormData(initialFormData);
//     }, 0);
//   }, []);

//   /** ---------- OPEN EDIT ---------- */
//   const openEditSchedule = useCallback((schedule) => {
//     setSelectedSchedule(schedule);
//     setFormData(schedule?.schedule || initialFormData);
//     setModalEVisible(true);
//   }, []);

//   /** ---------- CLOSE EDIT ---------- */
//   const closeEditSchedule = useCallback(() => {
//     setModalEVisible(false);

//     setTimeout(() => {
//       setSelectedSchedule(null);
//       setFormData(initialFormData);
//     }, 0);
//   }, []);

//   const handleEdit = (visible, schedule = null) => {
//     setModalEVisible(visible);
//     setSelectedSchedule(schedule);

//     if (visible && schedule?.schedule) {
//       setFormData(prev => ({
//         ...prev,
//         ...schedule.schedule,
//       }));
//     }

//     if (!visible) {
//       resetFormData();
//     }
//   };

//   return (
//     <BookingContext.Provider
//       value={{
//         formData,
//         setFormData,
//         extras,
//         setExtras,
//         isSelectedList,
//         toggleSelected,

//         modalVisible,
//         setModalVisible,

//         modalEVisible,
//         setModalEVisible,

//         selectedSchedule,
//         handleEdit,
//         resetFormData,
//       }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };



// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
// } from 'react';
// import { regular_cleaning } from '../data';

// const BookingContext = createContext();
// export const useBookingContext = () => useContext(BookingContext);

// export const BookingProvider = ({ children }) => {
//   const initialFormData = {
//     aptId: null,
//     checklistId: null,

//     apartment_name: '',
//     address: '',
//     apartment_latitude: '',
//     apartment_longitude: '',

//     cleaning_date: '',
//     cleaning_time: '',

//     regular_cleaning,
//     extra: [],

//     totalPrice: '0',
//     total_cleaning_fee: 0,
//   };

//   const [formData, setFormData] = useState(initialFormData);
//   const [extras, setExtras] = useState([]);
//   const [isSelectedList, setIsSelectedList] = useState({});

//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalEVisible, setModalEVisible] = useState(false);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);
  
//   // Additional state variables needed by NewBooking.js
//   const [scheduleStep, setScheduleStep] = useState('property');
//   const [selectedChecklistId, setSelectedChecklistId] = useState(null);
//   const [resumeAfterChecklist, setResumeAfterChecklist] = useState(false);

//   /** ---------------- UTIL ---------------- */
//   const toggleSelected = useCallback((value) => {
//     setIsSelectedList(prev => ({
//       ...prev,
//       [value]: !prev[value],
//     }));
//   }, []);

//   const resetFormData = useCallback(() => {
//     setFormData(prev => ({
//       ...initialFormData,
//       aptId: prev.aptId, // preserve property if needed
//     }));
//     setExtras([]);
//     setIsSelectedList({});
//   }, []);

//   /** ---------------- CREATE ---------------- */
//   const openCreateSchedule = useCallback(() => {
//     setSelectedSchedule(null);
//     setFormData(initialFormData);
//     setModalVisible(true);
//   }, []);

//   const closeCreateSchedule = useCallback(() => {
//     setModalVisible(false);

//     // 🔥 reset AFTER modal unmount
//     setTimeout(resetFormData, 0);
//   }, [resetFormData]);

//   /** ---------------- EDIT ---------------- */
//   const openEditSchedule = useCallback((schedule) => {
//     setSelectedSchedule(schedule);

//     if (schedule?.schedule) {
//       setFormData({
//         ...initialFormData,
//         ...schedule.schedule,
//       });
//     }

//     setModalEVisible(true);
//   }, []);

//   const closeEditSchedule = useCallback(() => {
//     setModalEVisible(false);

//     setTimeout(() => {
//       setSelectedSchedule(null);
//       resetFormData();
//     }, 0);
//   }, [resetFormData]);

//   /** ---------------- HANDLE CREATE SCHEDULE ---------------- */
//   const handleCreateSchedule = useCallback((visible) => {
//     if (visible) {
//       openCreateSchedule();
//     } else {
//       closeCreateSchedule();
//     }
//   }, [openCreateSchedule, closeCreateSchedule]);

//   return (
//     <BookingContext.Provider
//       value={{
//         /** data */
//         formData,
//         setFormData,
//         extras,
//         setExtras,
//         isSelectedList,
//         toggleSelected,

//         /** modal state */
//         modalVisible,
//         modalEVisible,
//         selectedSchedule,
//         scheduleStep,
//         selectedChecklistId,
//         resumeAfterChecklist,

//         /** modal actions */
//         openCreateSchedule,
//         closeCreateSchedule,
//         openEditSchedule,
//         closeEditSchedule,
//         handleCreateSchedule,

//         /** additional functions */
//         setScheduleStep,
//         setSelectedChecklistId,
//         setResumeAfterChecklist,
//         resetFormData,
//       }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };



// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
// } from 'react';
// import { regular_cleaning } from '../data';

// const BookingContext = createContext();
// export const useBookingContext = () => useContext(BookingContext);

// export const BookingProvider = ({ children }) => {
//   const initialFormData = {
//     aptId: null,
//     checklistId: null,
//     apartment_name: '',
//     address: '',
//     apartment_latitude: '',
//     apartment_longitude: '',
//     cleaning_date: '',
//     cleaning_time: '',
//     regular_cleaning,
//     extra: [],
//     totalPrice: '0',
//     total_cleaning_fee: 0,
//   };

//   const [formData, setFormData] = useState(initialFormData);
//   const [extras, setExtras] = useState([]);
//   const [isSelectedList, setIsSelectedList] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalEVisible, setModalEVisible] = useState(false);
//   const [selectedSchedule, setSelectedSchedule] = useState(null);
//   const [scheduleStep, setScheduleStep] = useState('property');
//   const [selectedChecklistId, setSelectedChecklistId] = useState(null);
//   const [resumeAfterChecklist, setResumeAfterChecklist] = useState(false);

//   /** ---------------- UTIL ---------------- */
//   const toggleSelected = useCallback((value) => {
//     setIsSelectedList(prev => ({
//       ...prev,
//       [value]: !prev[value],
//     }));
//   }, []);

//   const resetFormData = useCallback(() => {
//     setFormData(initialFormData);
//     setExtras([]);
//     setIsSelectedList({});
//   }, [initialFormData]);

//   /** ---------------- CREATE ---------------- */
//   const openCreateSchedule = useCallback(() => {
//     console.log('Opening create schedule modal');
//     setSelectedSchedule(null);
//     resetFormData();
//     setModalVisible(true);
//   }, [resetFormData]);

//   const closeCreateSchedule = useCallback(() => {
//     console.log('Closing create schedule modal');
//     setModalVisible(false);
//   }, []);

//   /** ---------------- EDIT ---------------- */
//   const openEditSchedule = useCallback((schedule) => {
//     setSelectedSchedule(schedule);
//     if (schedule?.schedule) {
//       setFormData({
//         ...initialFormData,
//         ...schedule.schedule,
//       });
//     }
//     setModalEVisible(true);
//   }, [initialFormData]);

//   const closeEditSchedule = useCallback(() => {
//     setModalEVisible(false);
//     setTimeout(() => {
//       setSelectedSchedule(null);
//       resetFormData();
//     }, 100);
//   }, [resetFormData]);

//   return (
//     <BookingContext.Provider
//       value={{
//         /** data */
//         formData,
//         setFormData,
//         extras,
//         setExtras,
//         isSelectedList,
//         toggleSelected,

//         /** modal state */
//         modalVisible,
//         modalEVisible,
//         selectedSchedule,
//         scheduleStep,
//         selectedChecklistId,
//         resumeAfterChecklist,

//         /** modal actions */
//         openCreateSchedule,
//         closeCreateSchedule,
//         openEditSchedule,
//         closeEditSchedule,

//         /** additional functions */
//         setScheduleStep,
//         setSelectedChecklistId,
//         setResumeAfterChecklist,
//         resetFormData,
//       }}
//     >
//       {children}
//     </BookingContext.Provider>
//   );
// };








import React, { createContext, useContext, useState } from 'react';
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
    regular_cleaning: regular_cleaning,
    totalPrice: '0',
    total_cleaning_fee: 0,
    // Add checklist related fields
    aptId: '',
    checklistId: null,
    checklistName: null,
    checklistTasks: [],
    checklists: [],
    default_checklist: null,
    regular_cleaning_fee: 0,
    regular_cleaning_time: 0,
    total_cleaning_time: 0
  };

  const [formData, setFormData] = useState(initialFormData);
  const [extras, setExtras] = useState([]); // ✅ NEW
  const [isSelectedList, setIsSelectedList] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEVisible, setModalEVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const toggleSelected = (value) => {
    setIsSelectedList((prevSelected) => ({
      ...prevSelected,
      [value]: !prevSelected[value],
    }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setExtras([]); // Reset extras when resetting form data
  };

  const handleEdit = (visible, schedule = null) => {
    setModalEVisible(visible);
    setSelectedSchedule(schedule);
    setFormData(schedule?.schedule || initialFormData);

    if (!visible) {
      resetFormData();
    }
  };

  const handleCreateSchedule = (value) => {
    setModalVisible(value);
  };

  const handleEditSchedule = (value) => {
    setModalEVisible(value);
  };

  return (
    <BookingContext.Provider
      value={{
        formData,
        setFormData,
        extras,          // ✅ EXPOSE extras
        setExtras,       // ✅ EXPOSE setExtras
        isSelectedList,
        handleEdit,
        modalVisible,
        modalEVisible,
        setModalVisible,
        setModalEVisible,
        selectedSchedule,
        openModal,
        handleCreateSchedule,
        handleEditSchedule,
        resetFormData,
        toggleSelected
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};