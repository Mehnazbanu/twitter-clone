import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { addDoc, collection, getDoc, getDocs, doc, query, where, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import {getAuth} from "firebase/auth"
import { db } from "./firebase";
import "./SearchProfile.css";
import Avatar from "@material-ui/core/Avatar";
import Sidebar from "./Sidebar";
import Widgets from "./Widgets";
import ProfileMenu from "./ProfileMenu";
import Post from "./Post";
import { formatDate } from "./utils";

function SearchProfile() {
    const auth = getAuth();
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowingHover, setIsFollowingHover] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const usersQuery = query(collection(db, "users"), where("username", "==", username));
                const usersSnapshot = await getDocs(usersQuery);
                if (!usersSnapshot.empty) {
                    const userDoc = usersSnapshot.docs[0];
                    const userId = userDoc.id;
                    const userRef = doc(db, "users", userId);
                    const userSnapshot = await getDoc(userRef);
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        setUserData(userData);
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

        const fetchData = async () => {
            await fetchUserData();
            await fetchUserTweets();
            await checkIsFollowing(); // Check follow status when component mounts
        };
    
        fetchData();
    }, [username]);     

    const checkIsFollowing = async () => {
        try {
            // Fetch current user data
            const currentUser = auth.currentUser;
            const currentUserRef = doc(db, "users", currentUser.uid);
            const currentUserSnapshot = await getDoc(currentUserRef);
            if (currentUserSnapshot.exists()) {
                const currentUserData = currentUserSnapshot.data();
                // Check if following array includes the profile user's username
                setIsFollowing(currentUserData.following.includes(username));
            }
        } catch (error) {
            console.error("Error checking follow status: ", error);
        }
    };

    const handleFollow = async () => {
        try {
            // Update current user's following array to add the profile user's username
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                following: arrayUnion(username)
            });
    
            // Fetch the user being followed to get their userId
            const usersQuery = query(collection(db, "users"), where("username", "==", username));
            const usersSnapshot = await getDocs(usersQuery);
            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                const userData = userDoc.data();
                const followedUserId = userData.username; // userId of the user being followed
    
                // Add notification for the user being followed
                const followingNotificationData = {
                    recipientId: followedUserId,
                    message: `${auth.currentUser.displayName} started following you.`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    type: "follow",
                    senderId: auth.currentUser.uid, // Id of the user who followed
                };
                await addDoc(collection(db, "notifications"), followingNotificationData);
    
                // Add notification for the user who initiated the follow action
                const followerNotificationData = {
                    recipientId: auth.currentUser.uid,
                    message: `You started following ${userData.displayName}.`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    type: "follow",
                    senderId: followedUserId, // Id of the user being followed
                };
                await addDoc(collection(db, "notifications"), followerNotificationData);
    
                setIsFollowing(true); // Update state
            } else {
                console.error("User not found");
            }
        } catch (error) {
            console.error("Error following user: ", error);
        }
    };
    
    
    const handleUnfollow = async () => {
        try {
            // Update current user's following array to remove the profile user's username
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                following: arrayRemove(username)
            });
            setIsFollowing(false); // Update state
        } catch (error) {
            console.error("Error unfollowing user: ", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="searchmain-layout">
            <div className="sidebar-container sidebar">
            <Sidebar />
          <ProfileMenu displayName={userData.displayName} /> 
            </div>
            <div className="feed-container feed">
                <div className="profile">
                    <div className="profile__info">
                    <div className="profile__photo"><Avatar src={userData.profilePhoto} alt="Profile" style={{ width: "150px", height: "150px" }}/> </div>
                        <div key={userData.username}>
                            <h2>{userData.displayName}</h2>
                            <p>@ {userData.username}</p>
                            {userData.timestamp && (
                            <p>Joined {formatDate(userData.timestamp)}</p>
                            )}
                            <button className="edit-profile-btn">Edit Profile</button>
                            {isFollowing ? (
                            <button 
                                className="following-btn"
                                onClick={handleUnfollow}
                                onMouseEnter={() => setIsFollowingHover(true)}
                                onMouseLeave={() => setIsFollowingHover(false)}
                            >
                                {isFollowingHover ? "Unfollow" : "Following"}
                            </button>
                        ) : (
                            <button className="follow-btn" onClick={handleFollow}>Follow</button>
                        )}
                        </div>
                    </div>
                </div>
                <div className="tweetprofile">
                    <div className="searchprofile__tweets">
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

export default SearchProfile;
