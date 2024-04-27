import React, { useState, useEffect } from "react";
import "./Widgets.css";
import { Link } from "react-router-dom"; // Import Link component
import { TwitterTimelineEmbed, TwitterShareButton } from "react-twitter-embed";
import SearchIcon from "@material-ui/icons/Search";
import { db, collection, query, where, getDocs } from "./firebase"; // Import Firestore methods
import { Avatar } from "@material-ui/core";

function Widgets({ user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [userNotFound, setUserNotFound] = useState(false);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    // Fetch user options for dropdown when search query changes
    const fetchUserOptions = async () => {
      try {
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", ">=", searchQuery));
        const snapshot = await getDocs(q);
        const options = snapshot.docs.map((doc) => doc.data());
        setUserOptions(options);
      } catch (error) {
        console.error("Error fetching user options:", error);
      }
    };

    if (searchQuery) {
      fetchUserOptions();
    } else {
      setUserOptions([]); // Clear options when search query is empty
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", searchQuery));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => doc.data());
      setSearchResults(results);
      setUserNotFound(results.length === 0);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  return (
    <div className="widgets">
      <div className="widgets__input">
        <SearchIcon className="widgets__searchIcon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search User"
          list="userOptions"
        />
      </div>

       {/* Display dropdown options */}
      <div className="widgets__dropdown">
        {userOptions.map((user) => (
          <div key={user.username} className="widgets__dropdownItem">
            <Link to={`/searchprofile/${user.username}`} className="widgets__link">
              <Avatar src={user.profilePhoto} alt={user.username} className="img"/> {/* Display profile photo */}
              <div>
                <p className="displayName">{user.displayName}</p> {/* Display display name */}
                <p className="username">@{user.username}</p> {/* Display username */}
              </div>
            </Link>
              </div>
              ))}
            </div>

        <div className="widgets__widgetContainer">
        <h2>What's happening</h2>

        <TwitterShareButton
          url={""}
          options={{ text: "Twitter-clone", via: "" }}
        />
      </div>
      </div>
  );
}

export default Widgets;