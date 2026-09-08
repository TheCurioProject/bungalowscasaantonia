"use client";

import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDays, dayKey, nightStatus, nightsBetween, parseDay, stayError } from '../lib/availability.mjs';

export type Period = { start: string; end: string; status: 'occupied' | 'blocked' };
export type DateRange = { start: string; end: string };
const ease = [.22, 1, .36, 1] as const;
const dateLabel = (day: string) => day ? parseDay(day).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Seleccionar fecha';

export default function BookingCalendar({ value, onChange, periods, today, confirmedThrough }: {
  value: DateRange; onChange: (value: DateRange) => void; periods: Period[]; today: string; confirmedThrough: string | null;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<'start' | 'end' | null>(null);
  const [month, setMonth] = useState(() => (value.start || today).slice(0, 7) + '-01');
  const [hover, setHover] = useState('');
  const [notice, setNotice] = useState('');
  const startButton = useRef<HTMLButtonElement>(null);
  const endButton = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const first = parseDay(month);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const minMonth = today.slice(0, 7) + '-01';
  const transition = { duration: reduced ? 0 : .3, ease };
  const previewEnd = active === 'end' && hover > value.start && !stayError(value.start, hover, periods, today) ? hover : value.end;

  function close() { setActive(null); setHover(''); (active === 'start' ? startButton : endButton).current?.focus(); }
  function open(field: 'start' | 'end') {
    if (field === active) { close(); return; }
    setActive(field); setHover(''); setNotice('');
    setMonth((value[field] || value.start || today).slice(0, 7) + '-01');
  }
  function disabled(day: string) {
    if (day < today) return true;
    if (active === 'end' && value.start) return Boolean(stayError(value.start, day, periods, today));
    return Boolean(nightStatus(day, periods));
  }
  function select(day: string) {
    if (disabled(day)) return;
    setNotice(''); setHover('');
    if (active === 'start' || !value.start) {
      onChange({ start: day, end: '' }); setActive('end');
    } else {
      const error = stayError(value.start, day, periods, today);
      if (error) { setNotice(error); return; }
      onChange({ ...value, end: day }); close();
    }
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    const move: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -((parseDay(day).getDay() + 6) % 7), End: 6 - ((parseDay(day).getDay() + 6) % 7) };
    if (!(event.key in move)) return;
    event.preventDefault();
    const next = addDays(day, move[event.key]);
    if (next < today) return;
    setMonth(next.slice(0, 7) + '-01');
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus());
  }

  return <div className="date-picker" onKeyDown={event => { if (event.key === 'Escape' && active) { event.preventDefault(); event.stopPropagation(); close(); } }}>
    <div className="date-fields">
      {(['start', 'end'] as const).map(field => <motion.button whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} type="button" key={field} ref={field === 'start' ? startButton : endButton} className={`date-field ${active === field ? 'is-active' : ''}`} onClick={() => open(field)} aria-expanded={active === field} aria-controls="stay-calendar">
        <span><CalendarDays aria-hidden="true"/>{field === 'start' ? 'Llegada' : 'Salida'}</span><strong>{dateLabel(value[field])}</strong>
      </motion.button>)}
    </div>
    <AnimatePresence initial={false}>
      {active && <motion.div id="stay-calendar" className="calendar-surface" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={transition}>
        <div className="calendar-inner">
          <div className="calendar-prompt"><span aria-live="polite">{active === 'start' || !value.start ? 'Elige tu llegada' : 'Ahora, elige tu salida'}</span><motion.button whileHover={reduced ? undefined : { scale: 1.1 }} whileTap={reduced ? undefined : { scale: 0.9 }} type="button" className="icon-button" aria-label="Cerrar calendario" onClick={close}><X/></motion.button></div>
          <div className="calendar-heading"><motion.button whileHover={reduced ? undefined : { scale: 1.1 }} whileTap={reduced ? undefined : { scale: 0.9 }} type="button" className="icon-button" aria-label="Mes anterior" disabled={month <= minMonth} onClick={() => setMonth(dayKey(new Date(first.getFullYear(), first.getMonth() - 1, 1)))}><ChevronLeft/></motion.button><strong id="calendar-month" aria-live="polite">{first.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</strong><motion.button whileHover={reduced ? undefined : { scale: 1.1 }} whileTap={reduced ? undefined : { scale: 0.9 }} type="button" className="icon-button" aria-label="Mes siguiente" onClick={() => setMonth(dayKey(new Date(first.getFullYear(), first.getMonth() + 1, 1)))}><ChevronRight/></motion.button></div>
          <div className="calendar-weekdays" aria-hidden="true">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => <span key={i}>{day}</span>)}</div>
          <div ref={grid} className="calendar-grid" role="group" aria-labelledby="calendar-month" onMouseLeave={() => setHover('')}>
            {Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`}/>)}
            {Array.from({ length: days }, (_, i) => {
              const day = dayKey(new Date(first.getFullYear(), first.getMonth(), i + 1));
              const status = nightStatus(day, periods);
              const selected = day === value.start || day === value.end;
              const inRange = value.start && previewEnd && day > value.start && day < previewEnd;
              const unavailable = disabled(day);
              const label = day < today ? 'pasada' : status === 'occupied' ? 'ocupada' : status === 'blocked' ? 'bloqueada' : confirmedThrough && day <= confirmedThrough ? 'disponible' : 'por confirmar';
              return <motion.button whileHover={unavailable ? undefined : { scale: 1.15 }} whileTap={unavailable ? undefined : { scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} type="button" key={day} data-day={day} aria-disabled={unavailable} aria-pressed={selected} aria-current={day === today ? 'date' : undefined} aria-label={`${dateLabel(day)}, ${label}${active === 'end' && status && !unavailable ? ', solo salida' : ''}`} className={`calendar-day ${status || ''} ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''} ${day < today ? 'past' : ''}`} onClick={() => select(day)} onKeyDown={event => keyboard(event, day)} onMouseEnter={() => setHover(day)}>{i + 1}</motion.button>;
            })}
          </div>
          <div className="calendar-legend"><span><i/>{confirmedThrough ? 'Disponible' : 'Por confirmar'}</span><span><i className="occupied"/>Ocupada</span><span><i className="blocked"/>Bloqueada</span></div>
          <p className="calendar-help">{active === 'end' && value.start ? 'La fecha de salida no cuenta como noche de estancia.' : 'Selecciona la llegada y después la salida.'}</p>
        </div>
      </motion.div>}
    </AnimatePresence>
    <div className="date-summary" aria-live="polite">{value.start && value.end ? <><span>{nightsBetween(value.start, value.end)} {nightsBetween(value.start, value.end) === 1 ? 'noche' : 'noches'} en Casa Antonia</span><button type="button" onClick={() => { onChange({ start: '', end: '' }); setNotice(''); }}>Limpiar fechas</button></> : <span>{notice || 'Unos días para cambiar de ritmo.'}</span>}</div>
  </div>;
}
