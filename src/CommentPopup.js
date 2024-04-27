import React, { useState } from "react";
import "./CommentPopup.css"; // Style your comment popup as needed
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase"; // Import your Firestore instance

const CommentPopup = ({ postId, onClose }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add the comment to Firestore
      const commentsRef = collection(db, "posts", postId, "comments");
      await addDoc(commentsRef, {
        text: comment,
        timestamp: new Date(),
      });
      // Log success and close the popup
      console.log("Comment added successfully:", comment);
      onClose();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="commentPopup">
      <div className="commentPopup__content">
        <button className="commentPopup__closeButton" onClick={onClose}>X</button>
        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
            rows="4"
          >
          </textarea>
          <button className="commentPopup__commentButton" type="submit">Comment</button>
        </form>
      </div>
    </div>
  );
};

export default CommentPopup;