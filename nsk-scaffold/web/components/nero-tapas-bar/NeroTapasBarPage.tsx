"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  X,
  ArrowUp,
  Facebook,
  Instagram,
  Twitter,
  Salad,
  Beef,
  Fish,
  Sandwich,
  Wine,
  Martini,
  Beer,
  Coffee,
} from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

// Pagina standalone che replica il sito reale del ristorante di Emmanuele
// (neroskitchen.co.uk / "Nero's Tapas Bar", Denton) come vera pagina Next.js
// dentro N'sK, non come file HTML statico separato. Vive fuori da
// app/(marketing) apposta: ha nav/footer/palette proprie (nero+oro), non
// quelle condivise di SiteHeader/SiteFooter — stesso pattern della landing
// principale (vedi components/landing/LandingNav.tsx).

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80",
];

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

const FOOD_ITEMS = [
  { icon: Salad, title: "Mezze & Tapas", body: "Hummus, patatas bravas, halloumi, dolmades and more, made to share.", price: "From £4.50" },
  { icon: Beef, title: "Chargrilled Meats", body: "Lamb chops, chicken souvlaki and mixed grill platters, cooked over charcoal.", price: "From £12.90" },
  { icon: Fish, title: "From the Sea", body: "Grilled sea bass, calamari and prawns with a Mediterranean twist.", price: "From £14.50" },
  { icon: Sandwich, title: "Gourmet Burgers", body: "Hand-pressed patties, brioche buns and house-made sauces.", price: "From £10.90" },
];

const DRINKS_ITEMS = [
  { icon: Wine, title: "Wine List", body: "Curated reds, whites and rosés from Mediterranean vineyards.", price: "From £5.90" },
  { icon: Martini, title: "Signature Cocktails", body: "House cocktails inspired by the flavours of the coast.", price: "From £8.50" },
  { icon: Beer, title: "Craft Beer", body: "A rotating selection of local and imported craft beers.", price: "From £4.90" },
  { icon: Coffee, title: "Coffee & Tea", body: "Freshly brewed coffee and a selection of loose leaf teas.", price: "From £2.90" },
];

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80", alt: "Bistecca alla griglia" },
  { src: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80", alt: "Spiedini grigliati" },
  { src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=900&q=80", alt: "Tagliere di salumi e formaggi" },
  { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80", alt: "Pizza appena sfornata" },
  { src: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80", alt: "Gourmet burger" },
  { src: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=900&q=80", alt: "Sala del ristorante" },
  { src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80", alt: "Piatto mediterraneo" },
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80", alt: "Interno del ristorante" },
];

const OPENING_HOURS = [
  { day: "Mon", hours: "Closed" },
  { day: "Tue", hours: "Closed" },
  { day: "Wed – Thu", hours: "4pm – 11pm" },
  { day: "Fri – Sat", hours: "12pm – 12am" },
  { day: "Sun", hours: "12pm – 11pm" },
];

export function NeroTapasBarPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [menuTab, setMenuTab] = useState<"food" | "drinks">("food");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Nav sticky compatta + back-to-top: entrambi appaiono dopo 260px di scroll,
  // stesso comportamento del sito originale.
  useEffect(() => {
    function onScroll() {
      setStickyVisible(window.scrollY > 260);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Carosello hero: crossfade automatico ogni 5.5s, si riavvia se l'utente
  // clicca manualmente un dot.
  const startHeroTimer = useCallback(() => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    heroTimerRef.current = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5500);
  }, []);

  useEffect(() => {
    startHeroTimer();
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    };
  }, [startHeroTimer]);

  function goToSlide(index: number) {
    setHeroSlide(index);
    startHeroTimer();
  }

  // Evidenzia la voce di nav attiva in base alla sezione visibile.
  useEffect(() => {
    const sectionIds = ["home", "about", "gallery", "contact"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || lightboxSrc ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, lightboxSrc]);

  function openMenuTab(tab: "food" | "drinks") {
    setMenuTab(tab);
    document.getElementById("menus")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormSubmitted(true);
    event.currentTarget.reset();
  }

  const menuItems = menuTab === "food" ? FOOD_ITEMS : DRINKS_ITEMS;

  return (
    <div className="bg-[#111110] text-[#f6f1e7] font-body">
      {/* ============ TOP INFO BAR + NAV PRINCIPALE ============ */}
      <header className="relative z-40">
        <div className="bg-[#080807] border-b border-white/5">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a165]/40 text-[#c8a165] shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <div className="text-sm leading-snug">
                <p className="text-[#b7b2a7]">11-15 Ashton Rd, Denton,</p>
                <p className="text-[#b7b2a7]">Manchester M34 3LF</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a165]/40 text-[#c8a165] shrink-0">
                <Mail className="w-4 h-4" />
              </span>
              <div className="text-sm leading-snug">
                <p className="text-[#ddc190]/90">Email</p>
                <a href="mailto:info@neroskitchen.co.uk" className="text-[#b7b2a7] hover:text-[#c8a165] transition-colors">
                  info@neroskitchen.co.uk
                </a>
              </div>
            </div>

            <div className="order-first w-full md:w-auto md:order-none flex-1 text-center">
              <a href="#home" className="font-display text-2xl md:text-3xl tracking-wide text-[#c8a165]">
                NERO&rsquo;S TAPAS BAR
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a165]/40 text-[#c8a165] shrink-0">
                <Phone className="w-4 h-4" />
              </span>
              <div className="text-sm leading-snug">
                <p className="text-[#ddc190]/90">Phone Call Us</p>
                <a href="tel:07876616894" className="text-[#b7b2a7] hover:text-[#c8a165] transition-colors">
                  07876616894
                </a>
              </div>
            </div>

            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 border border-[#c8a165] text-[#c8a165] text-xs tracking-[0.22em] uppercase px-6 py-3 hover:bg-[#c8a165] hover:text-[#111110] transition-colors"
            >
              Book a Table
            </a>
          </div>
        </div>

        <nav className="bg-[#111110]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-20 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Apri il menu"
              aria-expanded={mobileMenuOpen}
              className="flex flex-col gap-1.5 lg:hidden"
            >
              <span className="block w-7 h-px bg-[#c8a165]" />
              <span className="block w-7 h-px bg-[#c8a165]" />
              <span className="block w-5 h-px bg-[#c8a165]" />
            </button>

            <ul className="hidden lg:flex items-center gap-10 text-sm tracking-[0.22em] uppercase font-body mx-auto">
              <li>
                <a href="#home" className={`relative pb-1.5 transition-colors ${activeSection === "home" ? "text-[#c8a165]" : "text-[#f6f1e7] hover:text-[#c8a165]"}`}>
                  Home
                </a>
              </li>
              <li className="relative group">
                <button className="flex items-center gap-1.5 text-[#f6f1e7] hover:text-[#c8a165] transition-colors" aria-haspopup="true">
                  Menus <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <ul className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-48 bg-[#171715] border border-white/10 shadow-xl py-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 normal-case tracking-normal">
                  <li>
                    <button onClick={() => openMenuTab("food")} className="block w-full text-left px-5 py-3 text-xs tracking-[0.22em] uppercase text-[#b7b2a7] hover:text-[#c8a165] hover:bg-white/5 transition-colors">
                      Food Menu
                    </button>
                  </li>
                  <li>
                    <button onClick={() => openMenuTab("drinks")} className="block w-full text-left px-5 py-3 text-xs tracking-[0.22em] uppercase text-[#b7b2a7] hover:text-[#c8a165] hover:bg-white/5 transition-colors">
                      Drinks Menu
                    </button>
                  </li>
                </ul>
              </li>
              {NAV_LINKS.slice(1).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`relative pb-1.5 transition-colors ${
                      activeSection === link.href.slice(1) ? "text-[#c8a165]" : "text-[#f6f1e7] hover:text-[#c8a165]"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="tel:07876616894"
              aria-label="Chiama il ristorante"
              className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-[#c8a165]/40 text-[#c8a165] hover:bg-[#c8a165] hover:text-[#111110] transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </nav>
      </header>

      {/* ============ NAV STICKY COMPATTA ============ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 bg-[#111110]/95 backdrop-blur border-b border-white/10 transition-transform duration-400 ease-out ${
          stickyVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-[72px] flex items-center justify-between">
          <a href="#home" className="font-display text-xl tracking-wide text-[#c8a165]">
            NERO&rsquo;S TAPAS BAR
          </a>

          <ul className="hidden lg:flex items-center gap-9 text-[13px] tracking-[0.22em] uppercase font-body">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-[#f6f1e7] hover:text-[#c8a165] transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="tel:07876616894"
              aria-label="Chiama il ristorante"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c8a165]/40 text-[#c8a165] hover:bg-[#c8a165] hover:text-[#111110] transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Apri il menu"
              aria-expanded={mobileMenuOpen}
              className="flex flex-col gap-1.5 lg:hidden"
            >
              <span className="block w-7 h-px bg-[#c8a165]" />
              <span className="block w-7 h-px bg-[#c8a165]" />
              <span className="block w-5 h-px bg-[#c8a165]" />
            </button>
          </div>
        </div>
      </nav>

      {/* ============ MENU MOBILE ============ */}
      <div
        className={`fixed inset-0 z-[60] bg-[#080807] flex flex-col transition-transform duration-500 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
          <span className="font-display text-xl tracking-wide text-[#c8a165]">NERO&rsquo;S TAPAS BAR</span>
          <button onClick={() => setMobileMenuOpen(false)} aria-label="Chiudi il menu" className="text-[#c8a165]">
            <X className="w-7 h-7" />
          </button>
        </div>
        <ul className="flex-1 flex flex-col items-center justify-center gap-8 text-lg tracking-[0.22em] uppercase font-body">
          <li>
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-[#f6f1e7] hover:text-[#c8a165] transition-colors">
              Home
            </a>
          </li>
          <li>
            <a href="#menus" onClick={() => setMobileMenuOpen(false)} className="text-[#f6f1e7] hover:text-[#c8a165] transition-colors">
              Menus
            </a>
          </li>
          <li>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[#f6f1e7] hover:text-[#c8a165] transition-colors">
              About Us
            </a>
          </li>
          <li>
            <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="text-[#f6f1e7] hover:text-[#c8a165] transition-colors">
              Gallery
            </a>
          </li>
          <li>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-[#f6f1e7] hover:text-[#c8a165] transition-colors">
              Contact
            </a>
          </li>
        </ul>
        <div className="pb-10 flex justify-center gap-6 text-[#c8a165]">
          <a href="#" aria-label="Facebook" className="hover:opacity-70">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:opacity-70">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" aria-label="Twitter" className="hover:opacity-70">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>

      <main>
        {/* ============ HERO ============ */}
        <section id="home" className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
          {HERO_IMAGES.map((src, i) => (
            <div key={src} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${heroSlide === i ? "opacity-100" : "opacity-0"}`}>
              <Image src={src} alt="" fill sizes="100vw" priority={i === 0} className="object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111110] via-[#111110]/60 to-[#111110]/30" />

          <div className="relative z-10 h-full flex items-center justify-center px-6">
            <div className="max-w-4xl text-center">
              <p className="font-display italic text-[#c8a165] text-lg md:text-xl mb-4">Mediterranean Tapas Experience</p>
              <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl leading-tight text-[#f6f1e7] mb-6">
                WHERE EVERY FLAVOR
                <br className="hidden sm:block" /> TELLS A STORY
              </h1>
              <p className="text-[#b7b2a7] text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Craving some delicious Mediterranean food? Maybe you&rsquo;re in the mood for a juicy steak? No matter what kind of meal you have in mind, Nero&rsquo;s Kitchen is ready to prepare it for you.
              </p>
              <a
                href="#menus"
                className="inline-flex items-center gap-3 border border-[#c8a165] text-[#f6f1e7] text-xs tracking-[0.22em] uppercase px-8 py-4 hover:bg-[#c8a165] hover:text-[#111110] transition-colors"
              >
                Main Menu
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 inset-x-0 flex justify-center gap-3 z-10">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${heroSlide === i ? "bg-[#c8a165]" : "bg-white/30"}`}
              />
            ))}
          </div>
        </section>

        {/* ============ ABOUT ============ */}
        <section id="about" className="bg-[#111110] py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <p className="font-display italic text-[#c8a165] text-lg mb-3">About Restaurant</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight text-[#f6f1e7] mb-6">MEDITERRANEAN TAPAS &amp; GRILL IN DENTON</h2>
              <div className="relative w-40 h-px bg-gradient-to-r from-[#c8a165] to-transparent mb-6 before:content-[''] before:absolute before:-left-1.5 before:top-1/2 before:h-2.5 before:w-2.5 before:-translate-y-1/2 before:rotate-45 before:bg-[#c8a165]" />
              <p className="font-display italic text-[#ddc190] text-lg mb-6">Sunshine on a plate &mdash; right in the heart of Greater Manchester.</p>
              <p className="text-[#b7b2a7] leading-relaxed mb-5">
                We see every guest as part of our story. Whether it&rsquo;s breakfast, brunch, or dinner, our menu is inspired by the bold, vibrant flavours of the Mediterranean.
              </p>
              <p className="text-[#b7b2a7] leading-relaxed mb-9">
                From mezze and tapas to gourmet burgers and chargrilled meats &mdash; each dish is made with care, using seasonal ingredients from trusted local suppliers.
              </p>
              <a
                href="#menus"
                className="inline-flex items-center gap-3 border border-[#c8a165] text-[#f6f1e7] text-xs tracking-[0.22em] uppercase px-8 py-4 hover:bg-[#c8a165] hover:text-[#111110] transition-colors"
              >
                More About Us
              </a>
            </Reveal>
            <Reveal index={1}>
              <div className="relative w-full h-[520px]">
                <Image
                  src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80"
                  alt="Tagliere di salumi, formaggi e olive con due calici di vino rosato"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ MENUS ============ */}
        <section id="menus" className="bg-[#080807] py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-display italic text-[#c8a165] text-lg mb-3">Our Menu</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#f6f1e7] mb-6">TASTE THE MEDITERRANEAN</h2>
              <div className="relative w-40 h-px bg-gradient-to-r from-[#c8a165] to-transparent mx-auto before:content-[''] before:absolute before:-left-1.5 before:top-1/2 before:h-2.5 before:w-2.5 before:-translate-y-1/2 before:rotate-45 before:bg-[#c8a165]" />
            </div>

            <div className="flex justify-center gap-4 mb-14">
              <button
                onClick={() => setMenuTab("food")}
                className={`border border-[#c8a165] px-8 py-3 text-xs tracking-[0.22em] uppercase transition-colors ${
                  menuTab === "food" ? "bg-[#c8a165] text-[#111110]" : "text-[#c8a165] hover:bg-[#c8a165] hover:text-[#111110]"
                }`}
              >
                Food Menu
              </button>
              <button
                onClick={() => setMenuTab("drinks")}
                className={`border border-[#c8a165] px-8 py-3 text-xs tracking-[0.22em] uppercase transition-colors ${
                  menuTab === "drinks" ? "bg-[#c8a165] text-[#111110]" : "text-[#c8a165] hover:bg-[#c8a165] hover:text-[#111110]"
                }`}
              >
                Drinks Menu
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {menuItems.map((item, i) => (
                <Reveal key={item.title} index={i}>
                  <div className="bg-[#171715] border border-white/5 p-8 hover:border-[#c8a165]/40 transition-colors h-full">
                    <item.icon className="w-8 h-8 text-[#c8a165] mb-5" />
                    <h3 className="font-display text-xl text-[#f6f1e7] mb-3">{item.title}</h3>
                    <p className="text-[#b7b2a7] text-sm leading-relaxed mb-5">{item.body}</p>
                    <p className="font-display text-[#c8a165] text-lg">{item.price}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ GALLERY ============ */}
        <section id="gallery" className="bg-[#111110] py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-display italic text-[#c8a165] text-lg mb-3">Gallery</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#f6f1e7] mb-6">A GLIMPSE OF NERO&rsquo;S</h2>
              <div className="relative w-40 h-px bg-gradient-to-r from-[#c8a165] to-transparent mx-auto before:content-[''] before:absolute before:-left-1.5 before:top-1/2 before:h-2.5 before:w-2.5 before:-translate-y-1/2 before:rotate-45 before:bg-[#c8a165]" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GALLERY_IMAGES.map((img, i) => (
                <Reveal key={img.src} index={i}>
                  <button
                    onClick={() => {
                      setLightboxSrc(img.src.replace("w=900", "w=1600"));
                      setLightboxAlt(img.alt);
                    }}
                    className="relative w-full h-56 overflow-hidden group block"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox galleria */}
        {lightboxSrc && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-6"
            onClick={() => setLightboxSrc(null)}
          >
            <button
              onClick={() => setLightboxSrc(null)}
              aria-label="Chiudi immagine"
              className="absolute top-6 right-6 text-[#c8a165]"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative max-h-[85vh] max-w-[90vw] w-[900px] aspect-[4/3]" onClick={(e) => e.stopPropagation()}>
              <Image src={lightboxSrc} alt={lightboxAlt} fill sizes="90vw" className="object-contain" />
            </div>
          </div>
        )}

        {/* ============ OPENING HOURS ============ */}
        <section className="bg-[#080807] py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
            <Reveal className="order-2 lg:order-1">
              <div className="relative w-full h-[460px]">
                <Image
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
                  alt="Piatto di carne stufata con vino bianco sul tavolo"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal index={1} className="order-1 lg:order-2">
              <h2 className="font-display text-4xl md:text-5xl text-[#f6f1e7] mb-6">OPEN TIME HOURS</h2>
              <p className="font-display italic text-[#ddc190] text-lg mb-10 leading-relaxed">
                Come and experience the classy atmosphere with delicious food and music at Nero&rsquo;s Kitchen.
              </p>
              <p className="text-[#f6f1e7] text-sm tracking-[0.22em] uppercase mb-6">Opening Hour:</p>
              <ul className="space-y-4 text-[#b7b2a7]">
                {OPENING_HOURS.map((row, i) => (
                  <li
                    key={row.day}
                    className={`flex items-center justify-between max-w-sm pb-4 ${i < OPENING_HOURS.length - 1 ? "border-b border-white/10" : ""}`}
                  >
                    <span>{row.day}</span>
                    <span>{row.hours}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="bg-[#111110] py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-display italic text-[#c8a165] text-lg mb-3">Contact</p>
              <h2 className="font-display text-4xl md:text-5xl text-[#f6f1e7] mb-6">BOOK YOUR TABLE</h2>
              <div className="relative w-40 h-px bg-gradient-to-r from-[#c8a165] to-transparent mx-auto before:content-[''] before:absolute before:-left-1.5 before:top-1/2 before:h-2.5 before:w-2.5 before:-translate-y-1/2 before:rotate-45 before:bg-[#c8a165]" />
            </div>

            <div className="grid lg:grid-cols-2 gap-14">
              <Reveal>
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="ntb-name" className="sr-only">Nome</label>
                      <input id="ntb-name" name="name" type="text" required placeholder="Your name" className="w-full bg-transparent border border-white/15 focus:border-[#c8a165] focus:outline-none px-5 py-4 text-sm text-[#f6f1e7] placeholder:text-[#b7b2a7]/60 transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="ntb-email" className="sr-only">Email</label>
                      <input id="ntb-email" name="email" type="email" required placeholder="Your email" className="w-full bg-transparent border border-white/15 focus:border-[#c8a165] focus:outline-none px-5 py-4 text-sm text-[#f6f1e7] placeholder:text-[#b7b2a7]/60 transition-colors" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="ntb-phone" className="sr-only">Telefono</label>
                      <input id="ntb-phone" name="phone" type="tel" placeholder="Your phone" className="w-full bg-transparent border border-white/15 focus:border-[#c8a165] focus:outline-none px-5 py-4 text-sm text-[#f6f1e7] placeholder:text-[#b7b2a7]/60 transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="ntb-guests" className="sr-only">Numero ospiti</label>
                      <input id="ntb-guests" name="guests" type="number" min={1} placeholder="Number of guests" className="w-full bg-transparent border border-white/15 focus:border-[#c8a165] focus:outline-none px-5 py-4 text-sm text-[#f6f1e7] placeholder:text-[#b7b2a7]/60 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ntb-message" className="sr-only">Messaggio</label>
                    <textarea id="ntb-message" name="message" rows={4} placeholder="Your message" className="w-full bg-transparent border border-white/15 focus:border-[#c8a165] focus:outline-none px-5 py-4 text-sm text-[#f6f1e7] placeholder:text-[#b7b2a7]/60 transition-colors resize-none" />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 border border-[#c8a165] text-[#f6f1e7] text-xs tracking-[0.22em] uppercase px-8 py-4 hover:bg-[#c8a165] hover:text-[#111110] transition-colors"
                  >
                    Send Request
                  </button>
                  {formSubmitted && (
                    <p className="text-[#c8a165] text-sm pt-2">Thank you &mdash; we&rsquo;ll be in touch shortly to confirm your table.</p>
                  )}
                </form>
              </Reveal>

              <Reveal index={1} className="h-full min-h-[380px] border border-white/10 grayscale hover:grayscale-0 transition-all duration-500">
                <iframe
                  title="Mappa Nero's Tapas Bar, Denton"
                  className="w-full h-full min-h-[380px]"
                  loading="lazy"
                  src="https://maps.google.com/maps?q=11-15%20Ashton%20Rd%2C%20Denton%2C%20Manchester%20M34%203LF&t=&z=15&ie=UTF8&iwloc=&output=embed"
                />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#080807] border-t border-white/5 pt-20 pb-8">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div>
            <a href="#home" className="font-display text-2xl tracking-wide text-[#c8a165]">
              NERO&rsquo;S TAPAS BAR
            </a>
            <p className="text-[#b7b2a7] text-sm leading-relaxed mt-5">
              Mediterranean tapas and grill in the heart of Denton, Manchester &mdash; where every flavor tells a story.
            </p>
            <div className="flex gap-4 mt-6 text-[#c8a165]">
              <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a165]/30 hover:bg-[#c8a165] hover:text-[#111110] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a165]/30 hover:bg-[#c8a165] hover:text-[#111110] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a165]/30 hover:bg-[#c8a165] hover:text-[#111110] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-[#f6f1e7] text-sm tracking-[0.22em] uppercase mb-6">Quick Links</p>
            <ul className="space-y-3 text-[#b7b2a7] text-sm">
              <li><a href="#home" className="hover:text-[#c8a165] transition-colors">Home</a></li>
              <li><a href="#menus" className="hover:text-[#c8a165] transition-colors">Menus</a></li>
              <li><a href="#about" className="hover:text-[#c8a165] transition-colors">About Us</a></li>
              <li><a href="#gallery" className="hover:text-[#c8a165] transition-colors">Gallery</a></li>
              <li><a href="#contact" className="hover:text-[#c8a165] transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <p className="text-[#f6f1e7] text-sm tracking-[0.22em] uppercase mb-6">Opening Hours</p>
            <ul className="space-y-3 text-[#b7b2a7] text-sm">
              <li className="flex justify-between gap-6"><span>Mon &ndash; Tue</span><span>Closed</span></li>
              <li className="flex justify-between gap-6"><span>Wed &ndash; Thu</span><span>4pm &ndash; 11pm</span></li>
              <li className="flex justify-between gap-6"><span>Fri &ndash; Sat</span><span>12pm &ndash; 12am</span></li>
              <li className="flex justify-between gap-6"><span>Sun</span><span>12pm &ndash; 11pm</span></li>
            </ul>
          </div>

          <div>
            <p className="text-[#f6f1e7] text-sm tracking-[0.22em] uppercase mb-6">Contact</p>
            <ul className="space-y-4 text-[#b7b2a7] text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#c8a165] shrink-0 mt-0.5" />
                11-15 Ashton Rd, Denton, Manchester M34 3LF
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#c8a165] shrink-0" />
                <a href="tel:07876616894" className="hover:text-[#c8a165] transition-colors">07876616894</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#c8a165] shrink-0" />
                <a href="mailto:info@neroskitchen.co.uk" className="hover:text-[#c8a165] transition-colors">info@neroskitchen.co.uk</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8">
          <p className="text-center text-[#b7b2a7]/70 text-xs">&copy; {new Date().getFullYear()} Nero&rsquo;s Tapas Bar. All rights reserved.</p>
        </div>
      </footer>

      {/* ============ BACK TO TOP ============ */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Torna in cima"
        className={`fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#c8a165] text-[#111110] transition-all duration-300 hover:bg-[#9c7a45] ${
          stickyVisible ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
