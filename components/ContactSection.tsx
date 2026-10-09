import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { buttonClass } from "@/components/ui/buttonStyles";
import { CONTACT } from "@/data/content";

const card =
  "rounded-2xl border border-line bg-card p-6 shadow-card md:p-8 hc:border-2";

/** Kontak admin (WhatsApp hanya untuk bertanya) serta alamat dan telepon masjid. */
export function ContactSection() {
  const whatsappHref = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(
    CONTACT.whatsappMessage,
  )}`;

  return (
    <Section
      id="kontak"
      title="Hubungi Admin"
      intro="Bingung soal jadwal atau informasi masjid? Silakan bertanya."
      isSample={CONTACT.isSample}
      tone="alt"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 simple:lg:grid-cols-1">
        <article className={`${card} flex flex-col`}>
          <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold text-brand">
            <MessageCircle aria-hidden className="size-8 shrink-0" />
            Tanya lewat WhatsApp
          </h3>
          <p className="mb-7 mt-4 text-xl">
            WhatsApp admin hanya untuk <strong>bertanya jadwal dan informasi masjid</strong>.
            Untuk berinfak, cukup scan QRIS atau transfer, tanpa perlu menghubungi admin.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("primary", "xl", "mt-auto w-full")}
          >
            <MessageCircle aria-hidden className="size-8" />
            <span>
              Tanya Admin via WhatsApp
              <span className="sr-only"> (terbuka di jendela baru)</span>
            </span>
          </a>
        </article>

        <article className={card}>
          <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold text-brand">
            <MapPin aria-hidden className="size-8 shrink-0" />
            Alamat dan Telepon
          </h3>
          <address className="mt-4 text-xl not-italic">
            {CONTACT.addressLines.map((line, index) => (
              <span
                key={line}
                className={`block ${index === 0 ? "font-bold" : ""}`}
              >
                {line}
              </span>
            ))}
          </address>
          <p className="mt-4 text-xl">
            Telepon:{" "}
            <strong className="font-display text-2xl font-semibold tabular-nums">
              {CONTACT.phoneDisplay}
            </strong>
          </p>
          <div className="mt-7 flex flex-col gap-4">
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline", "lg", "flex-1")}
            >
              <MapPin aria-hidden className="size-6" />
              <span>
                Lihat di Peta
                <span className="sr-only"> (terbuka di jendela baru)</span>
              </span>
            </a>
            <a
              href={`tel:${CONTACT.phoneTel}`}
              className={buttonClass("outline", "lg", "flex-1")}
            >
              <Phone aria-hidden className="size-6" />
              Telepon Masjid
            </a>
          </div>
        </article>
      </div>
    </Section>
  );
}
