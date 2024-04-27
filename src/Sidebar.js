import React, { useState, useEffect } from "react";
import { Link} from "react-router-dom";
import "./Sidebar.css";
import TwitterIcon from "@material-ui/icons/Twitter";
import SidebarOption from "./SidebarOption";
import HomeIcon from "@material-ui/icons/Home";
import SearchIcon from "@material-ui/icons/Search";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import ListAltIcon from "@material-ui/icons/ListAlt";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { Button } from "@material-ui/core";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

function Sidebar({displayName}) {
  const auth = getAuth();
  const [username, setUserData] = useState("");
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData.username);
          } else {
            console.log("User document does not exist for user ID:", userId);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userId]); // Fetch data whenever username changes

  return (
    <div className="sidebar">
      <TwitterIcon className="sidebar__twitterIcon" />

      <Link to={`/Home`} className="sidebar__link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <SidebarOption active Icon={HomeIcon} text="Home" />
      </Link>
      <SidebarOption Icon={SearchIcon} text="Explore" />
      <Link to={`/notifications`} className="sidebar__link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <SidebarOption Icon={NotificationsNoneIcon} text="Notifications" />
      </Link>
      {/* Wrap Messages sidebar option with Link */}
      <Link to="/Message" className="sidebar__link" style={{ textDecoration: 'none', color: 'inherit' }}>
        <SidebarOption Icon={MailOutlineIcon} text="Messages" />
      </Link>

      <SidebarOption Icon={BookmarkBorderIcon} text="Bookmarks" />
      <SidebarOption Icon={ListAltIcon} text="Lists" />
      
      {/* Render profile link only if userData exists */}
        <Link to={`/profile/${username}`} className="sidebar__link" style={{ textDecoration: 'none', color: 'inherit' }}>
          <SidebarOption Icon={PermIdentityIcon} text="Profile" />
        </Link>

      <SidebarOption Icon={MoreHorizIcon} text="More" />

      {/* Button -> Tweet */}
      <Button variant="outlined" className="sidebar__tweet" fullWidth>
        Tweet
      </Button>
    </div>
  );
}

export default Sidebar;
