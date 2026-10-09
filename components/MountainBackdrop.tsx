/*
 * Pegunungan biru muda di dasar hero: empat lapis punggung gunung (makin dekat
 * makin pekat), cahaya emas samar di balik punggung terjauh, dan kabut tipis
 * di dasar yang memudar tepat ke warna latar section berikutnya (--mtn-mist).
 *
 * Server Component, SVG inline tanpa JavaScript dan tanpa animasi. Warna tiap
 * lapis diatur lewat variabel --mtn-* di app/globals.css.
 *
 * viewBox sengaja lebar (2400 x 340) dan memakai preserveAspectRatio
 * "xMidYMax slice": sampai lebar layar 2400px gambar selalu terlihat utuh
 * tingginya, hanya sisi kiri-kanan yang terpotong, sehingga puncak gunung tidak
 * pernah terpangkas mendatar di layar lebar.
 */

const PUNGGUNG: ReadonlyArray<{ warna: string; d: string }> = [
  { warna: "var(--mtn-1)", d: "M-60 340V172C-48 172 -36 182 0 172C36 162 110 125 120 124C130 123 182 153 210 150C238 147 320 101 330 100C340 99 395 133 420 130C445 127 511 79 520 78C529 77 586 106 610 114C634 122 658 144 700 140C742 136 810 93 820 92C830 91 885 110 910 118C935 126 968 156 1010 152C1052 148 1112 100 1120 96C1128 92 1164 79 1180 74C1196 69 1233 55 1240 56C1247 57 1296 85 1320 96C1344 107 1376 144 1420 142C1464 140 1530 89 1540 88C1550 87 1611 111 1640 120C1669 129 1712 156 1760 152C1808 148 1870 103 1880 102C1890 101 1951 136 1980 134C2009 132 2089 84 2100 84C2111 84 2174 139 2220 144C2266 149 2322 110 2330 110C2338 110 2374 136 2400 142C2426 148 2448 142 2460 142V340Z" },
  { warna: "var(--mtn-2)", d: "M-60 340V204C-48 204 -42 212 0 204C42 196 137 164 150 164C163 164 226 202 280 198C334 194 407 146 420 146C433 146 504 192 560 194C616 196 689 157 700 156C711 155 773 173 800 180C827 187 852 212 900 208C948 204 1028 159 1040 158C1052 157 1104 198 1160 194C1216 190 1307 139 1320 138C1333 137 1403 165 1430 174C1457 183 1474 208 1520 204C1566 200 1647 152 1660 152C1673 152 1740 198 1800 198C1860 198 1946 154 1960 154C1974 154 2040 193 2100 194C2160 195 2246 160 2260 160C2274 160 2360 186 2400 192C2440 198 2448 192 2460 192V340Z" },
  { warna: "var(--mtn-3)", d: "M-60 340V252C-48 252 -52 259 0 252C52 245 182 218 200 218C218 218 308 258 380 256C452 254 543 210 560 210C577 210 672 249 740 252C808 255 885 224 900 224C915 224 992 262 1060 260C1128 258 1223 214 1240 214C1257 214 1348 253 1420 254C1492 255 1583 220 1600 220C1617 220 1708 259 1780 258C1852 257 1942 216 1960 216C1978 216 2072 251 2160 254C2248 257 2386 231 2400 230C2414 229 2448 230 2460 230V340Z" },
  { warna: "var(--mtn-4)", d: "M-60 340V294C-48 294 -66 299 0 294C66 289 190 265 300 266C410 267 490 297 600 298C710 299 790 270 900 270C1010 270 1090 300 1200 300C1310 300 1390 268 1500 268C1610 268 1690 297 1800 298C1910 299 1990 273 2100 272C2210 271 2334 288 2400 292C2466 296 2448 292 2460 292V340Z" },
];

/**
 * `className` mengatur posisi dan ukuran pembungkus (mis. "absolute inset-x-0 bottom-0 h-(--mtn-height)").
 */
export function MountainBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <svg
        focusable="false"
        viewBox="0 0 2400 340"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="gunung-cahaya">
            <stop offset="0" style={{ stopColor: "var(--mtn-glow)", stopOpacity: 0.5 }} />
            <stop offset="0.45" style={{ stopColor: "var(--mtn-glow)", stopOpacity: 0.18 }} />
            <stop offset="1" style={{ stopColor: "var(--mtn-glow)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Cahaya emas samar di balik puncak terjauh. */}
        <ellipse cx="1240" cy="128" rx="620" ry="122" fill="url(#gunung-cahaya)" />

        {PUNGGUNG.map(({ warna, d }) => (
          <path key={warna} d={d} style={{ fill: warna }} />
        ))}
      </svg>
      {/*
        Kabut di dasar (42% bawah): memudar ke warna latar section berikutnya, tanpa
        garis tegas. Dibuat dengan gradien CSS, bukan di dalam SVG, karena latar CSS
        selalu menutup baris piksel terakhir dengan penuh; tepi SVG yang jatuh di
        pecahan piksel bisa menyisakan garis biru tipis di sambungan.
      */}
      <div className="mtn-mist absolute inset-x-0 bottom-0 h-[42.5%]" />
    </div>
  );
}
