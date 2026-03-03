// import React, { createContext, useState, useContext } from 'react';

// const CleanerSelectionContext = createContext();

// export const CleanerSelectionProvider = ({ children }) => {
//   const [selectedCleaners, setSelectedCleaners] = useState([]);

//   const addCleaner = cleaner => {
//     setSelectedCleaners(prev =>
//       prev.some(c => c._id === cleaner._id) ? prev : [...prev, cleaner]
//     );
//   };

//   return (
//     <CleanerSelectionContext.Provider value={{ selectedCleaners, addCleaner }}>
//       {children}
//     </CleanerSelectionContext.Provider>
//   );
// };

// export const useCleanerSelection = () => useContext(CleanerSelectionContext);



import React, { createContext, useState, useContext } from 'react';

const CleanerSelectionContext = createContext();

export const CleanerSelectionProvider = ({ children }) => {
  const [selectedCleaners, setSelectedCleaners] = useState([]);

  const addCleaner = (cleaner, assignedTo) => {
    if (!cleaner || !assignedTo) return;

    // find which group this cleaner belongs to
    const group = assignedTo.find(a => a.cleanerId === cleaner._id)?.group;

    setSelectedCleaners(prev => {
      // remove existing cleaner in this group
      const withoutGroup = prev.filter(
        sc => assignedTo.find(a => a.cleanerId === sc._id)?.group !== group
      );

      // add new cleaner
      return [...withoutGroup, cleaner];
    });
  };

  const removeCleaner = cleanerId => {
    setSelectedCleaners(prev => prev.filter(c => c._id !== cleanerId));
  };

  const replaceCleaner = (oldCleanerId, newCleaner, assignedTo) => {
    if (!newCleaner || !assignedTo) return;

    const group = assignedTo.find(a => a.cleanerId === newCleaner._id)?.group;

    setSelectedCleaners(prev => {
      const withoutGroup = prev.filter(
        sc => assignedTo.find(a => a.cleanerId === sc._id)?.group !== group
      );
      return [...withoutGroup, newCleaner];
    });
  };

  const resetCleaners = () => {
    setSelectedCleaners([]);
  };

  return (
    <CleanerSelectionContext.Provider
      value={{
        selectedCleaners,
        setSelectedCleaners, // for full control if needed
        addCleaner,
        removeCleaner,
        replaceCleaner,
        resetCleaners,
      }}
    >
      {children}
    </CleanerSelectionContext.Provider>
  );
};

export const useCleanerSelection = () => useContext(CleanerSelectionContext);