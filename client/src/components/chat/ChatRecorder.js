import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop } from "@fortawesome/free-solid-svg-icons";

const ChatRecorder = ({ setAudioBlob }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);

    const toggleRecording = () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                const audioChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    setAudioBlob(audioBlob);
                };

                mediaRecorder.start();
                setIsRecording(true);
            }).catch(error => {
                console.error("Error accediendo al micrófono:", error);
            });
        }
    };

    return (
        <button type="button" onClick={toggleRecording} className="icon-button">
            <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
        </button>
    );
};

export default ChatRecorder;
