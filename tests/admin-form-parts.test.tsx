import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChoiceCards } from "@/components/admin/ChoiceCards";
import { ErrorSummary, pesanButir } from "@/components/admin/ErrorSummary";
import { describedBy, Field } from "@/components/admin/Field";
import { blobPublicHost } from "@/lib/photo/host";

const LABEL = { startTime: "Jam mulai", endTime: "Jam selesai", ustadz: "Nama ustadz" };

describe("describedBy", () => {
  it("menyusun id bantuan dan galat yang ada, atau tidak sama sekali", () => {
    expect(describedBy("field-a", {})).toBeUndefined();
    expect(describedBy("field-a", { hint: true })).toBe("field-a-hint");
    expect(describedBy("field-a", { error: "Salah." })).toBe("field-a-error");
    expect(describedBy("field-a", { hint: true, error: "Salah." })).toBe("field-a-hint field-a-error");
  });
});

describe("Field", () => {
  it("label terlihat dengan '(wajib)' atau '(boleh dikosongkan)', bantuan, dan galat berid sendiri", () => {
    const wajib = renderToStaticMarkup(
      <Field id="field-ustadz" label="Nama ustadz" required hint="Contoh: Ustadz A" error="Nama ustadz belum diisi.">
        <input id="field-ustadz" />
      </Field>,
    );
    expect(wajib).toContain('for="field-ustadz"');
    expect(wajib).toMatch(/Nama ustadz.*\(wajib\)/);
    expect(wajib).toContain('id="field-ustadz-hint"');
    expect(wajib).toContain('id="field-ustadz-error"');
    expect(wajib).toContain("Nama ustadz belum diisi.");
    const opsional = renderToStaticMarkup(
      <Field id="field-location" label="Tempat">
        <input id="field-location" />
      </Field>,
    );
    expect(opsional).toContain("(boleh dikosongkan)");
    expect(opsional).not.toContain("-hint");
    expect(opsional).not.toContain("-error");
  });
});

describe("pesanButir", () => {
  it("menambahkan nama kolom hanya bila pesan belum menyebutnya", () => {
    expect(pesanButir("Jam mulai", "Jam tidak sah. Gunakan format 24 jam, contoh 05.30.")).toBe(
      "Jam mulai: Jam tidak sah. Gunakan format 24 jam, contoh 05.30.",
    );
    expect(pesanButir("Nama ustadz", "Nama ustadz belum diisi.")).toBe("Nama ustadz belum diisi.");
    expect(pesanButir("Cara mengikuti", "Pilih cara mengikuti kajian.")).toBe("Pilih cara mengikuti kajian.");
  });
});

describe("ErrorSummary", () => {
  it("memuat jumlah isian dan satu tautan per kolom ke #field-{nama}", () => {
    const html = renderToStaticMarkup(
      <ErrorSummary
        errors={{ ustadz: "Nama ustadz belum diisi.", endTime: "Jam selesai harus setelah jam mulai." }}
        labels={LABEL}
      />,
    );
    expect(html).toContain('id="ringkasan-galat"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("Ada 2 isian yang perlu diperbaiki.");
    expect([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])).toEqual(["#field-ustadz", "#field-endTime"]);
  });

  it("hanya pesan gagal simpan: tanpa hitungan isian dan tanpa tautan", () => {
    const html = renderToStaticMarkup(<ErrorSummary errors={{}} labels={LABEL} message="Belum tersimpan karena sambungan." />);
    expect(html).toContain("Belum tersimpan karena sambungan.");
    expect(html).not.toContain("Ada ");
    expect(html).not.toContain("href=");
  });

  it("tanpa galat dan pesan: tidak menampilkan apa pun", () => {
    expect(renderToStaticMarkup(<ErrorSummary errors={{}} labels={LABEL} />)).toBe("");
    expect(renderToStaticMarkup(<ErrorSummary errors={undefined} labels={LABEL} />)).toBe("");
  });
});

describe("ChoiceCards", () => {
  const pilihan = [
    { value: "masjid", title: "Di masjid" },
    { value: "zoom", title: "Lewat Zoom" },
    { value: "hybrid", title: "Di masjid dan Zoom" },
  ] as const;

  it("kelompok radio berlegenda; radio pertama menjadi sasaran #field-{nama}; yang terpilih tercentang", () => {
    const html = renderToStaticMarkup(
      <ChoiceCards name="mode" legend="Cara mengikuti" options={[...pilihan]} value="zoom" onChange={() => {}} required />,
    );
    expect(html).toContain("<legend");
    expect(html).toMatch(/Cara mengikuti.*\(wajib\)/);
    expect((html.match(/type="radio"/g) ?? []).length).toBe(3);
    expect(html).toContain('id="field-mode"');
    expect((html.match(/id="field-mode"/g) ?? []).length).toBe(1);
    expect((html.match(/checked=""/g) ?? []).length).toBe(1);
    expect(html).toMatch(/value="zoom"[^>]*checked=""|checked=""[^>]*value="zoom"/);
  });

  it("galat tampil dengan id yang dirujuk aria-describedby kelompok", () => {
    const html = renderToStaticMarkup(
      <ChoiceCards name="mode" legend="Cara mengikuti" options={[...pilihan]} value="" onChange={() => {}} error="Pilih cara mengikuti kajian." />,
    );
    expect(html).toContain('aria-describedby="field-mode-error"');
    expect(html).toContain('id="field-mode-error"');
    expect(html).toContain("Pilih cara mengikuti kajian.");
  });
});

describe("blobPublicHost", () => {
  it("memangkas dan menurunkan huruf; kosong atau hilang menjadi undefined", () => {
    expect(blobPublicHost({})).toBeUndefined();
    expect(blobPublicHost({ BLOB_PUBLIC_HOST: "   " })).toBeUndefined();
    expect(blobPublicHost({ BLOB_PUBLIC_HOST: " ABC.public.blob.vercel-storage.com " })).toBe("abc.public.blob.vercel-storage.com");
  });
});
