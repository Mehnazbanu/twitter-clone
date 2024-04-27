import React, { forwardRef, useState, useEffect } from "react";
import {Link} from "react-router-dom";
import "./Post.css";
import { Avatar } from "@material-ui/core";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import RepeatIcon from "@material-ui/icons/Repeat";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import PublishIcon from "@material-ui/icons/Publish";
import CommentPopup from "./CommentPopup";
import { db, collection, doc, getDoc, updateDoc, setDoc, deleteDoc} from "./firebase";

const Post = forwardRef(
  ({ postId, displayName, username, verified, text, image, avatar, timestamp, likes }, ref) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showCommentPopup, setShowCommentPopup] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(""); // State to hold profile photo

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          // Ensure postId is defined before fetching user data
          if (postId) {
            const userDoc = await getDoc(doc(db, "posts", postId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setProfilePhoto(userData.avatar); // Set profile photo
            } else {
              console.log("User document does not exist");
            }
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      };
    
      fetchUserData();
    }, [postId]);

    useEffect(() => {
      const fetchLikeCount = async () => {
        try {
          const postDoc = await getDoc(doc(db, "posts", postId));
          if (postDoc.exists()) {
            const postData = postDoc.data();
            const currentLikeCount = postData.likes || 0;
            setLikeCount(currentLikeCount);
          } else {
            console.log("Post document does not exist");
          }
        } catch (error) {
          console.error("Error fetching like count:", error);
        }
      };

      if (postId) {
        fetchLikeCount();
      } else {
        console.log("postId is not provided 1");
      }
    }, [postId]);

    const handleLike = async () => {
      try {
        if (!postId) {
          console.log("postId is not provided");
          return;
        }

        const likedPostRef = doc(db, "likes", `${username}_${postId}`);
        const likedPostDoc = await getDoc(likedPostRef);

        if (likedPostDoc.exists()) {
          await deleteDoc(likedPostRef);
          const newLikeCount = Math.max(0, likeCount - 1);
          setLiked(false);
          setLikeCount(newLikeCount);

          const postRef = doc(db, "posts", postId);
          await updateDoc(postRef, { likes: newLikeCount });
        } else {
          await setDoc(likedPostRef, { liked: true });
          const newLikeCount = likeCount + 1;
          setLiked(true);
          setLikeCount(newLikeCount);

          const postRef = doc(db, "posts", postId);
          await updateDoc(postRef, { likes: newLikeCount });
        }
      } catch (error) {
        console.error("Error handling like:", error);
      }
    };

    const handleCommentClick = () => {
      setShowCommentPopup(true);
    };

    const closeCommentPopup = () => {
      setShowCommentPopup(false);
    };

    return (
      <div className="post" ref={ref}>
        <div className="post__avatar">
          <Avatar src={profilePhoto} />
        </div>
        <div className="post__body">
          <div className="post__header">
            <div className="post__headerText">
              <h3>
                {displayName}{" "}
                <span className="post__headerSpecial">
                  {verified && <VerifiedUserIcon className="post__badge" />} @
                  {username}
                </span>
              </h3>
            </div>
            <div className="post__headerDescription">
              <Link to={`/post/${postId}`} className="post__link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <p>{text}</p>
              </Link>
            </div>
          </div>
          {image && <img src={image} alt="" className="post__image" />}
          <div className="post__footer">
            <button onClick={handleLike} className="post__button">
              {liked ? (
                <FavoriteIcon className="post__icon post__likedIcon" />
              ) : (
                <FavoriteBorderIcon className="post__icon" />
              )}
              <span className="post__count">{likeCount}</span>
            </button>
            <button onClick={handleCommentClick} className="post__button">
              <ChatBubbleOutlineIcon fontSize="small" className="post__icon" />
            </button>
            <RepeatIcon fontSize="small" className="post__icon" />
            <PublishIcon fontSize="small" className="post__icon" />
          </div>
        </div>
        {showCommentPopup && <CommentPopup postId={postId} onClose={closeCommentPopup} />}
      </div>
    );
  }
);

export default Post;