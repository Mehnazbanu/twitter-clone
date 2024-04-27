import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Navigate, Link } from "react-router-dom"; // Import Navigate and Link for redirection and navigation
import "./login.css";
import twitterLogo from "./college logo.png";
import { Container } from "@material-ui/core";

const auth = getAuth();

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Define error state
  const [user, setUser] = useState(null); // Define user state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user state when authentication state changes
    });
    return () => unsubscribe(); // Unsubscribe from onAuthStateChanged listener
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Check if email ends with "@cambridge.edu.in"
      if (!email.endsWith("@cambridge.edu.in")) {
        throw new Error("Only Cambridge University email addresses are allowed.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      // User signed in successfully
      console.log("User signed in successfully!");
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        setError("User not found. Please check your email and password.");
      } else {
        setError(error.message); // Set error message for other errors
      }
    }
  };

  if (user) {
    return <Navigate to="/Home" />; // Redirect to feed if user is already logged in
  }

  // If user is not present, display error message and offer signup link
  return (
    <div className="container">
      <img src={twitterLogo} alt="Twitter Logo" className="twitter-logo" /> {/* Add Twitter logo */}
    <div className="login-container"> {/* Apply login container class */}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>} {/* Display error message */}
      <p>If you don't have an account, <Link to="/signup">Sign up here</Link>.</p> {/* Offer signup link */}
    </div>
    </div>
  );
}

export default Login;