import {
  BookOpen,
  CalendarDays,
  HeartHandshake,
  Megaphone,
  MessageCircle,
  MonitorPlay,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Menu datar: semua tujuan penting selalu terlihat, tanpa hamburger atau
 * menu bertingkat. Dipakai di header (layar lebar), kisi "Menu Utama"
 * (layar kecil dan tampilan sederhana), dan footer.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: "profil", label: "Profil", hint: "Tentang komunitas", href: "#profil", icon: Users },
  { id: "jadwal", label: "Jadwal Kajian", hint: "Hari ini dan sepekan", href: "#jadwal-hari-ini", icon: CalendarDays },
  { id: "ayat", label: "Ayat Pekan Ini", hint: "Lima ayat tadabbur", href: "#ayat", icon: BookOpen },
  { id: "daring", label: "Zoom dan Video", hint: "Ikut dari rumah", href: "#zoom", icon: MonitorPlay },
  { id: "donasi", label: "Infak dan Donasi", hint: "QRIS dan rekening", href: "#donasi", icon: HeartHandshake },
  { id: "info", label: "Pengumuman", hint: "Kegiatan terdekat", href: "#pengumuman", icon: Megaphone },
  { id: "kontak", label: "Hubungi Admin", hint: "Alamat dan WhatsApp", href: "#kontak", icon: MessageCircle },
];
