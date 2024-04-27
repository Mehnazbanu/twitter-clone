import React, { useState, useEffect, useRef } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@material-ui/core";
import { db, collection, addDoc, getDoc, doc, docRef, setDoc} from "./firebase";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import  {Timestamp} from "firebase/firestore"; // Import ref and uploadBytes from firebase/storage
import ImageIcon from "@material-ui/icons/Image";
import LinkIcon from "@material-ui/icons/Link";

function TweetBox() {
  const [tweetMessage, setTweetMessage] = useState("");
  const [tweetImage, setTweetImage] = useState("");
  const [tweetImageUrl, setTweetImageUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  

  const tweetInputRef = useRef(null);

  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userId = currentUser.uid;
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDisplayName(userData.displayName);
            setUsername(userData.username);
            setProfilePhoto(userData.profilePhoto); // Set profile photo
          }
        } else {
          console.log("No user is currently authenticated.");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();

    if (tweetInputRef.current) {
      tweetInputRef.current.focus();
    }
  }, []);

  const handleImageInputChange = (e) => {
    setTweetImage(e.target.files[0]);
  };

  const handleUrlInputChange = (e) => {
    setTweetImageUrl(e.target.value);
  };

  const sendTweet = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "";

      if (tweetImage) {
        const imageRef = ref(storage, `images/${tweetImage.name}`);
        await uploadBytes(imageRef, tweetImage);
        imageUrl = await getDownloadURL(imageRef);
      } else if (tweetImageUrl) {
        imageUrl = tweetImageUrl;
      }
      const timestamp = Timestamp.now();
      const docRef = await addDoc(collection(db, "posts"), {
        postId: "",
        displayName: displayName,
        username: username,
        verified: true,
        text: tweetMessage,
        image: imageUrl,
        likes:0,
        avatar: profilePhoto, // Set avatar to profile photo
        timestamp: timestamp.toDate().toString()
      });
      const postId = docRef.id;
      await setDoc(doc(collection(db, "posts"), docRef.id), { postId: docRef.id }, { merge: true });

      setTweetMessage("");
      setTweetImage("");
      setTweetImageUrl("");
      return postId;
      
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="tweetBox">
      <form>
        <div className="tweetBox__input">
          <Avatar src={profilePhoto} /> {/* Set avatar source to profile photo */}
          <input
            ref={tweetInputRef}
            onChange={(e) => setTweetMessage(e.target.value)}
            value={tweetMessage}
            placeholder="What's happening?"
            type="text"
          />
        </div>
        <div className="tweetBox__input">
        <label htmlFor="imageInput">
        <ImageIcon className="tweetBox__imageIcon" />
          </label>
          <input
            id="imageInput"
            onChange={handleImageInputChange}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
          />
          <LinkIcon className="tweetBox__linkIcon" />
          <input
            onChange={handleUrlInputChange}
            className="tweetBox__imageInput"
            placeholder="Enter image URL"
            type="text"
          />
        </div>
        <Button
          onClick={sendTweet}
          type="submit"
          className="tweetBox__tweetButton"
        >
          Tweet
        </Button>
      </form>
    </div>
  );
}

export default TweetBox;