"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const INTERVAL_MS = 6000;

export interface HeroImage {
  src: string;
  alt: string;
}

/**
 * Seule partie interactive du hero : alternance des visuels et pastilles. Le titre, le texte et les boutons du hero restent
 * rendus par le serveur (aucune fonction de fusion de classes ni donnée de marque côté client : poids de l'accueil, ADR-040).
 * Sans lecture automatique si l'utilisateur préfère moins d'animations.
 */
export function HeroImages({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count]);

  return (
    <>
      {images.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt={i === index ? img.alt : ""}
          aria-hidden={i !== index}
          fill
          sizes="100vw"
          priority={i === 0}
          className={`-z-20 object-cover transition-opacity duration-1000 motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher le visuel ${i + 1} sur ${count}`}
              aria-current={i === index}
              className="flex size-11 items-center justify-center rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className={`block size-2.5 rounded-full border border-inverse-foreground transition-colors ${i === index ? "bg-inverse-foreground" : "bg-transparent"}`} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
