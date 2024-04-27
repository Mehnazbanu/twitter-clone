import React, { useState, useEffect } from "react";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, getDoc, doc } from "./firebase";
import "./ProfileMenu.css";

function ProfileMenu({ displayName }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfilePhoto(userData.profilePhoto);
          } else {
            console.log("User document does not exist for user ID:", userId);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchProfilePhoto();
  }, [userId]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="profile-menu">
      <IconButton
        aria-label="account of current user"
        aria-controls="profile-menu"
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
        className="profile-menu__button"
      >
        <img src={profilePhoto} alt="profile" className="profile-menu__icon" />
        <span className="profile-menu__displayName">{displayName}</span>
        <span className="profile-menu__dots">•</span>
        <span className="profile-menu__dots">•</span>
        <span className="profile-menu__dots">•</span>
      </IconButton>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className={`profile-menu__dropdown ${
          Boolean(anchorEl) && "profile-menu__dropdown show"
        }`}
      >
        <MenuItem
          onClick={handleLogout}
          className="profile-menu__menuItem"
        >
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}

export default ProfileMenu;