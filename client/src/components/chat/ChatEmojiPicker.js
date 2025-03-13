// components/chat/ChatEmojiPicker.js
import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile } from "@fortawesome/free-solid-svg-icons";

const ChatEmojiPicker = ({ setMessage }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSelectEmoji = (emoji) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false); // Cerrar panel tras insertar
  };

  return (
    <div className="emoji-picker-container" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="icon-button"
      >
        <FontAwesomeIcon icon={faSmile} />
      </button>
      {showEmojiPicker && (
        <div style={{ position: "absolute", bottom: "50px", zIndex: 10 }}>
          <Picker data={data} onEmojiSelect={handleSelectEmoji} />
        </div>
      )}
    </div>
  );
};

export default ChatEmojiPicker;
