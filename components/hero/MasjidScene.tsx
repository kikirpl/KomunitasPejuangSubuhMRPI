/*
 * Adegan beranda: Masjid Raya Pondok Indah saat fajar, digambar ulang dari foto asli milik
 * komunitas (bukan masjid generik). Proporsinya diukur dari foto: menara jarum beton dua sisi
 * yang berujung bulan sabit, atap limas tinggi berlapis genteng glasir biru, atap kedua yang
 * lebar dan landai, pita jendela tinggi bertiang putih, atap ketiga, gerbang besi biru
 * berlengkung runcing, pohon palem, tangga, dan dinding batu kali bertuliskan nama masjid.
 *
 * Empat lapis SVG dengan viewBox yang sama sehingga bisa digeser terpisah (parallax):
 * langit (cahaya fajar dan partikel), pepohonan jauh, masjid, dan latar depan. Tidak ada langit
 * di dalam gambar: langitnya adalah latar beranda itu sendiri, jadi tidak ada sambungan.
 * Warna memakai token --scene-* di app/globals.css. Server Component, tanpa JavaScript.
 */

const VIEWBOX = "0 0 2000 760";

function Lapis({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 size-full overflow-visible"
    >
      {children}
    </svg>
  );
}

/** Partikel cahaya: berkelip sebentar saat halaman dibuka (di bawah 5 detik), lalu diam. */
const PARTIKEL: ReadonlyArray<readonly [number, number, number, number]> = [
  [1288, 360, 2.4, 0.2],
  [1362, 300, 1.8, 0.9],
  [1446, 236, 2.8, 0.5],
  [1690, 262, 2, 1.3],
  [1744, 352, 2.6, 0.1],
  [1832, 300, 1.6, 1.1],
  [1904, 404, 2.2, 0.6],
  [1218, 432, 1.6, 1.5],
  [1612, 196, 1.8, 0.8],
  [1972, 330, 1.8, 1.2],
  [1520, 168, 1.4, 1.7],
  [1158, 300, 1.4, 0.4],
];

export function LangitFajar() {
  return (
    <Lapis>
      <defs>
        <radialGradient id="mrpi-fajar-luas" cx="1600" cy="600" r="1400" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 600) scale(1 0.5) translate(0 -600)">
          <stop offset="0" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0.42 }} />
          <stop offset="0.55" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0.12 }} />
          <stop offset="1" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id="mrpi-fajar" cx="1640" cy="560" r="900" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 560) scale(1 0.58) translate(0 -560)">
          <stop offset="0" style={{ stopColor: "var(--scene-glow-core)", stopOpacity: 1 }} />
          <stop offset="0.16" style={{ stopColor: "var(--scene-glow)", stopOpacity: 0.92 }} />
          <stop offset="0.38" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0.45 }} />
          <stop offset="0.7" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0.1 }} />
          <stop offset="1" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="mrpi-cakrawala" x1="0" y1="420" x2="0" y2="660" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "var(--scene-glow-far)", stopOpacity: 0.32 }} />
        </linearGradient>
        <linearGradient id="mrpi-cakrawala-x" x1="0" y1="0" x2="2000" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="mrpi-cakrawala-mask"><rect x="-1200" y="0" width="4400" height="760" fill="url(#mrpi-cakrawala-x)" /></mask>
        <radialGradient id="mrpi-partikel">
          <stop offset="0" style={{ stopColor: "var(--scene-rim)", stopOpacity: 1 }} />
          <stop offset="1" style={{ stopColor: "var(--scene-rim)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <rect x="-1200" y="0" width="4400" height="760" fill="url(#mrpi-fajar-luas)" />
      <rect x="-1200" y="0" width="4400" height="760" fill="url(#mrpi-fajar)" className="scene-glow" />
      <rect x="-1200" y="420" width="4400" height="340" fill="url(#mrpi-cakrawala)" mask="url(#mrpi-cakrawala-mask)" />
      <g className="scene-motes">
        {PARTIKEL.map(([cx, cy, r, d]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r * 2.6} fill="url(#mrpi-partikel)" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
    </Lapis>
  );
}

export function PepohonanJauh() {
  return (
    <Lapis>
      <g style={{ fill: "var(--scene-tree-far)" }}>
        <path d="M-1200 760V584C-1000 572 -800 590 -600 580C-450 572 -330 590 -240 588C-200 576 -160 584 -128 572C-90 558 -52 576 -18 566C22 554 52 572 92 562C134 552 160 570 202 564C246 558 270 574 312 568C356 562 384 578 428 572C470 566 498 582 540 576C584 570 612 586 654 580C698 574 726 590 770 586C812 582 842 596 884 592C924 588 958 600 1000 604V760ZM1900 760V586C1932 572 1966 578 1996 582C2040 588 2070 574 2108 580C2150 586 2190 576 2240 582C2420 594 2620 574 2820 584C2960 590 3080 578 3200 584V760Z" />
      </g>
      <g style={{ fill: "var(--scene-tree)" }}>
        <path d="M-1200 760V610C-1000 600 -800 616 -600 606C-450 598 -330 614 -240 612C-196 600 -150 610 -112 600C-74 590 -40 606 -2 598C40 588 70 606 112 598C150 590 182 606 222 600C264 594 292 610 334 604C376 598 406 612 448 606C492 600 520 616 562 610C604 604 634 618 676 614C716 610 748 622 790 618C832 614 864 626 906 624C946 622 978 630 1010 634V760ZM1918 760V612C1948 600 1980 606 2008 610C2050 616 2090 604 2130 610C2170 616 2206 606 2240 612C2420 624 2620 604 2820 614C2960 620 3080 608 3200 612V760Z" />
      </g>
    </Lapis>
  );
}

export function Masjid() {
  return (
    <Lapis>
      <defs>
        <linearGradient id="mrpi-atap" x1="1240" y1="510" x2="1760" y2="330" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--scene-roof-lo)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--scene-roof)" }} />
          <stop offset="1" style={{ stopColor: "var(--scene-roof-hi)" }} />
        </linearGradient>
        <linearGradient id="mrpi-atap-2" x1="1130" y1="560" x2="1900" y2="500" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--scene-roof-lo)" }} />
          <stop offset="1" style={{ stopColor: "var(--scene-roof)" }} />
        </linearGradient>
        <linearGradient id="mrpi-tepi" x1="1557" y1="298" x2="1820" y2="476" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--scene-rim)", stopOpacity: 1 }} />
          <stop offset="1" style={{ stopColor: "var(--scene-rim)", stopOpacity: 0.15 }} />
        </linearGradient>
        <linearGradient id="mrpi-menara" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--scene-concrete-hi)" }} />
          <stop offset="1" style={{ stopColor: "var(--scene-concrete)" }} />
        </linearGradient>
        <pattern id="mrpi-genteng" width="16" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6Q4 0 8 6Q12 0 16 6M-8 12Q-4 6 0 12Q4 6 8 12Q12 6 16 12Q20 6 24 12" fill="none" style={{ stroke: "var(--scene-tile-line)" }} strokeWidth="1" />
        </pattern>
      </defs>

      {/* Menara: jarum beton dua sisi dengan sambungan panel, berujung bulan sabit dan bintang. */}
      <g>
        <polygon points="1095.7,130.7 1007.7,640.0 1057.2,640.0" fill="url(#mrpi-menara)" />
        <polygon points="1095.7,130.7 1057.2,640.0 1082.5,640.0" style={{ fill: "var(--scene-concrete-lo)" }} />
        <path d="M1089.4 167.0L1094.8 167.0M1084.9 193.4L1094.1 193.4M1080.3 219.8L1093.4 219.8M1075.7 246.2L1092.7 246.2M1071.2 272.6L1092.0 272.6M1066.6 299.0L1091.3 299.0M1062.1 325.4L1090.7 325.4M1057.5 351.8L1090.0 351.8M1052.9 378.2L1089.3 378.2M1048.4 404.6L1088.6 404.6M1043.8 431.0L1087.9 431.0M1039.3 457.4L1087.2 457.4M1034.7 483.8L1086.5 483.8M1030.1 510.2L1085.9 510.2M1025.6 536.6L1085.2 536.6M1021.0 563.0L1084.5 563.0M1016.4 589.4L1083.8 589.4M1011.9 615.8L1083.1 615.8" style={{ stroke: "var(--scene-concrete-joint)" }} strokeWidth="1.2" />
        <path d="M1095.7 130.7L1082.5 640" style={{ stroke: "var(--scene-rim)" }} strokeWidth="2" strokeOpacity="0.55" />
        <path d="M1095.7 131V100" style={{ stroke: "var(--scene-concrete-hi)" }} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M1108.6 76.8A11.5 11.5 0 1 1 1092.2 91.6A8.6 8.6 0 1 0 1108.6 76.8Z" style={{ fill: "var(--scene-rim)" }} />
        <path d="M1104 83.2l1.5 3.3 3.5.4-2.6 2.4.7 3.5-3.1-1.8-3.1 1.8.7-3.5-2.6-2.4 3.5-.4Z" style={{ fill: "var(--scene-rim)" }} />
      </g>

      {/* Atap limas atas. */}
      <polygon points="1557.7,297.9 1213.4,505.8 1819.5,476.1" fill="url(#mrpi-atap)" />
      <polygon points="1557.7,297.9 1213.4,505.8 1819.5,476.1" fill="url(#mrpi-genteng)" />
      <path d="M1557.7 297.9L1819.5 476.1" stroke="url(#mrpi-tepi)" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="1213.4,505.8 1819.5,476.1 1819.5,482.7 1213.4,512.4" style={{ fill: "var(--scene-fascia)" }} />
      <path d="M1213.4 505.8L1819.5 476.1" style={{ stroke: "var(--scene-eave)" }} strokeWidth="1.6" strokeOpacity="0.85" />
      <polygon points="1213.4,512.4 1819.5,482.7 1849.2,490.4 1165.0,521.2" style={{ fill: "var(--scene-soffit)" }} />
      <path d="M1222 517.6L1812 488.8" style={{ stroke: "var(--scene-col)" }} strokeWidth="1.4" strokeOpacity="0.7" />

      {/* Atap kedua: limasan lebar dan landai. Bayangan tipis dari atap atas jatuh di pangkalnya. */}
      <polygon points="1165.0,521.2 1849.2,490.4 1926.2,548.7 1126.5,568.5" fill="url(#mrpi-atap-2)" />
      <polygon points="1165.0,521.2 1849.2,490.4 1926.2,548.7 1126.5,568.5" fill="url(#mrpi-genteng)" />
      <path d="M1849.2 490.4L1926.2 548.7" style={{ stroke: "var(--scene-rim)" }} strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" />
      <polygon points="1126.5,568.5 1926.2,548.7 1926.2,554.2 1126.5,574.0" style={{ fill: "var(--scene-fascia)" }} />
      <path d="M1126.5 568.5L1926.2 548.7" style={{ stroke: "var(--scene-eave)" }} strokeWidth="1.6" strokeOpacity="0.85" />

      {/* Pita jendela tinggi: tiang putih, bukaan gelap, kisi geometris. */}
      <polygon points="1154.0,574.0 1913.0,554.2 1913.0,598.2 1154.0,607.0" style={{ fill: "var(--scene-opening)" }} />
      <path d="M1157.2 576.5L1173.0 585.5L1188.8 576.5M1157.2 585.5L1173.0 576.5L1188.8 585.5M1195.2 575.5L1211.0 584.5L1226.7 575.5M1195.2 584.5L1211.0 575.5L1226.7 584.5M1233.1 574.5L1248.8 583.5L1264.6 574.5M1233.1 583.5L1248.8 574.5L1264.6 583.5M1271.0 573.5L1286.8 582.5L1302.6 573.5M1271.0 582.5L1286.8 573.5L1302.6 582.5M1309.0 572.5L1324.8 581.5L1340.6 572.5M1309.0 581.5L1324.8 572.5L1340.6 581.5M1347.0 571.6L1362.8 580.6L1378.5 571.6M1347.0 580.6L1362.8 571.6L1378.5 580.6M1384.9 570.6L1400.7 579.6L1416.5 570.6M1384.9 579.6L1400.7 570.6L1416.5 579.6M1422.9 569.6L1438.7 578.6L1454.4 569.6M1422.9 578.6L1438.7 569.6L1454.4 578.6M1460.8 568.6L1476.6 577.6L1492.4 568.6M1460.8 577.6L1476.6 568.6L1492.4 577.6M1498.8 567.6L1514.5 576.6L1530.3 567.6M1498.8 576.6L1514.5 567.6L1530.3 576.6M1536.7 566.6L1552.5 575.6L1568.3 566.6M1536.7 575.6L1552.5 566.6L1568.3 575.6M1574.7 565.6L1590.5 574.6L1606.2 565.6M1574.7 574.6L1590.5 565.6L1606.2 574.6M1612.6 564.6L1628.3 573.6L1644.1 564.6M1612.6 573.6L1628.3 564.6L1644.1 573.6M1650.5 563.6L1666.3 572.6L1682.1 563.6M1650.5 572.6L1666.3 563.6L1682.1 572.6M1688.5 562.7L1704.2 571.7L1720.0 562.7M1688.5 571.7L1704.2 562.7L1720.0 571.7M1726.4 561.7L1742.2 570.7L1758.0 561.7M1726.4 570.7L1742.2 561.7L1758.0 570.7M1764.4 560.7L1780.2 569.7L1796.0 560.7M1764.4 569.7L1780.2 560.7L1796.0 569.7M1802.4 559.7L1818.2 568.7L1833.9 559.7M1802.4 568.7L1818.2 559.7L1833.9 568.7M1840.3 558.7L1856.1 567.7L1871.9 558.7M1840.3 567.7L1856.1 558.7L1871.9 567.7M1878.3 557.7L1894.0 566.7L1909.8 557.7M1878.3 566.7L1894.0 557.7L1909.8 566.7" fill="none" style={{ stroke: "var(--scene-col-shade)" }} strokeWidth="1.2" strokeOpacity="0.8" />
      <g style={{ fill: "var(--scene-col)" }}>
        <rect x="1150.8" y="574.0" width="6.4" height="33.0" />
        <rect x="1188.8" y="573.0" width="6.4" height="33.6" />
        <rect x="1226.7" y="572.0" width="6.4" height="34.1" />
        <rect x="1264.6" y="571.0" width="6.4" height="34.7" />
        <rect x="1302.6" y="570.0" width="6.4" height="35.2" />
        <rect x="1340.6" y="569.1" width="6.4" height="35.7" />
        <rect x="1378.5" y="568.1" width="6.4" height="36.3" />
        <rect x="1416.5" y="567.1" width="6.4" height="36.8" />
        <rect x="1454.4" y="566.1" width="6.4" height="37.4" />
        <rect x="1492.4" y="565.1" width="6.4" height="37.9" />
        <rect x="1530.3" y="564.1" width="6.4" height="38.5" />
        <rect x="1568.3" y="563.1" width="6.4" height="39.1" />
        <rect x="1606.2" y="562.1" width="6.4" height="39.6" />
        <rect x="1644.1" y="561.1" width="6.4" height="40.2" />
        <rect x="1682.1" y="560.1" width="6.4" height="40.7" />
        <rect x="1720.0" y="559.2" width="6.4" height="41.2" />
        <rect x="1758.0" y="558.2" width="6.4" height="41.8" />
        <rect x="1796.0" y="557.2" width="6.4" height="42.3" />
        <rect x="1833.9" y="556.2" width="6.4" height="42.9" />
        <rect x="1871.9" y="555.2" width="6.4" height="43.4" />
        <rect x="1909.8" y="554.2" width="6.4" height="44.0" />
      </g>

      {/* Atap ketiga. */}
      <polygon points="1137.5,607.0 1921.8,598.2 1930.6,631.2 1129.8,642.2" fill="url(#mrpi-atap-2)" />
      <polygon points="1137.5,607.0 1921.8,598.2 1930.6,631.2 1129.8,642.2" fill="url(#mrpi-genteng)" />
    </Lapis>
  );
}

export function LatarDepan() {
  return (
    <Lapis>
      <defs>
        <pattern id="mrpi-batu" width="240" height="80" patternUnits="userSpaceOnUse" y="640">
          <rect width="240" height="80" style={{ fill: "var(--scene-stone-line)" }} />
          <g style={{ fill: "var(--scene-stone)" }}><polygon points="1.4,-0.3 18.6,2.5 32.6,-0.3 34.0,24.5 18.4,24.4 1.4,25.9" /><polygon points="38.3,1.7 47.9,1.6 61.4,0.2 65.0,24.1 50.4,25.7 37.9,25.9" /><polygon points="64.6,1.7 82.8,0.3 104.1,1.7 103.4,25.6 85.2,26.4 67.2,27.4" /><polygon points="104.0,2.6 128.4,0.7 149.1,1.5 151.2,26.6 125.5,26.9 102.7,25.3" /><polygon points="1.4,29.3 24.9,28.9 40.8,27.3 38.7,51.1 22.6,51.2 1.4,54.0" /><polygon points="77.7,28.0 91.9,28.1 103.4,30.4 105.2,51.0 92.7,51.5 78.9,52.8" /><polygon points="109.2,26.6 131.0,28.1 158.5,30.3 158.3,52.5 130.3,52.6 111.7,52.5" /><polygon points="157.5,26.7 177.4,27.7 198.9,27.0 193.3,54.5 178.7,51.6 160.7,50.6" /><polygon points="202.7,29.9 220.4,27.7 238.6,27.8 238.6,51.2 220.9,52.7 201.4,51.9" /><polygon points="1.4,56.7 24.2,54.6 43.7,54.8 40.3,76.6 21.0,77.9 1.4,79.4" /><polygon points="148.1,56.4 169.1,54.4 199.1,53.4 196.2,78.5 173.1,78.9 149.1,78.5" /><polygon points="196.0,55.6 215.1,56.2 238.6,56.4 238.6,76.9 220.2,77.6 201.8,77.3" /></g>
          <g style={{ fill: "var(--scene-stone-2)" }}><polygon points="181.5,1.3 192.1,0.2 205.0,2.0 207.1,27.0 189.5,25.3 179.6,23.6" /><polygon points="205.4,1.9 222.5,0.6 238.6,0.5 238.6,26.6 221.8,26.8 206.4,24.2" /><polygon points="42.7,26.3 59.4,28.0 76.1,30.3 76.9,52.7 60.8,53.1 41.3,54.3" /><polygon points="46.0,57.2 73.9,56.7 93.7,54.2 92.7,77.3 68.4,78.9 49.2,80.0" /><polygon points="100.3,54.7 122.5,56.3 142.9,54.9 147.1,77.3 124.2,78.4 98.4,76.9" /></g>
          <g style={{ fill: "var(--scene-stone-3)" }}><polygon points="149.0,1.4 160.3,1.9 177.5,1.7 178.2,24.8 164.9,25.9 152.0,25.4" /></g>
        </pattern>
        <linearGradient id="mrpi-dinding-redup" x1="-240" y1="0" x2="1060" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--scene-tree)", stopOpacity: 0.72 }} />
          <stop offset="0.55" style={{ stopColor: "var(--scene-tree)", stopOpacity: 0.45 }} />
          <stop offset="1" style={{ stopColor: "var(--scene-tree)", stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="mrpi-pelataran" x1="0" y1="721" x2="0" y2="760" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--scene-pelataran-bayang)" }} />
          <stop offset="1" style={{ stopColor: "var(--scene-pelataran)" }} />
        </linearGradient>
        <linearGradient id="mrpi-dinding-cahaya" x1="0" y1="640" x2="0" y2="720" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--scene-rim)", stopOpacity: 0.16 }} />
          <stop offset="0.5" style={{ stopColor: "var(--scene-rim)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* Gerbang besi biru berlengkung runcing. */}
      <g fill="none" style={{ stroke: "var(--scene-gate)" }} strokeWidth="4" strokeLinejoin="round">
        <path d="M1079.2 640V556.7Q1079.2 537.9 1099.0 527.8Q1118.8 537.9 1118.8 556.7V640M1079.2 568.7H1118.8M1404.8 640V549.2Q1404.8 528.1 1424.6 516.8Q1444.4 528.1 1444.4 549.2V640M1404.8 561.2H1444.4M1484.0 640V595.8Q1484.0 587.4 1499.4 582.8Q1514.8 587.4 1514.8 595.8V640M1484.0 607.8H1514.8" />
      </g>
      <g style={{ fill: "var(--scene-rim)" }}><circle cx="1099.0" cy="582.7" r="4.2" /><circle cx="1424.6" cy="575.2" r="4.2" /><circle cx="1499.4" cy="621.8" r="4.2" /></g>

      {/* Pohon palem di depan masjid. */}
      <g style={{ fill: "var(--scene-palm-trunk)" }}><path d="M1177.5 645.5Q1171.8 590.5 1173.8 537.5L1178.2 537.5Q1177.8 590.5 1185.5 645.5Z" /><path d="M1221.5 645.5Q1230.2 587.8 1228.8 532.0L1233.2 532.0Q1236.2 587.8 1229.5 645.5Z" /><path d="M1568.0 645.5Q1562.2 531.6 1564.3 419.8L1568.7 419.8Q1568.2 531.6 1576.0 645.5Z" /><path d="M1598.8 645.5Q1611.4 546.5 1613.8 449.5L1618.2 449.5Q1617.4 546.5 1606.8 645.5Z" /><path d="M1631.8 645.5Q1629.9 582.2 1635.8 521.0L1640.2 521.0Q1635.9 582.2 1639.8 645.5Z" /></g>
      <g style={{ fill: "var(--scene-palm-back)" }}><path d="M1176.0 535.5Q1158.5 514.0 1134.7 543.3Q1154.2 524.5 1176.0 535.5ZM1176.0 535.5Q1173.6 507.9 1156.2 505.9Q1163.5 513.3 1176.0 535.5ZM1176.0 535.5Q1187.1 512.3 1181.5 503.4Q1175.8 510.7 1176.0 535.5ZM1176.0 535.5Q1200.4 520.1 1213.9 530.9Q1193.1 511.4 1176.0 535.5ZM1176.0 535.5Q1198.9 539.9 1222.9 564.6Q1199.7 528.6 1176.0 535.5ZM1176.0 535.5Q1152.5 534.0 1137.4 582.3Q1158.2 543.8 1176.0 535.5ZM1176.0 535.5Q1157.2 517.8 1134.8 549.9Q1154.8 529.0 1176.0 535.5Z" /><path d="M1231.0 530.0Q1216.8 511.4 1196.7 536.5Q1212.8 521.2 1231.0 530.0ZM1231.0 530.0Q1227.1 500.4 1209.3 497.5Q1217.7 505.4 1231.0 530.0ZM1231.0 530.0Q1241.8 504.1 1237.1 494.4Q1231.3 502.6 1231.0 530.0ZM1231.0 530.0Q1252.0 517.7 1262.9 526.1Q1245.2 509.5 1231.0 530.0ZM1231.0 530.0Q1250.0 534.5 1270.2 554.3Q1250.8 523.9 1231.0 530.0ZM1231.0 530.0Q1211.1 528.0 1199.0 568.8Q1216.4 537.2 1231.0 530.0ZM1231.0 530.0Q1210.0 512.0 1185.8 545.8Q1207.8 522.3 1231.0 530.0Z" /><path d="M1566.5 417.8Q1544.1 391.1 1514.2 427.7Q1539.0 403.7 1566.5 417.8ZM1566.5 417.8Q1562.9 383.0 1541.4 380.2Q1550.8 389.4 1566.5 417.8ZM1566.5 417.8Q1580.0 388.1 1573.5 376.9Q1566.5 386.3 1566.5 417.8ZM1566.5 417.8Q1591.2 404.6 1602.9 413.4Q1582.4 394.1 1566.5 417.8ZM1566.5 417.8Q1595.4 422.8 1625.8 454.6Q1596.4 409.2 1566.5 417.8ZM1566.5 417.8Q1537.0 416.4 1517.6 477.1Q1543.8 428.2 1566.5 417.8ZM1566.5 417.8Q1542.5 395.9 1514.2 436.1Q1539.6 409.3 1566.5 417.8Z" /><path d="M1616.0 447.5Q1598.6 425.4 1574.4 455.4Q1594.0 436.6 1616.0 447.5ZM1616.0 447.5Q1614.0 419.6 1596.2 417.8Q1603.3 425.3 1616.0 447.5ZM1616.0 447.5Q1628.6 416.3 1623.3 404.7Q1616.6 414.6 1616.0 447.5ZM1616.0 447.5Q1641.0 432.2 1654.4 442.8Q1633.2 423.0 1616.0 447.5ZM1616.0 447.5Q1639.1 452.4 1663.4 477.0Q1639.9 440.3 1616.0 447.5ZM1616.0 447.5Q1592.1 445.6 1577.1 494.6Q1598.1 456.1 1616.0 447.5ZM1616.0 447.5Q1597.2 429.3 1574.7 461.9Q1594.7 441.1 1616.0 447.5Z" /><path d="M1638.0 519.0Q1620.8 499.1 1598.2 526.5Q1617.2 508.2 1638.0 519.0ZM1638.0 519.0Q1634.9 492.7 1618.9 490.4Q1626.2 497.3 1638.0 519.0ZM1638.0 519.0Q1647.9 496.3 1643.4 487.7Q1638.2 494.9 1638.0 519.0ZM1638.0 519.0Q1656.7 508.5 1665.9 515.6Q1650.3 500.9 1638.0 519.0ZM1638.0 519.0Q1654.6 523.4 1672.2 540.3Q1655.3 513.5 1638.0 519.0ZM1638.0 519.0Q1615.8 518.3 1600.8 564.0Q1620.7 526.8 1638.0 519.0ZM1638.0 519.0Q1619.6 502.7 1598.1 532.9Q1617.5 512.4 1638.0 519.0Z" /></g>
      <g style={{ fill: "var(--scene-palm)" }}><path d="M1176.0 535.5Q1156.5 521.6 1136.4 555.9Q1156.1 533.0 1176.0 535.5ZM1176.0 535.5Q1163.2 506.7 1139.2 529.6Q1155.6 515.2 1176.0 535.5ZM1176.0 535.5Q1180.2 505.2 1167.8 497.7Q1169.0 507.2 1176.0 535.5ZM1176.0 535.5Q1193.9 514.4 1196.9 504.2Q1183.9 509.1 1176.0 535.5ZM1176.0 535.5Q1198.6 532.0 1216.0 545.6Q1195.1 521.1 1176.0 535.5ZM1176.0 535.5Q1190.7 546.5 1212.2 573.4Q1195.3 536.1 1176.0 535.5ZM1176.0 535.5Q1150.2 525.6 1127.3 571.3Q1152.1 536.8 1176.0 535.5Z" /><path d="M1231.0 530.0Q1209.3 516.1 1187.1 552.6Q1209.0 526.7 1231.0 530.0ZM1231.0 530.0Q1220.8 505.3 1200.1 525.0Q1213.7 513.1 1231.0 530.0ZM1231.0 530.0Q1235.3 504.6 1224.2 498.4Q1224.9 506.4 1231.0 530.0ZM1231.0 530.0Q1246.6 512.9 1248.4 504.0Q1237.2 508.0 1231.0 530.0ZM1231.0 530.0Q1255.4 524.8 1274.9 541.1Q1252.1 514.7 1231.0 530.0ZM1231.0 530.0Q1247.9 540.8 1271.1 572.0Q1252.2 531.1 1231.0 530.0ZM1231.0 530.0Q1209.2 520.9 1190.1 560.1Q1211.0 531.3 1231.0 530.0Z" /><path d="M1566.5 417.8Q1541.6 400.8 1516.0 443.8Q1541.1 414.4 1566.5 417.8ZM1566.5 417.8Q1555.6 388.7 1531.2 412.1Q1546.5 398.8 1566.5 417.8ZM1566.5 417.8Q1571.3 379.7 1556.2 370.0Q1557.9 382.0 1566.5 417.8ZM1566.5 417.8Q1588.7 390.9 1593.0 378.1Q1576.6 384.5 1566.5 417.8ZM1566.5 417.8Q1595.0 412.7 1617.3 430.7Q1590.8 399.8 1566.5 417.8ZM1566.5 417.8Q1585.5 431.2 1612.6 466.1Q1591.0 418.8 1566.5 417.8ZM1566.5 417.8Q1541.3 406.3 1519.7 452.2Q1543.7 419.7 1566.5 417.8Z" /><path d="M1616.0 447.5Q1589.9 431.3 1563.2 474.7Q1589.5 443.4 1616.0 447.5ZM1616.0 447.5Q1603.4 418.0 1578.7 441.5Q1595.3 427.0 1616.0 447.5ZM1616.0 447.5Q1620.7 416.8 1607.7 409.3Q1608.8 418.9 1616.0 447.5ZM1616.0 447.5Q1634.5 426.5 1637.1 416.0Q1623.8 420.8 1616.0 447.5ZM1616.0 447.5Q1638.9 444.4 1656.2 457.7Q1635.1 432.9 1616.0 447.5ZM1616.0 447.5Q1636.5 460.1 1664.2 498.0Q1641.4 449.0 1616.0 447.5ZM1616.0 447.5Q1589.7 437.0 1566.6 483.8Q1591.8 448.9 1616.0 447.5Z" /><path d="M1638.0 519.0Q1619.0 506.4 1599.4 538.9Q1618.6 516.2 1638.0 519.0ZM1638.0 519.0Q1629.3 497.0 1610.9 514.7Q1622.7 504.3 1638.0 519.0ZM1638.0 519.0Q1642.2 496.7 1632.0 491.4Q1632.5 498.4 1638.0 519.0ZM1638.0 519.0Q1654.5 498.3 1658.1 488.8Q1645.8 493.7 1638.0 519.0ZM1638.0 519.0Q1659.6 514.7 1676.8 528.8Q1656.6 505.4 1638.0 519.0ZM1638.0 519.0Q1652.7 528.9 1673.3 555.9Q1656.7 519.9 1638.0 519.0ZM1638.0 519.0Q1618.8 510.6 1602.1 545.4Q1620.5 520.3 1638.0 519.0Z" /></g>

      {/* Dinding batu kali, tangga, dan papan nama. */}
      <path d="M-1200 640H1140V720H-1200ZM1392 640H3200V720H1392Z" fill="url(#mrpi-batu)" />
      <path d="M-1200 640H1140V720H-1200ZM1392 640H3200V720H1392Z" fill="url(#mrpi-dinding-cahaya)" />
      <rect x="-1200" y="638" width="2340" height="82" fill="url(#mrpi-dinding-redup)" />
      <rect x="1140" y="630" width="14" height="90" fill="url(#mrpi-batu)" />
      <rect x="1378" y="630" width="14" height="90" fill="url(#mrpi-batu)" />
      <rect x="1154" y="646" width="224" height="74" style={{ fill: "var(--scene-stair)" }} />
      <rect x="1154" y="646" width="224" height="74" fill="url(#mrpi-dinding-cahaya)" />
      <path d="M1152 650H1378M1152 658H1378M1152 666H1378M1152 674H1378M1152 682H1378M1152 690H1378M1152 698H1378M1152 706H1378M1152 714H1378" style={{ stroke: "var(--scene-stair-edge)" }} strokeWidth="2" />
      <path d="M-1200 640H1140M1392 640H3200M1140 630H1154M1378 630H1392" style={{ stroke: "var(--scene-stone-hi)" }} strokeWidth="5" />
      <path d="M1392 637.6H3200" style={{ stroke: "var(--scene-rim)" }} strokeWidth="1.4" strokeOpacity="0.5" />
      {/* Huruf papan nama berbingkai tipis gelap (paint-order) agar terbaca di atas batu, seperti di foto. */}
      <text
        x="1584"
        y="687"
        textAnchor="middle"
        paintOrder="stroke"
        strokeWidth="3.2"
        strokeLinejoin="round"
        style={{
          fill: "var(--scene-sign)",
          stroke: "var(--scene-stone-line)",
          fontFamily: "var(--font-sans)",
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: "0.1em",
        }}
      >
        MASJID RAYA PONDOK INDAH
      </text>

      {/* Kaki dinding dan awal pelataran; pita .hero-pelataran di bawahnya memudar ke dasar halaman. */}
      <rect x="-1200" y="720" width="4400" height="60" fill="url(#mrpi-pelataran)" />
      <rect x="-1200" y="718" width="4400" height="3" style={{ fill: "var(--scene-stone-line)" }} />
    </Lapis>
  );
}
