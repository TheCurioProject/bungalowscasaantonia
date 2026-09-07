"use client";

import { FormEvent, useEffect, useState } from "react";

const verify = "[[VERIFICAR: ";

const rooms = [
  { number: "01", name: "Bungalow 01", note: `${verify}nombre, capacidad, camas, baño, cocina y amenidades del bungalow 01]]` },
  { number: "02", name: "Bungalow 02", note: `${verify}nombre, capacidad, camas, baño, cocina y amenidades del bungalow 02]]` },
  { number: "03", name: "Bungalow 03", note: `${verify}nombre, capacidad, camas, baño, cocina y amenidades del bungalow 03]]` },
];

const faqs = [
  ["¿A qué hora puedo llegar?", `${verify}horarios reales de check-in y check-out]]`],
  ["¿Puedo viajar con mi mascota?", `${verify}política real de mascotas]]`],
  ["¿Hay Wi-Fi?", `${verify}disponibilidad y alcance real de Wi-Fi por bungalow]]`],
  ["¿Cómo confirmo mi reserva?", `${verify}métodos de pago, anticipo y política de cancelación]]`],
];

function PhotoPlaceholder({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div className={`photo-placeholder ${tall ? "tall" : ""}`} role="img" aria-label={`Fotografía pendiente: ${label}`}>
      <span>Fotografía real pendiente</span>
      <strong>{label}</strong>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = bookingOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [bookingOpen, menuOpen]);

  function closeBooking() {
    setBookingOpen(false);
    setSubmitted(false);
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Casa Antonia, inicio">Casa Antonia</a>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Navegación principal">
          <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a><i>·</i>
          <a href="#habitaciones" onClick={() => setMenuOpen(false)}>Habitaciones</a><i>·</i>
          <a href="#galeria" onClick={() => setMenuOpen(false)}>Galería</a><i>·</i>
          <a href="#ubicacion" onClick={() => setMenuOpen(false)}>Ubicación</a>
        </nav>
        <button className="book-button" onClick={() => setBookingOpen(true)}>Reserva ahora <span>→</span></button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Abrir menú">{menuOpen ? "Cerrar" : "Menú"}</button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="place">Chacala · Nayarit</p>
          <h1>Tu refugio en<br/><em>la costa</em></h1>
          <p className="hero-intro">Bungalows junto al ritmo sereno de Chacala. Un lugar para llegar, habitar y dejar que el día encuentre su propia forma.</p>
          <button className="text-action" onClick={() => setBookingOpen(true)}>Descubrir el lugar <span>→</span></button>
        </div>
        <div className="hero-image"><PhotoPlaceholder label="Fachada o vista principal de Casa Antonia" tall/><span className="vertical-note">Costa de Nayarit</span></div>
        <div className="sun" aria-hidden="true" />
        <div className="tide" aria-hidden="true" />
      </section>

      <section className="tempo chapter-section">
        <span className="chapter">01 · Llegar</span>
        <div className="tempo-title"><h2>Aquí, el tiempo<br/>cambia de <em>ritmo</em></h2></div>
        <div className="tempo-copy"><p>Casa Antonia se descubre sin prisa: espacios sencillos, luz cálida y la costa cerca. Lo demás lo pone cada día.</p><span className="fine-line"/></div>
      </section>

      <section className="rooms chapter-section" id="habitaciones">
        <div className="section-heading"><span className="chapter">02 · Habitar</span><h2>Encuentra<br/>tu espacio</h2><p>Cada bungalow se presenta con su información propia. Nada se generaliza y nada se publica sin comprobar.</p></div>
        <div className="room-list">
          {rooms.map((room, index) => (
            <article className="room" key={room.number}>
              <div className="room-photo"><PhotoPlaceholder label={`Fotografía real del ${room.name}`} tall={index === 1}/><span>{room.number}</span></div>
              <div className="room-info"><h3>{room.name}</h3><p className="verify">{room.note}</p><button onClick={() => { setSelectedRoom(room.name); setBookingOpen(true); }}>Ver disponibilidad</button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="life chapter-section">
        <span className="pool-word" aria-hidden="true">ALBERCA</span>
        <div className="life-photo"><PhotoPlaceholder label="Alberca y áreas comunes de Casa Antonia" tall/></div>
        <div className="life-copy"><span className="chapter">03 · Disfrutar</span><h2>La vida en<br/>Casa Antonia</h2><p>Un día aquí se arma con cosas simples: sombra, agua, conversación y un lugar propio al cual volver.</p><p className="verify">{verify}amenidades compartidas reales y reglas de uso]]</p></div>
      </section>

      <section className="social chapter-section">
        <span className="chapter">04 · Confiar</span>
        <p className="quote-mark">“</p><h2>Lo dicen quienes<br/>ya estuvieron aquí</h2>
        <p className="verify centered">{verify}testimonios reales, nombres autorizados, fuente y calificación]]</p>
        <p className="social-note">Este espacio está reservado para palabras comprobables de huéspedes reales.</p>
      </section>

      <section className="chacala chapter-section">
        <div className="chacala-copy"><span className="chapter">05 · Explorar</span><h2>El mar<br/>empieza aquí</h2><p>Casa Antonia es el punto de partida. Chacala sigue afuera: su costa, su pueblo y los planes que cada viajero hace suyos.</p><p className="verify">{verify}recomendaciones reales del anfitrión y tiempos/distancias comprobados]]</p></div>
        <div className="chacala-images"><PhotoPlaceholder label="Costa y mar de Chacala" tall/><PhotoPlaceholder label="Vida cotidiana del pueblo"/></div>
      </section>

      <section className="location chapter-section" id="ubicacion">
        <div className="map-graphic" aria-label="Mapa pendiente de ubicación confirmada"><span>MAR</span><div className="coast-line"/><b>Casa Antonia</b></div>
        <div className="location-copy"><span className="chapter">06 · Ubicarse</span><h2>Cerca de lo que<br/>viniste a buscar</h2><p>La dirección exacta y los recorridos se mostrarán aquí una vez confirmados.</p><p className="verify">{verify}dirección, coordenadas y tiempos reales a pie o en auto]]</p></div>
      </section>

      <section className="gallery chapter-section" id="galeria">
        <div className="section-heading wide"><span className="chapter">07 · Mirar</span><h2>Míralo antes<br/>de llegar</h2><p>Arquitectura, habitaciones, naturaleza y vida real. Sin filtros que prometan otra cosa.</p></div>
        <div className="gallery-grid">
          <PhotoPlaceholder label="Arquitectura" tall/><PhotoPlaceholder label="Interior de bungalow"/><PhotoPlaceholder label="Naturaleza de Chacala"/><PhotoPlaceholder label="Detalle de hospitalidad" tall/>
        </div>
      </section>

      <section className="antonia chapter-section">
        <div className="antonia-image"><PhotoPlaceholder label="Retrato real y autorizado de Antonia" tall/><span className="signature">Antonia</span></div>
        <div className="antonia-copy"><span className="chapter">08 · Recibir</span><h2>Sentirse como en casa<br/>no es una frase</h2><p>Detrás de cada estancia hay una persona. Esta historia se contará con la voz real de Antonia y con una fotografía autorizada.</p><p className="verify">{verify}historia real de Antonia, cita autorizada y fotografía final]]</p></div>
      </section>

      <section className="faq chapter-section" id="faq">
        <div className="faq-heading"><span className="chapter">09 · Saber</span><h2>Todo claro<br/>antes de reservar</h2></div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p className="verify">{answer}</p></details>)}
        </div>
      </section>

      <section className="closing chapter-section">
        <div><span className="chapter">10 · Volver</span><h2>Tu lugar<br/>en Chacala</h2><p>El viaje empieza cuando eliges tus fechas. Consulta la disponibilidad y encuentra el bungalow para tu estancia.</p><button className="light-button" onClick={() => setBookingOpen(true)}>Reservar <span>→</span></button></div>
        <div className="closing-orbit" aria-hidden="true"><span>Casa Antonia · Chacala · Nayarit · </span></div>
      </section>

      <footer>
        <div className="footer-brand">Casa Antonia<small>Bungalows · Chacala, Nayarit</small></div>
        <div><h3>Explora</h3><a href="#habitaciones">Habitaciones</a><a href="#galeria">Galería</a><a href="#ubicacion">Ubicación</a></div>
        <div><h3>Contacto</h3><p className="verify">{verify}teléfono, WhatsApp y correo oficiales]]</p></div>
        <div><h3>Información</h3><a href="#faq">Políticas</a><p className="verify">{verify}redes sociales oficiales y aviso de privacidad]]</p></div>
        <p className="copyright">© Casa Antonia · Información sujeta a verificación antes de publicación.</p>
      </footer>

      <button className="mobile-book" onClick={() => setBookingOpen(true)}>Reservar <span>→</span></button>

      {bookingOpen && <div className="booking-shell" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button className="booking-backdrop" onClick={closeBooking} aria-label="Cerrar reserva"/>
        <aside className="booking-panel">
          <div className="booking-top"><span>Casa Antonia</span><button onClick={closeBooking}>Cerrar ×</button></div>
          <p className="booking-progress">Paso {bookingStep} de 3</p>
          <h2 id="booking-title">{bookingStep === 1 ? "Fechas de tu estancia" : bookingStep === 2 ? "Elige tu bungalow" : "Tus datos"}</h2>
          {bookingStep === 1 && <form className="booking-form" onSubmit={(e) => { e.preventDefault(); setBookingStep(2); }}>
            <label>Llegada<input type="date" required/></label><label>Salida<input type="date" required/></label><label>Huéspedes<input type="number" min="1" defaultValue="2" required/></label>
            <p className="verify">{verify}conectar inventario y disponibilidad real]]</p><button className="primary-button">Consultar disponibilidad</button>
          </form>}
          {bookingStep === 2 && <div className="booking-form room-choice">
            {rooms.map(room => <label key={room.number}><input type="radio" name="room" checked={selectedRoom === room.name} onChange={() => setSelectedRoom(room.name)}/><span><b>{room.name}</b><small>{verify}precio por noche, impuestos y total real]]</small></span></label>)}
            <button className="primary-button" disabled={!selectedRoom} onClick={() => setBookingStep(3)}>Continuar</button><button className="back-button" onClick={() => setBookingStep(1)}>Volver a fechas</button>
          </div>}
          {bookingStep === 3 && !submitted && <form className="booking-form" onSubmit={submitBooking}>
            <label>Nombre completo<input type="text" autoComplete="name" required/></label><label>Correo<input type="email" autoComplete="email" required/></label><label>Teléfono<input type="tel" autoComplete="tel" required/></label>
            <div className="price-summary"><span>Total de la estancia</span><b>{verify}total con impuestos y cargos]]</b></div><p className="verify">{verify}pasarela y métodos de pago autorizados]]</p><button className="primary-button">Continuar al pago</button><button type="button" className="back-button" onClick={() => setBookingStep(2)}>Volver al bungalow</button>
          </form>}
          {submitted && <div className="booking-success"><span>✓</span><h3>Flujo listo para conectar</h3><p>No se procesó ningún pago: faltan disponibilidad, precios y métodos reales. La interfaz queda preparada sin inventar una confirmación.</p><button className="primary-button" onClick={closeBooking}>Entendido</button></div>}
        </aside>
      </div>}
    </main>
  );
}
