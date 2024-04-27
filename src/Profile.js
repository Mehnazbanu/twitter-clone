import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDoc, getDocs, doc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import {getAuth} from "firebase/auth"
import "./Profile.css";
import Avatar from "@material-ui/core/Avatar";
import Sidebar from "./Sidebar";
import Widgets from "./Widgets";
import ProfileMenu from "./ProfileMenu";
import Post from "./Post";
import { formatDate } from "./utils";

function Profile() {
  const auth = getAuth();
  const { username } = useParams();
  const [userData1, setUserData1] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users", userId);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserData(userData);
            setError(null); // Reset error state if user is found
          } else {
            setError("User not found");
          }
        } else {
          setError("No user signed in");
        }
      } catch (error) {
        setError("Error fetching user data: " + error.message);
      }
    }

    const fetchUserData1 = async () => {
      try {
          const usersQuery = query(collection(db, "users"), where("username", "==", username));
          const usersSnapshot = await getDocs(usersQuery);
          if (!usersSnapshot.empty) {
              const userDoc = usersSnapshot.docs[0];
              const userId = userDoc.id;
              const userRef = doc(db, "users", userId);
              const userSnapshot = await getDoc(userRef);
              if (userSnapshot.exists()) {
                  const userData1 = userSnapshot.data()
                  setUserData1(userData1);
              } else {
                  setError("User not found");
              }
          } else {
              setError("User not found");
          }
      } catch (error) {
          setError("Error fetching user data");
      }
  };

  const fetchUserTweets = async () => {
      try {
          const tweetsRef = collection(db, "posts");
          const querySnapshot = await getDocs(query(tweetsRef, where("username", "==", username)));
          const fetchedTweets = [];
          for (const doc of querySnapshot.docs) {
              const tweetData = doc.data();
              const tweetId = doc.id;
              const text = tweetData.text;
              const avatar = tweetData.avatar;
              const displayName = tweetData.displayName;
              const verified = tweetData.verified;
              const commentsRef = collection(db, "posts", tweetId, "comments");
              const commentsSnapshot = await getDocs(commentsRef);
              const comments = commentsSnapshot.docs.map((commentDoc) => ({
                  id: commentDoc.id,
                  ...commentDoc.data(),
              }));
              fetchedTweets.push({
                  id: tweetId,
                  ...tweetData,
                  avatar: avatar,
                  comments: comments,
              });
          }
          setTweets(fetchedTweets);
      } catch (error) {
          setError("Error fetching user tweets");
      } finally {
          setLoading(false);
      }
  };

    fetchUserData();
      if (username) {
            fetchUserData1();
            fetchUserTweets();
        }
    }, [username]);

  if (loading) {
    return <div></div>;
  }

  return (
    <div className="searchmain-layout">
        <div className="sidebar-container sidebar">
        <Sidebar />
      <ProfileMenu displayName={userData.displayName} /> 
        </div>
        <div className="feed-container feed">
            <div className="profile">
                <div className="profile__photo"> <Avatar src={userData.profilePhoto} alt="Profile" style={{ width: "150px", height: "150px" }}/> </div>
                <div className="profile__info">
                    <div key={userData.username}>
                        <h2>{userData.displayName}</h2>
                        <p>@ {userData.username}</p>
                        {userData.timestamp && (
                            <p>Joined {formatDate(userData.timestamp)}</p>
                        )}
                        <button className="edit-profile-btn">Edit Profile</button>
                    </div>
                </div>
              </div>
              <div className="tweetprofile">
                <div className="profile__tweets">
                    {tweets.map((tweet) => (
                <Post
                    key={tweet.id}
                    postId={tweet.id}
                    displayName={tweet.displayName}
                    username={tweet.username}
                    verified={tweet.verified}
                    text={tweet.text}
                    image={tweet.image}
                    avatar={tweet.avatar}
                    timestamp={tweet.timestamp}
                    likes={tweet.likes}
                />
            ))}
                </div>
            </div>
        </div>
        <div className="widgets-container widgets">
        <Widgets />
        </div>
    </div>
);
}

export default Profile;