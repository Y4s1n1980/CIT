import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile } from "@fortawesome/free-solid-svg-icons";

const ChatEmojiPicker = ({ setMessage }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    return (
        <div className="emoji-picker-container">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="icon-button">
                <FontAwesomeIcon icon={faSmile} />
            </button>
            {showEmojiPicker && <Picker data={data} onEmojiSelect={(emoji) => setMessage(prev => prev + emoji.native)} />}
        </div>
    );
};

export default ChatEmojiPicker;
