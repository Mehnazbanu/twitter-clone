import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { db, doc} from "./firebase";
import { getAuth } from "firebase/auth";
import Avatar from "@material-ui/core/Avatar";
import "./NotificationsPage.css";
import Sidebar from "./Sidebar";
import Widgets from "./Widgets";
import ProfileMenu from "./ProfileMenu";

function NotificationsPage() {
  const auth = getAuth();
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get the current user's uid
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userId = currentUser.uid;
          setUserId(userId);
          // Fetch notifications for the current user
          const notificationsQuery = query(
            collection(db, "notifications"),
            where("recipientId", "==", userId)
          );
          const querySnapshot = await getDocs(notificationsQuery);
          const notificationsData = [];

          // Fetch sender's profile photo and add it to the notification data
          for (const docSnap of querySnapshot.docs) {
            const notificationData = docSnap.data();
            const senderDoc = await getDoc(doc(db, "users", notificationData.senderId));
            if (senderDoc.exists()) {
              const senderData = senderDoc.data();
              notificationData.senderAvatar = senderData.profilePhoto;
            }
            notificationsData.push({ id: doc.id, ...notificationData });
          }
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [auth]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="searchmain-layout">
      <div className="sidebar-container sidebar">
        <Sidebar />
      </div>
      <div className="notifications-container">
        <h1 className="notifications-title">Notifications</h1>
        <ul className="notifications-list">
          {notifications.map((notification) => (
            <li key={notification.id} className="notification-item">
              <div className="notification-avatar">
                <Avatar src={notification.senderAvatar} alt="Avatar" />
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <p className="notification-timestamp">{formatDate(notification.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="widgets-container widgets">
        <Widgets />
      </div>
    </div>
  );
}

export default NotificationsPage;