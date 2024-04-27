import React, { useState, useEffect } from 'react'
import { db, getDoc, doc } from "./firebase"; // Import Firestore methods
import { getAuth } from "firebase/auth"; // Import Firebase Authentication method
import Feed from "./Feed";
import Sidebar from "./Sidebar";
import Widgets from "./Widgets";
import ProfileMenu from "./ProfileMenu";
//import "./ProfileMenu.css"
import "./Home.css";
import "./Feed.css"; // Import feed.css here
import "./Sidebar.css"; // Import sidebar.css here
import "./Widgets.css";
import "./Logout.css";


function Home() {
  const [displayName, setDisplayName] = useState("");

  // Define the fetchUserDataSomehow function
  async function fetchUserDataSomehow() {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userId = currentUser.uid;
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          return userDoc.data();
        }
      }
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserDataSomehow();
        setDisplayName(userData.displayName);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, []);
  
    return (
      <div className="main-layout">
        <div className="sidebar-container sidebar"> {/* Add sidebar class here */}
          <Sidebar />
          <ProfileMenu displayName={displayName} /> 
          </div>
        <div className="feed-container feed"> {/* Add feed class here */}
          <Feed />
        </div>
        <div className="widgets-container widgets"> {/* Add widgets class here */}
          <Widgets />
        </div>
      </div>
    );
  }

  export default Home;
