import React, { createContext, useState } from 'react';

export const MyUserContext = createContext();

export const MyUserProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <MyUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </MyUserContext.Provider>
  );
};
