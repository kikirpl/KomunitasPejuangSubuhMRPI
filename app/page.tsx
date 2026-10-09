import { AccessibilityBar } from "@/components/AccessibilityBar";
import { Announcements } from "@/components/Announcements";
import { ContactSection } from "@/components/ContactSection";
import { DonationSection } from "@/components/DonationSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MenuGrid } from "@/components/MenuGrid";
import { ProfileSection } from "@/components/ProfileSection";
import { QuranVerseCard } from "@/components/QuranVerseCard";
import { SiteHeader } from "@/components/SiteHeader";
import { TodaySchedule } from "@/components/TodaySchedule";
import { VideoGallery } from "@/components/VideoGallery";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { ZoomSection } from "@/components/ZoomSection";
import { loadPublicContent } from "@/lib/content";

/** Halaman dibuat ulang paling lama tiap 1 jam, dan seketika setiap pengurus menekan Simpan (revalidatePath). */
export const revalidate = 3600;

/**
 * Halaman utama. Urutan mengikuti fase PRD:
 *  Fase 4  Bilah aksesibilitas (paling atas, selalu terlihat)
 *  Fase 1  Sapaan, profil, jadwal hari ini, ayat pekan ini, jadwal sepekan
 *  Fase 2  Zoom, rekaman video, info donasi
 *  Fase 3  Pengumuman dan kontak admin
 *
 * Profil berada setelah sapaan (di layar kecil, setelah kisi Menu Utama yang
 * menjadi menu di ponsel) dan sebelum Rekaman Kajian.
 */
export default async function HomePage() {
  const content = await loadPublicContent();

  return (
    <>
      <AccessibilityBar />
      <SiteHeader />
      <main id="utama" tabIndex={-1}>
        <Hero />
        <MenuGrid />
        <ProfileSection />
        <TodaySchedule schedule={content.schedule} />
        <QuranVerseCard />
        <WeeklySchedule schedule={content.schedule} />
        <ZoomSection />
        <VideoGallery />
        <DonationSection />
        <Announcements data={content.announcements} />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
