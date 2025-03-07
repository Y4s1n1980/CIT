import React, { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar email
    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Por favor, introduce un email válido.");
      return;
    }

    try {
      await addDoc(collection(db, "newsletterSubscribers"), {
        email,
        subscribedAt: Timestamp.now(),
      });

      setMessage("¡Gracias por suscribirte!");
      setEmail(""); // Limpiar input después de enviar
    } catch (error) {
      console.error("Error al suscribirse:", error);
      setMessage("Hubo un error, intenta de nuevo.");
    }
  };

  return (
    <div className="newsletter-section">
      <h4>Newsletter</h4>
      <p>Suscríbete para recibir actualizaciones.</p>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Suscribirse</button>
      </form>
      {message && <p className="newsletter-message">{message}</p>}
    </div>
  );
};

export default Newsletter;
