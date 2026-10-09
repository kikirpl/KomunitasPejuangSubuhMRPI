import { PillarIconSvg } from "@/components/ProfileIcons";
import { Section } from "@/components/ui/Section";
import { StarMark } from "@/components/ui/StarMark";
import { PROFILE } from "@/data/profile";

const subjudul = "text-2xl font-semibold text-brand sm:text-[1.75rem]";

/**
 * Section "Tentang Kami" (id="profil"). Server Component; seluruh teks diambil
 * dari data/profile.ts. Empat blok: Sekilas Profil, Visi & Misi,
 * Empat Pilar Pergerakan, dan Divisi Operasional.
 */
export function ProfileSection() {
  const { sekilas, visi, misi, pilar, divisi } = PROFILE;

  return (
    <Section id="profil" label="Profil" title="Tentang Kami" ornament>
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

        <ul
          role="list"
          aria-label="Sekilas dalam angka"
          className="grid grid-cols-1 gap-6 self-center sm:grid-cols-3 lg:grid-cols-1 huge:sm:grid-cols-1 simple:sm:grid-cols-1"
        >
          {sekilas.sorotan.map((s) => (
            <li key={s.nilai} className="border-l-4 border-gold py-1 pl-5 hc:border-line">
              <p className="font-display text-5xl font-semibold leading-none text-brand">
                {s.nilai}
              </p>
              <p className="mt-2 text-lg leading-snug text-ink-soft">{s.keterangan}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Blok 2: Visi (kartu navy selebar konten) lalu Misi (4 kartu bernomor, 2x2) */}
      <div className="mt-14 md:mt-16">
        <div className="on-dark relative overflow-hidden rounded-3xl bg-brand-deep px-6 py-8 text-on-brand shadow-card sm:px-10 sm:py-10 hc:border-4 hc:border-gold">
          <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gold" />
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
                <li key={teks.slice(0, 24)} className="flex gap-3 text-xl leading-relaxed">
                  <StarMark className="mt-2 size-4 shrink-0 text-gold" />
                  <span className="min-w-0">{teks}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className={`mt-10 ${subjudul}`}>{misi.judul}</h3>
        <ol
          role="list"
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 huge:md:grid-cols-1 simple:md:grid-cols-1"
        >
          {misi.poin.map((m, i) => (
            <li
              key={m.judul}
              className="flex gap-4 rounded-2xl border border-line-soft bg-card p-5 shadow-card hc:border-2 hc:border-line"
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-gold bg-gold-tint font-display text-xl font-semibold text-brand hc:border-line"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-xl font-semibold text-brand">{m.judul}</h4>
                <p className="mt-1.5 text-lg text-ink-soft">{m.isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Blok 3: Empat Pilar Pergerakan (2x2 di layar lebar agar teks tidak terlalu sempit) */}
      <div className="mt-14 md:mt-16">
        <h3 className={subjudul}>{pilar.judul}</h3>
        <ul
          role="list"
          className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 simple:md:grid-cols-1"
        >
          {pilar.poin.map((p) => (
            <li
              key={p.judul}
              className="rounded-2xl border border-line bg-card p-6 shadow-card sm:p-7 hc:border-2"
            >
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-tint text-primary ring-1 ring-line-soft">
                  <PillarIconSvg name={p.ikon} className="size-8" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xl font-semibold text-brand sm:text-2xl">{p.judul}</h4>
                  <p className="mt-0.5 text-base font-bold text-primary">{p.bidang}</p>
                </div>
              </div>
              <ul role="list" className="mt-5 space-y-3 border-t border-line-soft pt-5">
                {p.poin.map((teks) => (
                  <li key={teks.slice(0, 24)} className="flex gap-3 text-lg leading-relaxed text-ink">
                    <span
                      aria-hidden="true"
                      className="mt-3 size-1.5 shrink-0 rotate-45 bg-gold hc:bg-line"
                    />
                    <span className="min-w-0">{teks}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Blok 4: Divisi Operasional (kartu ringkas, rapi di ponsel tanpa perlu dibuka-tutup) */}
      <div className="mt-14 md:mt-16">
        <h3 className={subjudul}>{divisi.judul}</h3>
        <ul role="list" className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 simple:md:grid-cols-1">
          {divisi.poin.map((d) => (
            <li
              key={d.judul}
              className="rounded-r-2xl border-l-4 border-gold bg-paper-2 px-5 py-4 hc:border-2 hc:border-l-4 hc:border-line"
            >
              <h4 className="text-xl font-semibold text-brand">{d.judul}</h4>
              <p className="mt-1.5 text-lg text-ink-soft">{d.isi}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
