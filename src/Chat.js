// Chat.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";

function Chat() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const messagesRef = db.ref(`messages/${roomId}`);
    messagesRef.on("value", (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.values(messagesData);
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });

    // Return the cleanup function
    return () => messagesRef.off();
  }, [roomId]);
}