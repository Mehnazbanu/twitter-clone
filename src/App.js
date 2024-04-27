import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./Home"
import SignUp from "./signup";
import Login from "./login";
import LogOut from "./Logout"
import PostDetails from "./PostDetails";
import Message from "./Message";
import Profile from "./Profile";
import SearchProfile from "./SearchProfile";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Notifications from "./NotificationsPage";
import "./App.css";

const auth = getAuth();

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  if (initializing) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={user ? <Navigate to="/Home" /> : <Login />} />
          <Route
            path="/signup"
            element={user ? <Navigate to="/login" /> : <SignUp />}
          />
          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/signup" />}
          />
        <Route path="/logout" element={<LogOut />} ></Route>
        <Route path="/post/:postId" element={<PostDetails />} />
        <Route path="/Message" element={<Message />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/searchprofile/:username" element={<SearchProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;