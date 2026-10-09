import { AyatPekanCard } from "@/components/AyatPekanCard";
import { Section } from "@/components/ui/Section";

/**
 * "Ayat Pekan Ini" (Server Component): kerangka section saja.
 * Bagian interaktif (kartu ayat, buka/tutup lima ayat, murottal) ada di
 * components/AyatPekanCard.tsx ("use client"), karena ayat hari ini
 * bergantung pada tanggal WIB pengunjung.
 */
export function QuranVerseCard() {
  return (
    <Section
      id="ayat"
      title="Ayat Pekan Ini"
      intro="Lima ayat untuk ditadabburi bersama pada kajian Ahad pagi: satu ayat setiap hari, Senin sampai Jumat. Sabtu dan Ahad untuk muraja'ah."
    >
      <AyatPekanCard />
    </Section>
  );
}
