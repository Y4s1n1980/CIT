// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import './Home.css';

const texts = [
    { title: '"Bienvenidos a nuestra página"', description: 'Explora nuestros servicios y aprende más sobre nosotros.' },
    { title: '"Unidos en la fe"', description: 'Nuestra comunidad ofrece apoyo y guía espiritual.' },
    { title: '"Servicios y educación"', description: 'Ofrecemos educación y actividades para todas las edades.' },
    { title: '"Proyecto para el futuro"', description: 'Planeamos un gran centro islámico para nuestra comunidad.' }
];

const Home = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [testimonios, setTestimonios] = useState([]);

    

    const services = [
        {
            name: 'Chahada',
            title: '"Chahada Para Nuevos Musulmanes"',
            description: '"Apoyo Moral y En Conocimiento A Los Nuevos Musulmanes Celebrando La Ceremonia Islamica De La Chahada..."',
            image: '/gallery-image1.jpg'
        },
        {
            name: 'Estudios de árabe',
            title: '"Estudios de árabe"',
            description: '"Clase de la lengua arabe de todos los niveles, clases para no araboparlantes, clases individuales con tecnologia moderna ...."',
            image: '/clases-22.jpeg'
        },
        {
            name: 'Estudios Coránicos ',
            title: '"Estudios Coránicos"',
            description: '"Reuniones Para Lectur Conjunta De Versiculos De Diferentes Surat Del Curan Para Poder...."',
            image: '/gallery-image3.jpg'
        },
        {
            name: 'Renovacion Masijd',
            title: '"Renovaciones y Mantenimiento Masijd"',
            description: '"Constante Renovacion y Mantenimiento De Las Instalaciones Para Poder Ofrecer Mas y Mejores Espacios...."',
            image: '/mezquita-tordera-interior.png'
        },
        {
            name: 'Estudios Islámicos',
            title: '"Charlas y eventos"',
            description: '"Charlas Fin De Semana Despues De Salat Al-Maghrib Sobre Sunna, Hadit, Fiqh, Historias Sahaba ...."',
            image: '/clases-1.jpeg'
        },
        {
            name: 'Estudios Sunna',
            title: '"Derecho islámico"',
            description: '"Charlas Sobre Las Doctrinas y La Charia Islamica Simplificada Al Publico En General...."',
            image: '/hero5.jpeg'
        },
    ];


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, 7500); // Cambia cada 7.5 segundos para sincronizar con las imágenes

        return () => clearInterval(interval);
    }, []);
  


    useEffect(() => {
        const fetchTestimonios = async () => {
            const testimoniosSnapshot = await getDocs(collection(db, 'testimonios'));
            const testimoniosData = testimoniosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTestimonios(testimoniosData);
        };
        fetchTestimonios();
    }, []);

    const lastTestimonio = testimonios.length > 0 ? testimonios[testimonios.length - 1] : null;


    return (
        <>
        <div className="home">
            {/* Hero Section */}
            <section className="hero-home">
            <h1 className="hero-text-home">{texts[currentIndex].title}</h1>
            <p className="hero-text-home">{texts[currentIndex].description}</p>
            <a href="/nosotros" className="cta-button-home">Saber más</a>
        </section>

            {/* Servicios Destacados */}
            <section className="services-section">
            <h2>Nuestros Servicios</h2>
            <p>Ofrecemos una variedad de servicios para nuestra comunidad.</p>
            <div className="services-cards">
  {services.map((service, index) => (
    <div
      className="service-card"
      key={index}
      style={{ backgroundImage: `url(${service.image})` }}
    >
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      {/* Redirigimos a la ruta dinámica con el nombre como ID */}
      <Link to={`/nuestros-servicios/${service.name.toLowerCase().replace(/ /g, '-')}`} className="service-button">
        Ver más
      </Link>
    </div>
  ))}
</div>

        </section>

            {/* Sección de Nosotros y Horarios */}
            <section className="about-schedule-section">
                <div className="about-section-nosotros">
                    <h2>"Sobre Nosotros"</h2>
                    <p>La Comunidad Islámica de Tordera lleva más de 15 años al servicio de la comunidad, 
                        promoviendo valores de paz, respeto y apoyo mutuo. Con más de 10 nacionalidades unidas, 
                        somos un espacio de encuentro y aprendizaje para personas de todas las edades. 
                        Contamos con una escuela propia que fomenta el conocimiento y la integración cultural. 
                        Nuestro compromiso sigue creciendo, y estamos trabajando en un ambicioso proyecto para 
                        abrir un gran centro islámico en el futuro, donde podamos ofrecer más servicios y ampliar 
                        nuestras actividades para beneficio de todos.........</p>
                    <Link to="/nosotros" className="cta-button">Saber más</Link>
                </div>
                <div className="schedule-section-horarios">
                    <h3>Horarios de Oración</h3>
                    <iframe
                        style={{ width: "100%", height: "358px", border: "1px solid #ddd" }}
                        scrolling="no"
                        src="https://www.islamicfinder.org/prayer-widget/3107955/shafi/1/0/18.0/17.0"
                        title="Prayer Times"
                    ></iframe>
                </div>
            </section>

          

               {/* Testimonios o Historias de Impacto */}
            <section className="testimonials-preview">
               <h2>Testimonio de nuestros visitantes</h2>
                    {lastTestimonio ? (
                <div className="testimonial">
                     <p>{`"${lastTestimonio.text}"`}</p>
                     <p>- {lastTestimonio.name}-</p>
                </div>
                ) : (
                     <p>Cargando testimonio...</p>
                )}
                  <Link to="/testimonios">
                  <button className="read-more-button">Leer más testimonios</button>
                  </Link>
            </section>


            {/* Donaciones */}
            <section className="donations-section">
                <h2>Apóyanos</h2>
                <p>Tu donación nos ayuda a continuar nuestro trabajo y brindar más servicios a nuestra comunidad.</p>
                <Link to="/donaciones" className="cta-button-donaciones">Haz una donación</Link>
            </section>
        </div>

            {/* Footer solo en home*/}
            <Footer />
      </>
    );
};

export default Home;