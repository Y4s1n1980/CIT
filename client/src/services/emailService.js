import emailjs from "emailjs-com";

const sendEmail = async ({ serviceId, templateId, userId, templateParams }) => {
  console.log("Enviando correo con los siguientes datos:");
  console.log("Service ID:", serviceId);
  console.log("Template ID:", templateId);
  console.log("User ID:", userId);
  console.log("Template Params:", templateParams);

  if (!serviceId || !templateId || !userId) {
    console.warn("⚠️ EmailJS - Falta una de las variables requeridas para enviar correo.");
    return false;
  }

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, userId);
    console.log("Correo enviado con éxito:", response.text);
    return true;
  } catch (error) {
    console.error("Error al enviar correo:", error);
    console.error("Detalles:", error.response || error.message || error);
    return false;
  }
};

export const sendDonationConfirmationToDonor = async (donationDetails) => {
  const templateParams = {
    to_name: donationDetails.donante_nombre,
    to_email: donationDetails.donante_email,
    amount: donationDetails.monto,
  };

  return await sendEmail({
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
    templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID_DONOR,
    userId: process.env.REACT_APP_EMAILJS_USER_ID,
    templateParams,
  });
};

export const sendNotificationToAdmin = async (donationDetails) => {
  const templateParams = {
    admin_email: process.env.REACT_APP_ADMIN_NOTIFICATION_EMAIL,
    donante_nombre: donationDetails.donante_nombre,
    donante_email: donationDetails.donante_email,
    amount: donationDetails.monto,
    comentarios: donationDetails.comentarios || "Sin comentarios",
  };

  return await sendEmail({
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
    templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID_ADMIN,
    userId: process.env.REACT_APP_EMAILJS_USER_ID,
    templateParams,
  });
};

// Función desactivada temporalmente
export const sendVerificationEmail = async () => {
  console.warn("⏸️ sendVerificationEmail está desactivado (no se usa actualmente)");
  return false;
};
