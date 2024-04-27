import React, { useState, useEffect } from "react";
import TweetBox from "./TweetBox";
import Post from "./Post";
import "./Feed.css";
import { onSnapshot, orderBy, where, query, doc, setDoc, getDoc} from "firebase/firestore";
import { db, collection} from "./firebase"; // Import collection from firebase module

function Feed({userId}) {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    // Ensure userId is defined before querying liked posts
    if (userId) {
      const unsubscribe = onSnapshot(
        query(collection(db, "likes"), where("userId", "==", userId)),
        (snapshot) => {
          // Map entire document data instead of just document ID
          setLikedPosts(snapshot.docs.map((doc) => doc.data()));
        }
      );

      return () => unsubscribe();
    }
  }, [userId]);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), orderBy("timestamp", "desc"), (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }))
  );
    });
  
    return () => unsubscribe(); // Cleanup function to unsubscribe from snapshot listener
  }, []);


  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>

      <TweetBox/>
    
      {posts.map((post) => (
        <Post
          key={post.id}
          postId={post.postId}
          displayName={post.displayName}
          username={post.username}
          verified={post.verified}
          text={post.text}
          avatar={post.avatar}
          image={post.image}
          timestamp ={post.timestamp}
          likes= {post.likes}
        />
      ))}
    </div>
  );
}

export default Feed;
