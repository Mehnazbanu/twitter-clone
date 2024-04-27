import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import "./PostDetails.css";
import Post from "./Post";
import Comment from "./Comment";

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        // Fetch post
        const postRef = doc(db, "posts", postId); // Use doc function to reference the post document
        const postSnapshot = await getDoc(postRef);
        const postData = postSnapshot.data();
  
        // Fetch comments
        const commentsRef = collection(db, "posts", postId, "comments");
        const commentsSnapshot = await getDocs(commentsRef);
        const fetchedComments = commentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            text: doc.data().text,
            username: postData.username,
            displayName: postData.displayName, // Retrieve from post data
            verified: postData.verified, // Retrieve from post data
            avatar: postData.avatar, // Retrieve from post data
          }));
  
        setPost(postData);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching post and comments:", error);
      }
    };
  
    fetchPostAndComments();
  }, [postId]);


  return (
    <div className="postDetails">
      <div className="postContainer">
        {post && <Post {...post} />}
      </div>
      <div className="commentsContainer">
        <h3 className="commentsHeader">Comments</h3>
        {comments.map((comment) => (
          <Comment key={comment.id} {...comment} />
        ))}
      </div>
    </div>
  );
};

export default PostDetails;