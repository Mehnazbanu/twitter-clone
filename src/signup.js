import React, { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged} from "firebase/auth";
import { Navigate, Link } from "react-router-dom"; // Import Link from react-router-dom
import "./signup.css";
import { getFirestore, doc, setDoc, Timestamp, query, where, collection, getDocs} from "firebase/firestore";
import twitterLogo from "./college logo.png";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignUp = async () => {
    try {
      // Check if username is already taken
      const usernameQuery = query(collection(db, "users"), where("username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        throw new Error("Username is already taken. Please choose a different username.");
      }
  
      // Rest of the sign-up process remains the same
      if (!email.trim().endsWith("@cambridge.edu.in")) {
        throw new Error("Only Cambridge University email addresses are allowed.");
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      // Store user data in Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const timestamp = Timestamp.now();
      const userData = {
        displayName,
        email,
        username,
        timestamp: timestamp.toDate(),
      };

      if (profilePhoto) {
        const storageRef = ref(storage, `profileImages/${userCredential.user.uid}`);
        await uploadBytes(storageRef, profilePhoto);
        const downloadURL = await getDownloadURL(storageRef);
        userData.profilePhoto = downloadURL;
        await updateProfile(userCredential.user, { photoURL: downloadURL });
      }

      await setDoc(userDocRef, userData);
      setSuccessMessage("User signed up successfully!");
      
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("You are already signed up. Please login.");
        setTimeout(() => {
          setRedirectToLogin(true);
        }, 1500);
      } else {
        setError(error.message);
      }
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignUp();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
  };

  if (user) {
    return <Navigate to="/Home" />;
  }

  if (redirectToLogin) {
    return <Navigate to={{ pathname: "/login", state: { message: "You are already signed up. Please login." } }} />;
  }

  if (successMessage) {
    return <Navigate to="/Home" />;
  }

  return (
    <div className="container">
      <img src={twitterLogo} alt="Twitter Logo" className="twitter-logo" /> {/* Add Twitter logo */}
      <form className="sign-up-form" onSubmit={handleSignUp}>
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="button" onClick={handleSubmit} disabled={loading}>Sign Up</button>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        {/* Link to login page */}
        <p className="login-link">Already have an account? <Link to="/login">Login here</Link>.</p>
      </form>
    </div>
  );
}

export default SignUp;
