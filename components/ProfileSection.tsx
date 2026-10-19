import { PillarIconSvg } from "@/components/ProfileIcons";
import { MasjidSiluet } from "@/components/ui/MasjidSiluet";
import { Rosette } from "@/components/ui/Rosette";
import { Section } from "@/components/ui/Section";
import { BelahKetupat } from "@/components/ui/BelahKetupat";
import { StarMark } from "@/components/ui/StarMark";
import { PROFILE } from "@/data/profile";

const subjudul = "text-2xl font-semibold text-brand sm:text-[1.75rem]";

/**
 * Section "Tentang Kami" (id="profil"). Server Component; seluruh teks diambil
 * dari data/profile.ts. Empat blok: Sekilas Profil, Visi & Misi,
 * Empat Pilar Pergerakan, dan Divisi Operasional.
 *
 * Tiap blok punya bentuknya sendiri (bukan deret kartu yang sama): angka dalam prasasti
 * berbingkai, Visi di panel langit malam, Misi sebagai daftar bernomor rosette bergaris emas,
 * Empat Pilar sebagai satu panel berbingkai yang dibagi garis emas, Divisi sebagai daftar bergaris.
 */
export function ProfileSection() {
  const { sekilas, visi, misi, pilar, divisi } = PROFILE;

  return (
    <Section id="profil" title="Tentang Kami" ornament kepala="ringan">
      {/* Blok 1: Sekilas Profil + angka sorotan */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:gap-14 huge:lg:grid-cols-1 simple:lg:grid-cols-1">
        <div className="max-w-[68ch]">
          <h3 className={subjudul}>{sekilas.judul}</h3>
          {sekilas.paragraf.map((teks, i) => (
            <p
              key={teks.slice(0, 24)}
              className={`mt-4 leading-relaxed text-ink ${i === 0 ? "text-xl" : "text-lg"}`}
            >
              {teks}
            </p>
          ))}
        </div>

        {/* Prasasti: tiga angka dalam bingkai iluminasi, dipisah garis daun emas tipis. */}
        <ul
          role="list"
          aria-label="Sekilas dalam angka"
          className="bingkai grid grid-cols-1 self-center rounded-card bg-card px-6 py-2 shadow-card sm:grid-cols-3 sm:px-2 lg:grid-cols-1 lg:px-7 huge:sm:grid-cols-1 simple:sm:grid-cols-1"
        >
          {sekilas.sorotan.map((s) => (
            <li
              key={s.nilai}
              className="border-line py-5 not-last:border-b sm:not-last:border-b-0 sm:not-last:border-r sm:px-5 lg:not-last:border-r-0 lg:not-last:border-b lg:px-0 huge:sm:not-last:border-r-0 huge:sm:not-last:border-b simple:sm:not-last:border-r-0 simple:sm:not-last:border-b"
            >
              <p className="font-display text-5xl font-semibold leading-none text-brand">
                {s.nilai}
              </p>
              <p className="mt-2 text-lg leading-snug text-ink-soft">{s.keterangan}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Blok 2: Visi (panel langit malam selebar konten) lalu Misi (daftar bernomor rosette, bergaris emas) */}
      <div className="mt-14 md:mt-16">
        <div className="bingkai on-dark relative overflow-hidden rounded-card bg-brand-deep px-6 py-9 text-on-brand shadow-elev-2 sm:px-11 sm:py-11 hc:border-4 hc:border-gold">
          <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
          {/* Tanda air: siluet MRPI dalam garis cahaya fajar, sangat samar di sudut kanan bawah. */}
          <MasjidSiluet className="pointer-events-none absolute -right-6 bottom-0 h-[78%] w-auto max-w-[60%] text-gold/10 hc:hidden simple:hidden" />
          <div className="relative">
            <h3 className="flex items-center gap-3 text-3xl font-semibold text-gold-soft">
              <StarMark className="size-7 shrink-0 text-gold" />
              {visi.judul}
            </h3>
            <ul
              role="list"
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10 huge:md:grid-cols-1 simple:md:grid-cols-1"
            >
              {visi.poin.map((teks) => (
                <li key={teks.slice(0, 24)} className="flex gap-3.5 text-xl leading-relaxed">
                  <BelahKetupat className="mt-[0.7em] text-gold" />
                  <span className="min-w-0">{teks}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className={`mt-12 ${subjudul}`}>{misi.judul}</h3>
        <ol
          role="list"
          className="mt-4 grid grid-cols-1 border-b border-gilt/35 md:grid-cols-2 md:gap-x-12 huge:md:grid-cols-1 simple:md:grid-cols-1 hc:border-line"
        >
          {misi.poin.map((m, i) => (
            <li key={m.judul} className="flex gap-4 border-t border-gilt/35 py-5 sm:gap-5 sm:py-6 hc:border-line">
              <Rosette className="size-11 text-lg sm:size-12 sm:text-xl">{i + 1}</Rosette>
              <div className="min-w-0">
                <h4 className="text-xl font-semibold text-brand">{m.judul}</h4>
                <p className="mt-1.5 text-lg text-ink-soft">{m.isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/*
        Blok 3: Empat Pilar Pergerakan: satu panel berbingkai iluminasi, dibagi empat oleh garis emas
        tipis (celah 1px di atas latar emas), 2x2 di layar lebar.
      */}
      <div className="mt-14 md:mt-16">
        <h3 className={subjudul}>{pilar.judul}</h3>
        <ul
          role="list"
          className="bingkai mt-6 grid grid-cols-1 gap-px overflow-clip rounded-card bg-gilt/30 shadow-card md:grid-cols-2 simple:md:grid-cols-1 hc:gap-0.5 hc:bg-ink"
        >
          {pilar.poin.map((p) => (
            <li key={p.judul} className="bg-card p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-tint text-primary ring-1 ring-gilt/40 ring-offset-4 ring-offset-card">
                  <PillarIconSvg name={p.ikon} className="size-8" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xl font-semibold text-brand sm:text-2xl">{p.judul}</h4>
                  <p className="mt-0.5 text-base font-bold text-primary">{p.bidang}</p>
                </div>
              </div>
              <ul role="list" className="mt-5 space-y-3">
                {p.poin.map((teks) => (
                  <li key={teks.slice(0, 24)} className="flex gap-3.5 text-lg leading-relaxed text-ink">
                    <BelahKetupat className="mt-[0.75em] size-1.5 text-gilt hc:text-ink" />
                    <span className="min-w-0">{teks}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Blok 4: Divisi Operasional: daftar bergaris emas, dua kolom di layar lebar, tanpa dibuka-tutup */}
      <div className="mt-14 md:mt-16">
        <h3 className={subjudul}>{divisi.judul}</h3>
        <ul
          role="list"
          className="mt-4 grid grid-cols-1 border-b border-gilt/35 md:grid-cols-2 md:gap-x-12 simple:md:grid-cols-1 hc:border-line"
        >
          {divisi.poin.map((d) => (
            <li key={d.judul} className="border-t border-gilt/35 py-4 sm:py-5 hc:border-line">
              <h4 className="flex items-center gap-3 text-xl font-semibold text-brand">
                <BelahKetupat className="text-gilt hc:text-ink" />
                {d.judul}
              </h4>
              <p className="mt-1.5 pl-5 text-lg text-ink-soft">{d.isi}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
