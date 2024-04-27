import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDoc, getDocs, doc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import "./SearchProfile.css";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import PublishIcon from "@material-ui/icons/Publish";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import Avatar from "@material-ui/core/Avatar";
import Sidebar from "./Sidebar";
import Widgets from "./Widgets";
import ProfileMenu from "./ProfileMenu";

function SearchProfile() {
    const { username } = useParams();
    const [userData, setUserData] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

        if (username) {
            fetchUserData();
            fetchUserTweets();
        }
    }, [username]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="main-layout">
            <div className="sidebar-container sidebar">
            <Sidebar />
          <ProfileMenu displayName={userData.displayName} /> 
            </div>
            <div className="feed-container feed">
                <div className="profile">
                    <Avatar src={userData.profilePhoto} alt="Profile" className="profile__photo" />
                    <div className="profile__info">
                        <div key={userData.username}>
                            <h2>{userData.displayName}</h2>
                            <p>@ {userData.username}</p>
                            <button className="edit-profile-btn">Edit Profile</button>
                            <button className="follow-btn">Follow</button>
                        </div>
                    </div>
                    <div className="profile__tweets">
                        {tweets.map((tweet) => (
                            <div className="tweet" key={tweet.id}>
                                <Avatar src={tweet.avatar} alt="Avatar" className="post__avatar" />
                                <div className="post__body">
                                    <div className="post__headerText">
                                        <h3>
                                            {userData.displayName}{" "}
                                            <span className="post__headerSpecial">
                                                {userData.verified && <VerifiedUserIcon className="post__badge" />} @{username}
                                            </span>
                                        </h3>
                                    </div>
                                    <p>Tweet: {tweet.text}</p>
                                    {tweet.comments && tweet.comments.length >= 0 && (
                                        <div className="comments">
                                            <p>Comments: </p>
                                            {tweet.comments.map((comment) => (
                                                <div key={comment.id}>
                                                    <p>{comment.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="post__footer">
                                        <FavoriteIcon className="tweet__icon" />
                                        <span>{tweet.likes}</span>
                                        <ChatBubbleOutlineIcon className="tweet__icon" />
                                        <span>{tweet.comments.length}</span>
                                        <RepeatIcon className="tweet__icon" />
                                        <PublishIcon className="tweet__icon" />
                                    </div>
                                </div>
                            </div>
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
