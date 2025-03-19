import React, { useState } from 'react';
import './FAQPrev.css';
import { motion, AnimatePresence } from 'framer-motion';

const FAQPrev = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "¿Qué puedo encontrar al registrarme?",
      answer: "Podrás acceder a noticias exclusivas, chats privados, contenido multimedia y eventos exclusivos."
    },
    {
      question: "¿Es gratuito registrarme?",
      answer: "Sí, el registro es completamente gratuito."
    },
    {
      question: "¿Cómo puedo hacer una donación?",
      answer: "Puedes realizar donaciones fácilmente desde la sección 'Donar' en nuestra web."
    }
  ];

  return (
    <section className="faq-prev-section">
      <h2 className="faq-prev-title">Preguntas Frecuentes</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div className="faq-item" key={index}>
            <motion.div
              className="faq-question"
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            >
              {faq.question}
            </motion.div>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="faq-prev-answer"
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        </div>
    </section>
  );
};

export default FAQPrev;
