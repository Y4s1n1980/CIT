import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "peerjs";
import { db } from "../../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faPhoneSlash, faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";


const ChatVideoCall = ({ userId, contactId }) => {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState("");
  const [myStream, setMyStream] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // 🔹 Guardar el Peer ID en Firestore
  const savePeerIdToFirestore = useCallback(async (id) => {
    if (!userId) return;
    await setDoc(doc(db, "videoCalls", userId), { peerId: id });
  }, [userId]);

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setPeerId(id);
      savePeerIdToFirestore(id);
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          setMyStream(mediaStream);
          myVideoRef.current.srcObject = mediaStream;
          call.answer(mediaStream);
          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
          setCallActive(true);
        })
        .catch((error) => console.error("Error al acceder a la cámara/micrófono:", error));
    });

    return () => newPeer.destroy();
  }, [savePeerIdToFirestore]);

  // 🔹 Obtener el Peer ID remoto de Firestore
  const getRemotePeerId = async () => {
    const contactRef = doc(db, "videoCalls", contactId);
    const contactSnap = await getDoc(contactRef);
    return contactSnap.exists() ? contactSnap.data().peerId : null;
  };

  // 🔹 Iniciar llamada
  const startCall = async () => {
    const remotePeerId = await getRemotePeerId();
    if (!remotePeerId) {
      alert("No se pudo encontrar la ID de la otra persona.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setMyStream(mediaStream);
        myVideoRef.current.srcObject = mediaStream;
        const call = peer.call(remotePeerId, mediaStream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
        setCallActive(true);
      })
      .catch((error) => console.error("Error al acceder a la cámara/micrófono:", error));
  };

  // 🔹 Alternar micrófono
  const toggleMic = () => {
    if (myStream) {
      myStream.getAudioTracks()[0].enabled = !micEnabled;
      setMicEnabled(!micEnabled);
    }
  };

  // 🔹 Alternar video
  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks()[0].enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  // 🔹 Terminar llamada
  const endCall = () => {
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    setMyStream(null);
    setCallActive(false);
  };

  return (
    <div className="chatPrivado-video-call">
      <p>Tu ID de llamada: <strong>{peerId}</strong></p>
      
      {!callActive && (
        <button className="chatPrivado-start-call-btn" onClick={startCall}>
          <FontAwesomeIcon icon={faVideo} /> Iniciar llamada
        </button>
      )}

      {callActive && (
        <div className="chatPrivado-video-container">
          <video ref={myVideoRef} autoPlay playsInline muted></video>
          <video ref={remoteVideoRef} autoPlay playsInline></video>
          <div className="chatPrivado-controls">
            <button onClick={toggleMic} className="chatPrivado-toggle-mic">
              <FontAwesomeIcon icon={micEnabled ? faMicrophone : faMicrophoneSlash} />
            </button>
            <button onClick={toggleVideo}  className="chatPrivado-toggle-video">
              <FontAwesomeIcon icon={faVideo} />
            </button>
            <button onClick={endCall} className="chatPrivado-end-call-btn">
              <FontAwesomeIcon icon={faPhoneSlash} /> Colgar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatVideoCall;
