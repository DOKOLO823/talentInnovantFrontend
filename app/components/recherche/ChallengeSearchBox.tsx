"use client";

// Emplacement : app/components/recherche/ChallengeSearchBox.tsx
// Zone de recherche partagée (accueil talent, accueil guest, page de résultats).
// Fonctionne connecté ou non : ne dépend d'aucune authentification.

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { useFiltreOptions } from "@/app/hooks/useFiltreOptions";

const RESULTS_PATH = "/challenge/search";

const shorten = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;

// Normalise pour une recherche insensible à la casse et aux accents
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type SelectItem = {
  value: string;
  label: string;
  description?: string;
};

/**
 * Liste déroulante avec zone de recherche (loupe + champ texte) filtrée côté frontend.
 * Affiche le libellé en évidence et, si présente, la description en dessous (atténuée).
 */
function SearchableSelect({
  icon,
  value,
  onChange,
  items,
  allLabel,
  placeholderSearch,
  ariaLabel,
  loading,
  onOpen,
  align = "left",
  panelClassName = "md:w-80",
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  items: SelectItem[];
  allLabel: string;
  placeholderSearch: string;
  ariaLabel: string;
  loading: boolean;
  onOpen?: () => void;
  align?: "left" | "right";
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const q = normalize(query);
  const filtered = q
    ? items.filter(
        (it) =>
          normalize(it.label).includes(q) ||
          (it.description ? normalize(it.description).includes(q) : false),
      )
    : items;

  // L'option « Tous … » n'apparaît que sans recherche en cours
  const visible: SelectItem[] = q
    ? filtered
    : [{ value: "", label: allLabel }, ...filtered];

  const selected = items.find((it) => it.value === value);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    onOpen?.();
    const idx = visible.findIndex((it) => it.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const pick = (val: string) => {
    onChange(val);
    close();
  };

  // Focus automatique sur le champ de recherche à l'ouverture
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  // Garde l'option active visible pendant la navigation clavier
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      // Empêche l'envoi du formulaire principal
      e.preventDefault();
      if (visible[activeIndex]) pick(visible[activeIndex].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </span>

      <button
        type="button"
        onClick={toggle}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full h-full pl-9 pr-8 py-3 bg-gray-50 text-gray-900 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium text-left truncate transition-colors ${
          open ? "border-orange-500 ring-2 ring-orange-500" : "border-gray-200"
        }`}
      >
        <span className="block truncate">
          {loading && !selected
            ? "Chargement..."
            : (selected?.label ?? allLabel)}
        </span>
      </button>
      <ChevronDown
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />

      {open && (
        <div
          className={`absolute z-50 mt-2 w-[calc(200%+0.75rem)] ${panelClassName} ${
            align === "right" ? "right-0" : "left-0"
          } bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden`}
        >
          {/* Zone de recherche */}
          <div className="p-2 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onSearchKeyDown}
                enterKeyHint="search"
                autoComplete="off"
                placeholder={placeholderSearch}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Liste */}
          <ul
            ref={listRef}
            role="listbox"
            aria-label={ariaLabel}
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500">
                Chargement...
              </li>
            ) : visible.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500">
                Aucun résultat
              </li>
            ) : (
              visible.map((it, i) => {
                const isSelected = it.value === value;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={`${it.value}-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    data-index={i}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => pick(it.value)}
                    className={`flex items-start gap-2 px-4 py-2.5 cursor-pointer transition-colors ${
                      isActive ? "bg-orange-50" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm leading-snug break-words ${
                          it.value === ""
                            ? "font-medium text-gray-600"
                            : "font-bold text-gray-900"
                        } ${isSelected ? "text-orange-700" : ""}`}
                      >
                        {it.label}
                      </p>
                      {it.description && (
                        <p className="mt-0.5 text-xs leading-snug font-normal text-gray-500 break-words">
                          {shorten(it.description, 80)}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-orange-700" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ChallengeSearchBox({
  initialQ = "",
  initialDomaine = "",
  initialVille = "",
  className = "",
}: {
  initialQ?: string;
  initialDomaine?: string;
  initialVille?: string;
  className?: string;
}) {
  const router = useRouter();
  const { options, loading, reload } = useFiltreOptions();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [domaine, setDomaine] = useState(initialDomaine);
  const [ville, setVille] = useState(initialVille);

  // Resynchronise les champs quand l'URL change (nouvelle recherche sur la page de résultats)
  useEffect(() => {
    setQ(initialQ);
    setDomaine(initialDomaine);
    setVille(initialVille);
  }, [initialQ, initialDomaine, initialVille]);

  // Précharge la page de résultats : le clic devient quasi instantané
  useEffect(() => {
    router.prefetch(RESULTS_PATH);
  }, [router]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (domaine) params.set("domaine", domaine);
    if (ville) params.set("lieu", ville);
    const qs = params.toString();

    // isPending passe à true immédiatement : le bouton réagit au clic
    startTransition(() => {
      router.push(qs ? `${RESULTS_PATH}?${qs}` : RESULTS_PATH);
    });
  };

  const domaineItems: SelectItem[] =
    options?.domaines.map((d) => ({
      value: String(d.id),
      label: d.nom,
      description: d.description || undefined,
    })) ?? [];

  const villeItems: SelectItem[] =
    options?.lieux
      .filter((l) => l !== "Partout")
      .map((l) => ({ value: l, label: l })) ?? [];

  return (
    <form
      onSubmit={submit}
      className={`bg-white p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-3 md:flex-row md:items-stretch ${className}`}
    >
      {/* Mot-clé */}
      <div className="relative md:flex-[2]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          enterKeyHint="search"
          placeholder="Rechercher par titre ou description"
          className="w-full pl-10 pr-3 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium"
        />
      </div>

      {/* Domaine + Ville : sur la même ligne */}
      <div className="grid grid-cols-2 gap-3 md:flex-[2]">
        <SearchableSelect
          icon={<Briefcase className="h-4 w-4" />}
          value={domaine}
          onChange={setDomaine}
          items={domaineItems}
          allLabel="Tous les domaines"
          placeholderSearch="Rechercher un domaine"
          ariaLabel="Domaine"
          loading={loading}
          onOpen={() => !options && reload()}
          align="left"
          panelClassName="md:w-[26rem]"
        />

        <SearchableSelect
          icon={<MapPin className="h-4 w-4" />}
          value={ville}
          onChange={setVille}
          items={villeItems}
          allLabel="Toutes les villes"
          placeholderSearch="Rechercher une ville"
          ariaLabel="Ville"
          loading={loading}
          onOpen={() => !options && reload()}
          align="right"
          panelClassName="md:w-72"
        />
      </div>

      {/* Bouton */}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-8 py-3 bg-orange-700 text-white font-bold rounded-xl hover:bg-orange-800 active:scale-95 transition-all shadow-lg shadow-orange-700/20 disabled:opacity-80 w-full md:w-auto"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        {isPending ? "Recherche..." : "Rechercher"}
      </button>
    </form>
  );
}
