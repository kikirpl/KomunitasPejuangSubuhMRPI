"use client";

import { useEffect } from "react";

/**
 * Parallax penunjuk untuk adegan beranda: lapisan langit, pepohonan, masjid, dan latar depan
 * bergeser sedikit berbeda mengikuti posisi mouse, sehingga adegan terasa punya kedalaman.
 * Hanya hiasan: tidak mengubah isi, tidak menangkap klik, dan hanya aktif pada perangkat
 * bermouse (bukan layar sentuh) yang tidak meminta "kurangi gerakan". Parallax saat menggulir
 * dikerjakan CSS (animation-timeline), bukan di sini.
 */
export function HeroParallax() {
  useEffect(() => {
    const hero = document.getElementById("beranda");
    const scene = hero?.querySelector<HTMLElement>(".hero-scene");
    if (!hero || !scene) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      scene.style.setProperty("--mx", x.toFixed(3));
      scene.style.setProperty("--my", y.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      if (reduce.matches || !finePointer.matches || event.pointerType !== "mouse") return;
      const box = hero.getBoundingClientRect();
      x = ((event.clientX - box.left) / box.width) * 2 - 1;
      y = ((event.clientY - box.top) / box.height) * 2 - 1;
      schedule();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      schedule();
    };

    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
