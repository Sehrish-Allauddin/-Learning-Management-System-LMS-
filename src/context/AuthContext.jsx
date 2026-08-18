import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("LMS_user");
    const storedToken = localStorage.getItem("LMS_token");
    const storedPic = localStorage.getItem("LMS_profile_pic");
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    if (storedPic) {
      setProfilePic(storedPic);
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("LMS_user", JSON.stringify(userData));
    localStorage.setItem("LMS_token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfilePic(null);
    localStorage.removeItem("LMS_user");
    localStorage.removeItem("LMS_token");
    localStorage.removeItem("LMS_profile_pic");
    navigate("/");
  };

  const updateProfilePic = (picDataUrl) => {
    setProfilePic(picDataUrl);
    localStorage.setItem("LMS_profile_pic", picDataUrl);
  };

  return (
    <AuthContext.Provider value={{ user, token, profilePic, updateProfilePic, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
