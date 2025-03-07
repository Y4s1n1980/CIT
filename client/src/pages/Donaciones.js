import React, { useState } from 'react';
import './Donaciones.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import axios from 'axios';
import { sendDonationConfirmationToDonor, sendNotificationToAdmin } from "../services/emailService";


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  // Estado para manejar todos los campos adicionales de la donación
  const [donationDetails, setDonationDetails] = useState({
    donante_nombre: '',
    donante_email: '',
    monto: 0,
    metodo_pago: 'Tarjeta de Crédito',
    comentarios: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setDonationDetails({
      ...donationDetails,
      [name]: value,
    });
  };


const handleSubmit = async (event) => {
  event.preventDefault();
  setPaymentProcessing(true);
  setError(null);

  if (!stripe || !elements) {
    setError("Stripe no está listo");
    setPaymentProcessing(false);
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/create-payment-intent", {
      amount: Math.round(donationDetails.monto * 100), // Convertir a centavos
      currency: "usd",
    });

    const { clientSecret } = response.data;

    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: donationDetails.donante_nombre,
          email: donationDetails.donante_email,
        },
      },
    });

    if (error) {
      setError(error.message);
      setPaymentProcessing(false);
      return;
    }

    setPaymentSucceeded(true);

    await addDoc(collection(db, "donations"), {
      ...donationDetails,
      estado: "completada",
      referencia_transaccion: paymentIntent.id,
      fecha_donacion: Timestamp.now(),
    });

    // Enviar correos electrónicos
    await sendDonationConfirmationToDonor(donationDetails);
    await sendNotificationToAdmin(donationDetails);

    // Limpiar el formulario
    setDonationDetails({
      donante_nombre: "",
      donante_email: "",
      monto: 0,
      metodo_pago: "Tarjeta de Crédito",
      comentarios: "",
    });

    elements.getElement(CardElement).clear();
  } catch (err) {
    setError("Error al procesar el pago. Por favor, intenta nuevamente.");
    console.error("Error al procesar la donación:", err);
  } finally {
    setPaymentProcessing(false);
  }
};


  return (
    <motion.form
      onSubmit={handleSubmit}
      className="donation-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <label>Correo Electrónico</label>
      <input
        type="email"
        name="donante_email"
        placeholder="Correo electrónico"
        value={donationDetails.donante_email}
        onChange={handleInputChange}
        required
        disabled={paymentProcessing}
      />

      <label>Nombre del titular de la tarjeta</label>
      <input
        type="text"
        name="donante_nombre"
        placeholder="Nombre completo"
        value={donationDetails.donante_nombre}
        onChange={handleInputChange}
        required
        disabled={paymentProcessing}
      />

      <label>Monto de la donación</label>
      <input
        type="number"
        name="monto"
        placeholder="Monto (en USD)"
        value={donationDetails.monto}
        onChange={handleInputChange}
        required
        disabled={paymentProcessing}
      />

      <label>Comentarios</label>
      <textarea
        name="comentarios"
        placeholder="Comentarios sobre la donación"
        value={donationDetails.comentarios}
        onChange={handleInputChange}
        disabled={paymentProcessing}
      />

      <label>Número de tarjeta</label>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#333',
              '::placeholder': {
                color: '#999',
              },
            },
            invalid: {
              color: '#fa755a',
            },
          },
        }}
      />

      <motion.button
        disabled={paymentProcessing}
        className="donate-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {paymentProcessing ? 'Procesando...' : 'Donar ahora'}
      </motion.button>
      {error && <div className="donation-error">{error}</div>}
      {paymentSucceeded && <div className="donation-message">¡Gracias por tu donación!</div>}
    </motion.form>
  );
};

const Donation = () => {
  return (
    <div>
      <motion.section
        className="donation-info-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="donation-info-container">
          <div className="donation-text">
            <h2>Apóyanos, Necesitamos Tu Ayuda.</h2>
            <p>
              Tus donaciones nos ayudarán a brindar recursos esenciales, mejorar instalaciones y continuar con nuestro proyecto.
            </p>
            <motion.button
              className="donate-button"
              onClick={() =>
                document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Donar ahora
            </motion.button>
          </div>
        </div>
      </motion.section>

      <section id="form-section" className="form-section">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </section>
    </div>
  );
};

export default Donation;
