// components/chat/ChatRecorder.js
import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faTimes } from "@fortawesome/free-solid-svg-icons";

const ChatRecorder = ({ setAudioBlob }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = () => {
    if (isRecording) {
      // Detener grabación
      mediaRecorderRef.current.stop();
    } else {
      // Iniciar grabación
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
            setAudioBlob(audioBlob);
            setHasAudio(true);
          };

          mediaRecorder.start();
          setIsRecording(true);
          setHasAudio(false);
        })
        .catch((error) => {
          console.error("Error accediendo al micrófono:", error);
        });
    }
  };

  const handleCancelAudio = () => {
    // Descartar el audio grabado
    setAudioBlob(null);
    setHasAudio(false);
  };

  return (
    <div className="chatrecorder-container">
      <button type="button" onClick={toggleRecording} className="icon-button">
        <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
      </button>
      {hasAudio && (
        <button type="button" onClick={handleCancelAudio} className="icon-button cancel-button">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

export default ChatRecorder;
