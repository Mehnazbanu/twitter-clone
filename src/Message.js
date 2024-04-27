import React, { useState, useEffect } from "react";
import { db, serverTimestamp, updateDoc } from "./firebase";
import { where, query, collection, getDocs, addDoc, doc } from "firebase/firestore";

function Message() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [userNotFound, setUserNotFound] = useState(false);

  useEffect(() => {
    // Fetch existing chats from the database
    const fetchChats = async () => {
      try {
        const chatRef = collection(db, "chats"); // Reference to the 'chats' collection
        const snapshot = await getDocs(chatRef);
        const chatData = snapshot.docs.map((doc) => doc.data());
        setChats(chatData);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  const startChat = async (selectedUser) => {
    try {
      console.log("Selected user:", selectedUser);
  
      // Check if selectedUser is defined and has a valid userId
      if (!selectedUser || !("userId" in selectedUser) || !selectedUser.userId) {
        console.error("Error starting chat: Selected user or user ID is undefined");
        return;
      }
  
      console.log("Chats:", chats);
  
      // Check if a chat already exists with the selected user
      const existingChat = chats.find((chat) => chat.users && chat.users.includes(selectedUser.userId));
      console.log("Existing chat:", existingChat);
  
      if (existingChat) {
        // Navigate to existing chat room
        console.log("Navigate to existing chat room:", existingChat.id);
        window.location.href = `/chat/${existingChat.id}`;
      } else {
        console.log("No existing chat found. Proceed to create new chat.");
  
        // Create a new chat room
        const newChatRef = await addDoc(collection(db, "chats"), {
          users: [selectedUser.userId],
          createdAt: serverTimestamp(),
        });
  
        // Use the document ID as the room ID
        const newChatId = newChatRef.id;
        console.log("Created new chat room:", newChatId);
  
        // Navigate to the new chat room
        window.location.href = `/chat/${newChatId}`;
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };
  

  const handleSearch = async () => {
    // Perform search query in the users collection
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", searchQuery));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => doc.data());
      setSearchResults(results);
      setUserNotFound(results.length === 0);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by username"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Search Results */}
      <div>
        <h2>Search Results</h2>
        {userNotFound && <p>User not found</p>}
        {!userNotFound && (
          <ul>
            {searchResults.map((user) => (
              <li key={user.userId}>
                {user.displayName}
                <button onClick={() => startChat(user)}>Start Chat</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Existing Chats */}
      <div>
        <h2>Existing Chats</h2>
        <ul>
          {chats.map((chat) => (
            <li key={chat.roomId}>{chat.displayName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Message;