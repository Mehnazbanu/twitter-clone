import React from "react";
import "./Comment.css"; // Import CSS for styling
import { Avatar } from "@material-ui/core";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser"

const Comment = ({ text, username, displayName, verified, avatar }) => {
  return (
    <div className="comment">
      <div className="comment__avatar">
        <Avatar src={avatar} alt={`${displayName}'s Avatar`} />
      </div>
      <div className="comment__user">
        <span className="comment__displayName">{displayName}</span>
        {verified && <VerifiedUserIcon className="comment__verifiedIcon" />}
        <span className="comment__username">{`@${username}`}</span>
      </div>
      <div className="comment__content">
        <p className="comment__text">{text}</p>
      </div>
    </div>
  );
};

export default Comment;