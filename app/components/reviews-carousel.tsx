"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { googleMapsUrl, reviews, reviewSource } from '../data/reviews';

export default function ReviewsCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    function update() {
      if (!element) return;
      const cards = Array.from(element.children) as HTMLElement[];
      const first = cards[0]?.offsetLeft || 0;
      let closest = 0;
      cards.forEach((card, i) => { if (Math.abs(card.offsetLeft - first - element.scrollLeft) < Math.abs(cards[closest].offsetLeft - first - element.scrollLeft)) closest = i; });
      setCurrent(closest); setAtEnd(element.scrollLeft + element.clientWidth >= element.scrollWidth - 3);
    }
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => { element.removeEventListener('scroll', update); observer.disconnect(); };
  }, []);
  function go(index: number) {
    const element = track.current;
    if (!element) return;
    const cards = Array.from(element.children) as HTMLElement[];
    const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
    element.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: reduced ? 'instant' : 'smooth' });
  }
  return <div className="reviews-carousel" role="region" aria-roledescription="carrusel" aria-label="Reseñas de huéspedes">
    <div className="reviews-toolbar"><span>Voces de nuestros visitantes</span><a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">Ver en Google Maps <ArrowUpRight aria-hidden="true"/></a></div>
    <div id="reviews-track" ref={track} className="reviews-track" tabIndex={0} aria-label="Usa las flechas izquierda y derecha para recorrer las reseñas" onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1)); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); go(event.key === 'Home' ? 0 : reviews.length - 1); }
    }}>
      {reviews.map((review, i) => <motion.article whileHover={reduced ? undefined : { y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="review-card" key={review.id} role="group" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${reviews.length}`}>
        <div className="review-card-top"><span className="review-avatar" aria-hidden="true">{review.author.split(' ').slice(0, 2).map(part => part[0]).join('')}</span><div><h3>{review.author}</h3><span>Reseña de Google</span></div><span className="review-number" aria-hidden="true">0{i + 1}</span></div>
        <p className="review-text">{review.text}</p><a className="review-source" href={reviewSource} target="_blank" rel="noopener noreferrer">Resumen · Consultar fuente <ArrowUpRight aria-hidden="true"/></a>
      </motion.article>)}
    </div>
    <div className="reviews-bottom"><p>Reseñas de Google reproducidas por Rotamundos.<br/>Resúmenes consultados el 7 de septiembre de 2026.</p><div className="reviews-controls"><motion.button whileHover={reduced ? undefined : { scale: 1.1 }} whileTap={reduced ? undefined : { scale: 0.9 }} type="button" className="icon-button" disabled={current === 0} aria-label="Reseña anterior" aria-controls="reviews-track" onClick={() => go(current - 1)}><ChevronLeft/></motion.button><span aria-live="polite" aria-atomic="true">{String(current + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}</span><motion.button whileHover={reduced ? undefined : { scale: 1.1 }} whileTap={reduced ? undefined : { scale: 0.9 }} type="button" className="icon-button" disabled={atEnd} aria-label="Reseña siguiente" aria-controls="reviews-track" onClick={() => go(current + 1)}><ChevronRight/></motion.button></div></div>
  </div>;
}
