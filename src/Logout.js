import React from "react";
import { getAuth, signOut } from "firebase/auth";
import "./Logout.css"; // Import the CSS file

function Logout() {
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Redirect to login page after successful logout
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="logout-button-container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;