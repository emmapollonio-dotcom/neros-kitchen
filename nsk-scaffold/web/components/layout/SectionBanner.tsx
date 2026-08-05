import Image from "next/image";

interface Props {
  image: string;
  /** Testo alternativo, sempre vuoto di default: immagine puramente
   * decorativa, il titolo vero resta nell'h1 della pagina sotto la fascia. */
  alt?: string;
}

// Fascia fotografica decorativa da inserire in cima alle pagine di lavoro
// (dashboard, ricette, food cost, HACCP, ecc.), dentro il contenitore
// max-w-content px-6 py-14 già usato da quelle pagine: -mx-6 -mt-14 la fa
// arrivare ai bordi del contenitore senza sfondare il viewport, mantenendo
// intatti eyebrow/h1/p esistenti subito sotto (nessuna modifica al resto
// della pagina). Sfuma verso lo sfondo scuro con lo stesso charcoal della
// shell, così il bordo inferiore non "stacca".
export function SectionBanner({ image, alt = "" }: Props) {
  return (
    <div className="relative -mx-6 -mt-14 mb-8 h-40 overflow-hidden sm:h-52">
      <Image src={image} alt={alt} fill sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-charcoal/40" />
    </div>
  );
}
