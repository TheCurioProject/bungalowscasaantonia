"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type HTMLMotionProps, type Variants } from "framer-motion";
import { ArrowUpRight, MapPin, Menu, X, Plus, ImageIcon, CalendarDays, Users, Waves } from "lucide-react";

import BookingCalendar, { type DateRange, type Period } from "./components/booking-calendar";
import ReviewsCarousel from "./components/reviews-carousel";
import inventory from "./data/availability.json";
import { nightsBetween, stayError, todayAtProperty } from "./lib/availability.mjs";

const appleEase = [.22, 1, .36, 1] as const;
const tactileSpring = { type: "spring", stiffness: 320, damping: 26, mass: .8 } as const;
const editorialSpring = { type: "spring", stiffness: 220, damping: 28, mass: .8 } as const;
const panelSpring = { type: "spring", stiffness: 190, damping: 28, mass: 1 } as const;
const MotionArrow = motion.create(ArrowUpRight);
const MotionX = motion.create(X);
const MotionMenu = motion.create(Menu);
const MotionPlus = motion.create(Plus);

function useMotionLanguage() {
  const reduced = false; // Forced to false to ensure animations play regardless of OS settings
  const colorTransition = { duration: .2, ease: appleEase };
  const entry = (distance = 16, delay?: number): Variants => {
    const transition: any = { ...editorialSpring, opacity: { duration: .4, ease: appleEase }, filter: { duration: .4, ease: appleEase } };
    if (delay) {
      transition.delay = delay;
      transition.opacity.delay = delay;
      transition.filter.delay = delay;
    }
    return {
      hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : distance, filter: reduced ? "blur(0px)" : "blur(4px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: reduced ? { duration: 0 } : transition },
    };
  };
  const sequence = (stagger = .05): Variants => ({
    hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : stagger } },
  });
  const viewport = { once: true, amount: 0.1 as const };
  const reveal = (distance = 12, delay?: number) => {
    if (reduced) return { animate: "visible", variants: entry(distance, delay) };
    return { initial: "hidden", whileInView: "visible", viewport, variants: entry(distance, delay) };
  };
  const group = (stagger = .05) => {
    if (reduced) return { animate: "visible", variants: sequence(stagger) };
    return { initial: "hidden", whileInView: "visible", viewport, variants: sequence(stagger) };
  };
  const fadeMount = reduced ? { animate: { opacity: 1 } } : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: .3, ease: appleEase } };
  return { entry, sequence, reveal, group, fadeMount, colorTransition };
}

function MotionButton({ className, disabled, ...props }: HTMLMotionProps<"button">) {
  const reduced = false;
  const isMobile = className === "mobile-book";
  return <motion.button {...props} className={className} disabled={disabled}
    initial={false} animate="rest" whileHover={disabled ? undefined : "hover"}
    whileTap={disabled || reduced ? undefined : "pressed"}
    variants={{ rest: { scale: 1, "--hover": 0 }, hover: { "--hover": 1 }, pressed: { scale: isMobile ? 1 : .98 } }}
    transition={reduced ? { duration: 0 } : { ...tactileSpring, "--hover": { duration: .2, ease: appleEase } }}
  />;
}

function MotionLink(props: HTMLMotionProps<"a">) {
  const reduced = false;
  return <motion.a {...props} initial={false} animate={{ "--hover": 0 }} whileHover={{ "--hover": 1 }}
    transition={{ duration: reduced ? 0 : .22, ease: appleEase }}/>;
}

function MotionInput(props: HTMLMotionProps<"input">) {
  const reduced = false;
  return <motion.input {...props} initial={false} animate={{ "--input-focus": 0 }} whileFocus={{ "--input-focus": 1 }}
    transition={{ duration: reduced ? 0 : .18, ease: appleEase }}/>;
}

function MotionFaq({ question, answer }: { question: string; answer: string }) {
  const reduced = false;
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className="faq-item">
    <h3><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{question}<MotionPlus aria-hidden="true" initial={false} animate={{ rotate: open ? 45 : 0 }} transition={reduced ? { duration: 0 } : tactileSpring}/></button></h3>
    <motion.div id={id} className="faq-answer" initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: reduced ? 0 : .35, ease: appleEase }} inert={!open}>
      <p className="verify">{answer}</p>
    </motion.div>
  </div>;
}

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

function PhotoPlaceholder({ label, tall = false, revealOnScroll = false, delay = 0 }: { label: string; tall?: boolean; revealOnScroll?: boolean; delay?: number }) {
  const reduced = false;
  const { reveal } = useMotionLanguage();
  return (
    <motion.div {...(revealOnScroll ? reveal(0, delay) : {})} whileHover={reduced ? undefined : { scale: 0.98 }} transition={tactileSpring} className={`photo-placeholder ${tall ? "tall" : ""}`} role="img" aria-label={`Fotografía pendiente: ${label}`}>
      <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}><ImageIcon className="placeholder-icon" aria-hidden="true"/></motion.div><span>Fotografía real pendiente</span>
      <strong>{label}</strong>
    </motion.div>
  );
}

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLElement>(null);
  const reducedMotion = false;
  const { entry, sequence, reveal, group, fadeMount, colorTransition } = useMotionLanguage();
  const iconMotion = {
    variants: {
      rest: { x: 0, y: 0, scale: 1 },
      hover: { x: reducedMotion ? 0 : 3, y: reducedMotion ? 0 : -3 },
      pressed: { scale: reducedMotion ? 1 : .97 },
    },
    transition: reducedMotion ? { duration: 0 } : tactileSpring,
  };
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 120]);
  const heroScaleScroll = useTransform(scrollY, [0, 1000], [1, 1.08]);

  /* ─── Header: detección precisa en tiempo real ───────────────────────────
     Scroll handler + ResizeObserver: calcula offsetTop de cada sección
     en tiempo real. Bidireccional, determinístico, sin hacks.
     light = header sobre sección oscura  → texto --paper
     dark  = header sobre sección clara   → texto --ink
     La sección .rooms desvanece el header progresivamente al entrar.   */
  const [headerTheme, setHeaderTheme] = useState<"light" | "dark">("light");
  const [headerOpacity, setHeaderOpacity] = useState(1);

  useEffect(() => {
    const HEADER_MID = 46;   // mitad del header en px (90px / 2)
    const FADE_PX    = 140;  // distancia de fade al entrar/salir de .rooms

    // Recopila boundaries de todas las secciones con data-header
    const getSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-header]")).map(el => ({
        top   : el.offsetTop,
        bottom: el.offsetTop + el.offsetHeight,
        theme : el.dataset.header as "light" | "dark",
        isRooms: el.classList.contains("rooms"),
      }));

    let sections = getSections();

    const onScroll = () => {
      const hy = window.scrollY + HEADER_MID;

      // 1. Detectar tema: busca la seción que contiene la posición del header
      for (const s of sections) {
        if (hy >= s.top && hy < s.bottom) {
          setHeaderTheme(s.theme);
          break;
        }
      }

      // 2. Opacidad progresiva sobre .rooms
      const rooms = sections.find(s => s.isRooms);
      if (rooms) {
        const ht = window.scrollY + HEADER_MID * 2; // borde inferior del header
        let op = 1;
        if (ht >= rooms.top - FADE_PX && ht < rooms.top) {
          // Entrando: fade out suave
          op = (rooms.top - ht) / FADE_PX;
        } else if (ht >= rooms.top && ht < rooms.bottom) {
          // Dentro: completamente invisible
          op = 0;
        } else if (ht >= rooms.bottom && ht < rooms.bottom + FADE_PX) {
          // Saliendo: fade in suave
          op = (ht - rooms.bottom) / FADE_PX;
        }
        setHeaderOpacity(Math.max(0, Math.min(1, op)));
      }
    };

    // Recalcular boundaries si cambia el tamaño del documento
    const resizeObserver = new ResizeObserver(() => {
      sections = getSections();
      onScroll();
    });
    resizeObserver.observe(document.documentElement);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // estado inicial

    return () => {
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dates, setDates] = useState<DateRange>({ start: "", end: "" });
  const [guests, setGuests] = useState("2");
  const [dateError, setDateError] = useState("");
  const [today] = useState(todayAtProperty);
  const calendarRoom = inventory.rooms.find(room => room.name === selectedRoom) || inventory.rooms[0];
  const periods = calendarRoom.periods as Period[];
  const rangeError = stayError(dates.start, dates.end, periods, today);
  const confirmedThrough = calendarRoom.confirmedThrough as string | null;

  useEffect(() => {
    if (!bookingOpen && !menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const surface = bookingOpen ? panel.current : document.querySelector<HTMLElement>(".site-header");
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]';
    const timer = window.setTimeout(() => surface?.querySelector<HTMLElement>(bookingOpen ? "button" : ".nav a")?.focus(), 50);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setBookingOpen(false); setMenuOpen(false); }
      if (event.key !== "Tab" || !surface) return;
      const items = Array.from(surface.querySelectorAll<HTMLElement>(selector)).filter(el => el.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [bookingOpen, menuOpen]);

  useEffect(() => {
    document.body.style.overflow = bookingOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [bookingOpen, menuOpen]);

  function closeBooking() {
    setBookingOpen(false);
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main ref={root}>
      <motion.header
        {...fadeMount}
        className={`site-header ${menuOpen ? "menu-is-open" : ""}`}
        data-theme={headerTheme}
        style={{ position: "fixed", opacity: headerOpacity }}
      >
        <MotionLink className="brand" href="#inicio" aria-label="Casa Antonia, inicio"><small>Bungalows</small>Casa Antonia</MotionLink>
        <motion.nav initial={false} animate={{ "--menu-opacity": menuOpen ? 1 : 0, "--menu-y": menuOpen || reducedMotion ? "0px" : "-10px", "--menu-visibility": menuOpen ? "visible" : "hidden" }} transition={{ duration: reducedMotion ? 0 : .3, ease: appleEase, "--menu-visibility": { duration: 0, delay: menuOpen || reducedMotion ? 0 : .3 } }} id="main-navigation" className={menuOpen ? "nav open" : "nav"} aria-label="Navegación principal">
          <MotionLink href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</MotionLink><i>·</i>
          <MotionLink href="#habitaciones" onClick={() => setMenuOpen(false)}>Habitaciones</MotionLink><i>·</i>
          <MotionLink href="#galeria" onClick={() => setMenuOpen(false)}>Galería</MotionLink><i>·</i>
          <MotionLink href="#ubicacion" onClick={() => setMenuOpen(false)}>Ubicación</MotionLink>
        </motion.nav>
        <MotionButton className="book-button" onClick={() => setBookingOpen(true)}>Reserva ahora <MotionArrow {...iconMotion} aria-hidden="true"/></MotionButton>
        <MotionButton className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}>{menuOpen ? <MotionX {...iconMotion}/> : <MotionMenu {...iconMotion}/>}</MotionButton>
      </motion.header>

      <motion.section data-header="light" initial={reducedMotion ? false : "hidden"} animate="visible" variants={sequence(.15)} className="hero" id="inicio">
        <motion.div variants={entry(30)} className="hero-image">
          <motion.img 
            src="/heroimage.webp" 
            alt="Fachada de los bungalows Casa Antonia entre jardines y vegetación" 
            width="1672" 
            height="941" 
            fetchPriority="high"
            style={{ y: reducedMotion ? 0 : heroY, scale: reducedMotion ? 1 : heroScaleScroll, originY: 0.2 }}
            variants={{ hidden: { scale: 1.15 }, visible: { scale: 1, transition: { duration: 1.4, ease: appleEase } } }}
          />
        </motion.div>
        <motion.div variants={sequence(.1)} className="hero-copy">
          <motion.p variants={entry(16)} className="place"><MapPin size={14} aria-hidden="true"/>Chacala · Nayarit</motion.p>
          <motion.h1 variants={entry(16)}>Tu refugio en<br/><em>la costa</em></motion.h1>
          <motion.p variants={entry(16)} className="hero-intro">Bungalows junto al ritmo sereno de Chacala. Un lugar para llegar, habitar y dejar que el día encuentre su propia forma.</motion.p>
        </motion.div>
        <motion.div variants={entry(10)} className="hero-bottom"><span>Costa de Nayarit</span></motion.div>
      </motion.section>

      <motion.section data-header="dark" {...group(.05)} className="tempo chapter-section" id="llegar">
        <motion.span variants={entry(0)} className="chapter">01 · Llegar</motion.span>
        <motion.div variants={entry(12)} className="tempo-title"><h2>Aquí, el tiempo<br/>cambia de <em>ritmo</em></h2></motion.div>
        <motion.div variants={entry(12)} className="tempo-copy"><p>Casa Antonia se descubre sin prisa: espacios sencillos, luz cálida y la costa cerca. Lo demás lo pone cada día.</p><span className="fine-line"><Waves aria-hidden="true"/></span></motion.div>
      </motion.section>

      <section data-header="dark" className="rooms chapter-section" id="habitaciones">
        <motion.div {...reveal(0)} className="section-heading"><span className="chapter">02 · Habitar</span><h2>Encuentra<br/>tu espacio</h2><p>Cada bungalow se presenta con su información propia. Nada se generaliza y nada se publica sin comprobar.</p></motion.div>
        <div className="room-list">
          {rooms.map((room, index) => (
            <motion.article {...reveal(16)} initial="hidden" whileHover="hover" animate="visible" whileInView="visible" viewport={{ once: true, amount: 0, margin: "0px 0px -12% 0px" }} className="room" key={room.number}>
              <motion.div className="room-photo" variants={{ hidden: { scale: 1 }, visible: { scale: 1 }, hover: { scale: 1.03 } }} transition={reducedMotion ? { duration: 0 } : tactileSpring}><PhotoPlaceholder label={`Fotografía real del ${room.name}`} tall={index === 1}/><span>{room.number}</span></motion.div>
              <div className="room-info"><h3>{room.name}</h3><p className="verify">{room.note}</p><MotionButton onClick={() => { setSelectedRoom(room.name); setBookingOpen(true); }}>Ver disponibilidad</MotionButton></div>
            </motion.article>
          ))}
        </div>
      </section>

      <section data-header="dark" className="life chapter-section">
        <motion.span {...reveal(0)} className="pool-word" aria-hidden="true">ALBERCA</motion.span>
        <motion.div {...reveal()} className="life-photo"><PhotoPlaceholder label="Alberca y áreas comunes de Casa Antonia" tall/></motion.div>
        <motion.div {...reveal(12, .06)} className="life-copy"><span className="chapter">03 · Disfrutar</span><h2>La vida en<br/>Casa Antonia</h2><p>Un día aquí se arma con cosas simples: sombra, agua, conversación y un lugar propio al cual volver.</p><p className="verify">{verify}amenidades compartidas reales y reglas de uso]]</p></motion.div>
      </section>

      <motion.section data-header="light" {...group(.04)} className="social chapter-section">
        <motion.span variants={entry(0)} className="chapter">04 · Confiar</motion.span>
        <motion.p variants={entry(0)} className="quote-mark">“</motion.p><motion.h2 variants={entry(0)}>Lo dicen quienes<br/>ya estuvieron aquí</motion.h2>
        <ReviewsCarousel/>
      </motion.section>

      <section data-header="dark" className="chacala chapter-section">
        <motion.div {...reveal()} className="chacala-copy"><span className="chapter">05 · Explorar</span><h2>El mar<br/>empieza aquí</h2><p>Casa Antonia es el punto de partida. Chacala sigue afuera: su costa, su pueblo y los planes que cada viajero hace suyos.</p><p className="verify">{verify}recomendaciones reales del anfitrión y tiempos/distancias comprobados]]</p></motion.div>
        <motion.div {...reveal(0)} className="chacala-images"><PhotoPlaceholder label="Costa y mar de Chacala" tall/><PhotoPlaceholder label="Vida cotidiana del pueblo"/></motion.div>
      </section>

      <section data-header="dark" className="location chapter-section" id="ubicacion">
        <motion.div {...reveal(0)} className="map-embed">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d988.7486345724552!2d-105.22712824976563!3d21.166641300114957!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8420d804782adcdb%3A0x9a431a15981339ab!2sBungalows%20Casa%20Antonia!5e0!3m2!1ses!2smx!4v1788812820514!5m2!1ses!2smx"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Ubicación de Bungalows Casa Antonia en Chacala"
          />
        </motion.div>
        <motion.div {...reveal()} className="location-copy"><span className="chapter">06 · Ubicarse</span><h2>Cerca de lo que<br/>viniste a buscar</h2><p>Estamos en Avenida Chacalilla #20, C.P. 63708, Chacala, Nayarit, a pocos pasos del mar.</p><p>Consulta el mapa para ubicar Casa Antonia y preparar tu llegada.</p></motion.div>
      </section>

      <section data-header="dark" className="gallery chapter-section" id="galeria">
        <motion.div {...reveal(0)} className="section-heading wide"><span className="chapter">07 · Mirar</span><h2>Míralo antes<br/>de llegar</h2><p>Arquitectura, habitaciones, naturaleza y vida real. Sin filtros que prometan otra cosa.</p></motion.div>
        <div className="gallery-grid">
          <PhotoPlaceholder revealOnScroll delay={0.0} label="Arquitectura" tall/><PhotoPlaceholder revealOnScroll delay={0.04} label="Interior de bungalow"/><PhotoPlaceholder revealOnScroll delay={0.08} label="Naturaleza de Chacala"/><PhotoPlaceholder revealOnScroll delay={0.12} label="Detalle de hospitalidad" tall/>
        </div>
      </section>

      <section data-header="dark" className="antonia chapter-section">
        <motion.div {...reveal()} className="antonia-image"><PhotoPlaceholder label="Retrato real y autorizado de Antonia" tall/><span className="signature">Antonia</span></motion.div>
        <motion.div {...reveal(12, .06)} className="antonia-copy"><span className="chapter">08 · Recibir</span><h2>Sentirse como en casa<br/>no es una frase</h2><p>Detrás de cada estancia hay una persona. Esta historia se contará con la voz real de Antonia y con una fotografía autorizada.</p><p className="verify">{verify}historia real de Antonia, cita autorizada y fotografía final]]</p></motion.div>
      </section>

      <section data-header="dark" className="faq chapter-section" id="faq">
        <motion.div {...reveal()} className="faq-heading"><span className="chapter">09 · Saber</span><h2>Todo claro<br/>antes de reservar</h2></motion.div>
        <motion.div {...reveal()} className="faq-list">
          {faqs.map(([question, answer]) => <MotionFaq key={question} question={question} answer={answer}/>)}
        </motion.div>
      </section>

      <section data-header="light" className="closing chapter-section">
        <motion.div {...reveal()}><span className="chapter">10 · Volver</span><h2>Tu lugar<br/>en Chacala</h2><p>El viaje empieza cuando eliges tus fechas. Consulta la disponibilidad y encuentra el bungalow para tu estancia.</p><MotionButton className="light-button" onClick={() => setBookingOpen(true)}>Reservar <MotionArrow {...iconMotion} aria-hidden="true"/></MotionButton></motion.div>
        <motion.div {...reveal(0)} className="closing-orbit" aria-hidden="true"><span>Casa Antonia · Chacala · Nayarit · </span></motion.div>
      </section>

      <footer data-header="light">
        <motion.div {...reveal(0)} className="footer-brand">Casa Antonia<small>Bungalows · Chacala, Nayarit</small></motion.div>
        <motion.div {...reveal(0, .04)}><h3>Explora</h3><MotionLink href="#habitaciones">Habitaciones</MotionLink><MotionLink href="#galeria">Galería</MotionLink><MotionLink href="#ubicacion">Ubicación</MotionLink></motion.div>
        <motion.div {...reveal(0, .08)}><h3>Contacto</h3><p className="verify">{verify}teléfono, WhatsApp y correo oficiales]]</p></motion.div>
        <motion.div {...reveal(0, .12)}><h3>Información</h3><MotionLink href="#faq">Políticas</MotionLink><p className="verify">{verify}redes sociales oficiales y aviso de privacidad]]</p></motion.div>
        <motion.p {...reveal(0)} className="copyright">© Casa Antonia · Información sujeta a verificación antes de publicación.</motion.p>
      </footer>

      <MotionButton className="mobile-book" onClick={() => setBookingOpen(true)}>Reservar <MotionArrow {...iconMotion} aria-hidden="true"/></MotionButton>

      <AnimatePresence onExitComplete={() => { setSubmitted(false); setBookingStep(1); }}>{bookingOpen && <motion.div initial="closed" animate="open" exit="closed" variants={{ closed: { transition: { when: "afterChildren" } }, open: {} }} className="booking-shell" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <motion.button className="booking-backdrop" variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }} transition={{ duration: reducedMotion ? 0 : .4, ease: appleEase }} onClick={closeBooking} aria-label="Cerrar reserva" tabIndex={-1}/>
        <motion.aside ref={panel} variants={{ closed: { x: reducedMotion ? 0 : "100%" }, open: { x: 0 } }} transition={reducedMotion ? { duration: 0 } : panelSpring} className="booking-panel">
          <div className="booking-top"><span>Casa Antonia</span><MotionButton onClick={closeBooking}>Cerrar <MotionX {...iconMotion} size={16} aria-hidden="true"/></MotionButton></div>
          <p className="booking-progress">Paso {bookingStep} de 3</p><div className="step-track" aria-hidden="true">{[1, 2, 3].map(step => <motion.span key={step} className={step <= bookingStep ? "active" : ""} initial={false} animate={{ backgroundColor: step <= bookingStep ? "#245773" : "#e4d6bf" }} transition={{ ...colorTransition, duration: reducedMotion ? 0 : .22 }}/>)}</div><AnimatePresence mode="wait" initial={false}><motion.div layout key={`${bookingStep}-${submitted}`} exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { ...tactileSpring, opacity: { duration: .22, ease: appleEase } }}>
          <h2 id="booking-title">{bookingStep === 1 ? "Fechas de tu estancia" : bookingStep === 2 ? "Elige tu bungalow" : "Tus datos"}</h2>
          {bookingStep === 1 && <form className="booking-form" onSubmit={(e) => { e.preventDefault(); if (rangeError) { setDateError(rangeError); return; } setSelectedRoom(calendarRoom.name); setBookingStep(2); }}>
            <label>Bungalow<select value={calendarRoom.name} onChange={event => { setSelectedRoom(event.target.value); setDates({ start: "", end: "" }); setDateError(""); }}>{inventory.rooms.map(room => <option key={room.id} value={room.name}>{room.name}</option>)}</select></label>
            <BookingCalendar key={calendarRoom.id} value={dates} onChange={value => { setDates(value); setDateError(""); }} periods={periods} today={today} confirmedThrough={confirmedThrough}/>
            <label><span><Users size={15} aria-hidden="true"/>Huéspedes</span><MotionInput type="number" min="1" step="1" value={guests} onChange={event => setGuests(event.target.value)} required/></label>
            <p className="availability-note">{confirmedThrough ? "Las fechas posteriores al registro de disponibilidad están sujetas a confirmación." : "Elige tus fechas preferidas. Confirmaremos la disponibilidad contigo antes de reservar."}</p>
            {dateError && <p className="form-error" role="alert">{dateError}</p>}<MotionButton className="primary-button">Continuar con estas fechas</MotionButton>
          </form>}
          {bookingStep === 2 && <div className="booking-form room-choice">
            <p className="stay-recap"><CalendarDays aria-hidden="true"/>{dates.start} — {dates.end}<br/>{nightsBetween(dates.start, dates.end)} noches · {guests} huéspedes</p>
            {rooms.map(room => <motion.label initial={false} animate={{ backgroundColor: selectedRoom === room.name ? "#24577309" : "#24577300", borderColor: selectedRoom === room.name ? "#245773" : "rgba(53,69,54,.24)" }} transition={colorTransition} key={room.number}><input type="radio" name="room" checked={selectedRoom === room.name} disabled={Boolean(stayError(dates.start, dates.end, (inventory.rooms.find(item => item.id === room.number)?.periods || []) as Period[], today))} onChange={() => setSelectedRoom(room.name)}/><span><b>{room.name}</b><small>{verify}precio por noche, impuestos y total real]]</small></span></motion.label>)}
            <MotionButton className="primary-button" disabled={!selectedRoom || Boolean(rangeError)} onClick={() => setBookingStep(3)}>Continuar</MotionButton><MotionButton className="back-button" onClick={() => setBookingStep(1)}>Volver a fechas</MotionButton>
          </div>}
          {bookingStep === 3 && !submitted && <form className="booking-form" onSubmit={submitBooking}>
            <label>Nombre completo<MotionInput type="text" autoComplete="name" required/></label><label>Correo<MotionInput type="email" autoComplete="email" required/></label><label>Teléfono<MotionInput type="tel" autoComplete="tel" required/></label>
            <div className="price-summary"><span>Total de la estancia</span><b>{verify}total con impuestos y cargos]]</b></div><p className="verify">{verify}pasarela y métodos de pago autorizados]]</p><MotionButton className="primary-button">Continuar al pago</MotionButton><MotionButton type="button" className="back-button" onClick={() => setBookingStep(2)}>Volver al bungalow</MotionButton>
          </form>}
          {submitted && <div className="booking-success"><motion.svg className="success-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="29"/><motion.path d="m19 32 9 9 18-19" initial={{ pathLength: reducedMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reducedMotion ? 0 : .4, delay: reducedMotion ? 0 : .08, ease: appleEase }}/></motion.svg><h3>Flujo listo para conectar</h3><p>No se procesó ningún pago: faltan disponibilidad, precios y métodos reales. La interfaz queda preparada sin inventar una confirmación.</p><MotionButton className="primary-button" onClick={closeBooking}>Entendido</MotionButton></div>}
        </motion.div></AnimatePresence></motion.aside>
      </motion.div>}</AnimatePresence>
    </main>
  );
}
