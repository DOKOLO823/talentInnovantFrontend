"use client";

// Emplacement : app/components/guest/TestimonialsSection.tsx
// Section « Témoignages » de la page d'accueil.
// Les contenus se gèrent dans ./testimonials.data.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Play, Quote, X, ZoomIn } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "./testimonials.data";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const youtubeThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

/* ------------------------------ Média de la carte ------------------------------ */

function CardMedia({
  t,
  onOpen,
}: {
  t: Testimonial;
  onOpen: (t: Testimonial) => void;
}) {
  // Photo : cliquable pour agrandir (modal)
  if (t.type === "image" && t.image) {
    return (
      <button
        type="button"
        onClick={() => onOpen(t)}
        aria-label={`Agrandir la photo de ${t.name}`}
        className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500"
      >
        <img
          src={t.image}
          alt={t.name}
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition-colors group-hover:bg-orange-700 group-hover:text-white">
          <ZoomIn className="h-5 w-5" />
        </span>
      </button>
    );
  }

  if (t.type === "video" && (t.videoSrc || t.youtubeId)) {
    return (
      <button
        type="button"
        onClick={() => onOpen(t)}
        aria-label={`Lire le témoignage de ${t.name}`}
        className="group relative block aspect-[4/3] w-full overflow-hidden bg-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500"
      >
        {t.poster ? (
          <img
            src={t.poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        ) : t.youtubeId ? (
          <img
            src={youtubeThumb(t.youtubeId)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            src={`${t.videoSrc}#t=0.5`}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-700 text-white shadow-xl transition-transform group-hover:scale-110">
            <Play className="ml-1 h-7 w-7" fill="currentColor" />
          </span>
        </span>
      </button>
    );
  }

  return null;
}

/* ---------------------------------- Carte ---------------------------------- */

function TestimonialCard({
  t,
  onOpen,
}: {
  t: Testimonial;
  onOpen: (t: Testimonial) => void;
}) {
  const hasMedia =
    (t.type === "image" && t.image) ||
    (t.type === "video" && (t.videoSrc || t.youtubeId));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      {hasMedia && <CardMedia t={t} onOpen={onOpen} />}

      <div className="flex flex-1 flex-col items-center p-6 text-center">
        {/* Type texte : avatar ou initiales */}
        {!hasMedia && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-orange-100 bg-orange-50 text-lg font-bold text-orange-700">
            {t.image ? (
              <img
                src={t.image}
                alt={t.name}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(t.name)
            )}
          </div>
        )}

        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-orange-700">
          <Award className="h-3.5 w-3.5 shrink-0" />
          <span className="text-center">{t.title}</span>
        </span>

        <h3 className="mt-3 text-xl font-bold text-gray-900">{t.name}</h3>
        {t.subtitle && (
          <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>
        )}

        {t.quote && (
          <div className="mt-4 flex flex-1 flex-col items-center">
            <Quote className="mb-2 h-5 w-5 shrink-0 text-orange-300" />
            <p className="text-sm italic leading-relaxed text-gray-600 sm:text-base">
              {t.quote}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------------------------------- Section ---------------------------------- */

export default function TestimonialsSection() {
  const [active, setActive] = useState<Testimonial | null>(null);
  const [current, setCurrent] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calcule la carte la plus proche du centre pour indiquer la bulle active
  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    setCanScroll(el.scrollWidth > el.clientWidth + 1);

    const last = TESTIMONIALS.length - 1;
    if (el.scrollLeft <= 2) return setCurrent(0);
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
      return setCurrent(last);

    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setCurrent(best);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScrollState);
    };
    updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateScrollState]);

  const goTo = (i: number) =>
    cardRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

  // Échap pour fermer + blocage du scroll arrière-plan quand une modale est ouverte
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active]);

  if (TESTIMONIALS.length === 0) return null;

  return (
    <>
      <section id="temoignages" className="bg-gray-50 py-0">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-extrabold text-gray-900 sm:mb-4 sm:text-3xl md:text-4xl">
            Ils ont relevé le défi
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-sm text-gray-600 sm:mb-12 sm:text-base md:text-lg">
            Découvrez les talents récompensés sur TALENT INNOVANT, en leurs
            propres mots.
          </p>
        </div>

        {/* Ligne de témoignages : défilement horizontal avec accroche (snap).
            first:ml-auto / last:mr-auto centrent les cartes quand elles tiennent
            à l'écran, et laissent le défilement normal quand elles débordent. */}
        <div
          ref={scrollerRef}
          className="no-scrollbar scrollbar-hide relative mx-auto flex max-w-7xl snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 py-4 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="w-[82%] shrink-0 snap-center first:ml-auto last:mr-auto sm:w-80 lg:w-96"
            >
              <TestimonialCard t={t} onOpen={setActive} />
            </div>
          ))}
        </div>

        {/* Bulles de position (visibles seulement si ça défile) */}
        {canScroll && (
          <div
            className="mt-4 flex items-center justify-center gap-1"
            role="tablist"
            aria-label="Position dans les témoignages"
          >
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Témoignage ${i + 1} sur ${TESTIMONIALS.length}`}
                onClick={() => goTo(i)}
                className="p-1.5"
              >
                <span
                  className={`block h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "scale-125 bg-orange-700"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Modale : lecteur vidéo ou photo agrandie */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Témoignage de ${active.name}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Fermer"
                className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
              >
                <X size={20} />
              </button>

              {active.type === "image" ? (
                <div className="bg-black">
                  <img
                    src={active.image}
                    alt={active.name}
                    className="mx-auto block max-h-[75vh] w-auto max-w-full object-contain"
                  />
                </div>
              ) : active.youtubeId ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                    title={`Témoignage de ${active.name}`}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <video
                  src={active.videoSrc}
                  poster={active.poster}
                  controls
                  autoPlay
                  playsInline
                  className="mx-auto block max-h-[75vh] w-full bg-black"
                />
              )}

              <div className="px-5 py-4 text-center sm:text-left">
                <p className="font-bold text-gray-900">{active.name}</p>
                <p className="text-sm text-orange-700">{active.title}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
