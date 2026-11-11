import React, { useState, useEffect, useRef, useMemo } from 'react';
import AcidBaseLab from './AcidBaseLab.jsx';
import ChemistryAcademy, { LESSONS as ACADEMY_LESSONS, QUESTIONS as ACADEMY_QUESTIONS } from './ChemistryAcademy.jsx';
import { CHEMICALS as ACID_BASE_CHEMICALS, EQUIPMENT as ACID_BASE_EQUIPMENT, REACTIONS as ACID_BASE_REACTIONS } from './AcidBaseLab.jsx';
import AIChat from './AIChat.jsx';
  VolumeX, Play, MessageSquare, ListFilter, TestTube, Lightbulb, UserCheck, Scale
} from 'lucide-react';

// ==========================================
// 1. DATASETS: PERIODIC TABLE (118 ELEMENTS) & REACTION DATA
// ==========================================

// Comprehensive dataset for key interactive elements + procedural fallbacks for all 118
const DETAILED_ELEMENTS = [
  { n: 1, s: "H", nameEN: "Hydrogen", nameFA: "هیدروژن", mass: 1.008, cat: "nonmetal", group: 1, period: 1, config: "1s¹", p: 1, e: 1, n_count: 0, ox: "+1, -1", state: "Gas", factEN: "Most abundant element in the universe.", factFA: "فراوان‌ترین عنصر در جهان هستی." },
  { n: 2, s: "He", nameEN: "Helium", nameFA: "هلیوم", mass: 4.0026, cat: "noble", group: 18, period: 1, config: "1s²", p: 2, e: 2, n_count: 2, ox: "0", state: "Gas", factEN: "Second lightest element, discovered in the Sun.", factFA: "دومین عنصر سبک که ابتدا در خورشید کشف شد." },
  { n: 3, s: "Li", nameEN: "Lithium", nameFA: "لیتیوم", mass: 6.94, cat: "alkali", group: 1, period: 2, config: "[He] 2s¹", p: 3, e: 3, n_count: 4, ox: "+1", state: "Solid", factEN: "Lightest metal, highly reactive with water.", factFA: "سبک‌ترین فلز، بسیار واکنش‌پذیر با آب." },
  { n: 4, s: "Be", nameEN: "Beryllium", nameFA: "بریلیوم", mass: 9.0122, cat: "alkaline", group: 2, period: 2, config: "[He] 2s²", p: 4, e: 4, n_count: 5, ox: "+2", state: "Solid", factEN: "Forms emeralds when combined with chromium.", factFA: "در ترکیب با کروم زمرد تشکیل می‌دهد." },
  { n: 5, s: "B", nameEN: "Boron", nameFA: "بور", mass: 10.81, cat: "metalloid", group: 13, period: 2, config: "[He] 2s² 2p¹", p: 5, e: 5, n_count: 6, ox: "+3", state: "Solid", factEN: "Used in heat-resistant Pyrex glass chemistry glassware.", factFA: "در ساخت شیشه‌های مقاوم پیرکس آزمایشگاهی استفاده می‌شود." },
  { n: 6, s: "C", nameEN: "Carbon", nameFA: "کربن", mass: 12.011, cat: "nonmetal", group: 14, period: 2, config: "[He] 2s² 2p²", p: 6, e: 6, n_count: 6, ox: "+4, +2, -4", state: "Solid", factEN: "The chemical basis of all known biological life.", factFA: "پایه شیمیایی تمام زندگی‌های شناخته شده." },
  { n: 7, s: "N", nameEN: "Nitrogen", nameFA: "نیتروژن", mass: 14.007, cat: "nonmetal", group: 15, period: 2, config: "[He] 2s² 2p³", p: 7, e: 7, n_count: 7, ox: "+5, +3, -3", state: "Gas", factEN: "Makes up ~78% of Earth's atmosphere.", factFA: "حدود ۷۸٪ از جو زمین را تشکیل می‌دهد." },
  { n: 8, s: "O", nameEN: "Oxygen", nameFA: "اکسیژن", mass: 15.999, cat: "nonmetal", group: 16, period: 2, config: "[He] 2s² 2p⁴", p: 8, e: 8, n_count: 8, ox: "-2", state: "Gas", factEN: "Essential for cellular respiration and combustion.", factFA: "ضروری برای تنفس سلولی و سوختن." },
  { n: 9, s: "F", nameEN: "Fluorine", nameFA: "فلوئور", mass: 18.998, cat: "halogen", group: 17, period: 2, config: "[He] 2s² 2p⁵", p: 9, e: 9, n_count: 10, ox: "-1", state: "Gas", factEN: "Most electronegative chemical element.", factFA: "الکترونگاتیوترین عنصر شیمیایی." },
  { n: 10, s: "Ne", nameEN: "Neon", nameFA: "نئون", mass: 20.180, cat: "noble", group: 18, period: 2, config: "[He] 2s² 2p⁶", p: 10, e: 10, n_count: 10, ox: "0", state: "Gas", factEN: "Glows reddish-orange in high-voltage electric discharge.", factFA: "در تخلیه الکتریکی ولتاژ بالا به رنگ قرمز-نارنجی می‌درخشد." },
  { n: 11, s: "Na", nameEN: "Sodium", nameFA: "سدیم", mass: 22.990, cat: "alkali", group: 1, period: 3, config: "[Ne] 3s¹", p: 11, e: 11, n_count: 12, ox: "+1", state: "Solid", factEN: "Soft alkali metal that burns violently in contact with water.", factFA: "فلز قلیایی نرم که با آب واکنش شدید داده و می‌سوزد." },
  { n: 12, s: "Mg", nameEN: "Magnesium", nameFA: "منیزیم", mass: 24.305, cat: "alkaline", group: 2, period: 3, config: "[Ne] 3s²", p: 12, e: 12, n_count: 12, ox: "+2", state: "Solid", factEN: "Burns with a brilliant bright white light.", factFA: "با نور سفید بسیار درخشانی می‌سوزد." },
  { n: 13, s: "Al", nameEN: "Aluminium", nameFA: "آلومینیوم", mass: 26.982, cat: "post-transition", group: 13, period: 3, config: "[Ne] 3s² 3p¹", p: 13, e: 13, n_count: 14, ox: "+3", state: "Solid", factEN: "Low density, lightweight, corrosion resistant metal.", factFA: "فلزی سبک، با چگالی کم و مقاوم در برابر خوردگی." },
  { n: 14, s: "Si", nameEN: "Silicon", nameFA: "سیلیسیوم", mass: 28.085, cat: "metalloid", group: 14, period: 3, config: "[Ne] 3s² 3p²", p: 14, e: 14, n_count: 14, ox: "+4, -4", state: "Solid", factEN: "Key semiconductor powering modern microelectronics.", factFA: "نیمه‌هادی کلیدی در تولید میکروالکترونیک‌های مدرن." },
  { n: 15, s: "P", nameEN: "Phosphorus", nameFA: "فسفر", mass: 30.974, cat: "nonmetal", group: 15, period: 3, config: "[Ne] 3s² 3p³", p: 15, e: 15, n_count: 16, ox: "+5, +3, -3", state: "Solid", factEN: "Glows in dark (white phosphorus) and essential for DNA.", factFA: "در تاریکی می‌درخشد و برای ساختار دی‌ان‌ای ضروری است." },
  { n: 16, s: "S", nameEN: "Sulfur", nameFA: "گوگرد", mass: 32.06, cat: "nonmetal", group: 16, period: 3, config: "[Ne] 3s² 3p⁴", p: 16, e: 16, n_count: 16, ox: "+6, +4, -2", state: "Solid", factEN: "Bright yellow crystalline solid found near volcanoes.", factFA: "جامد بلوری زرد درخشان که در اطراف آتشفشان‌ها یافت می‌شود." },
  { n: 17, s: "Cl", nameEN: "Chlorine", nameFA: "کلر", mass: 35.45, cat: "halogen", group: 17, period: 3, config: "[Ne] 3s² 3p⁵", p: 17, e: 17, n_count: 18, ox: "+7, +5, +1, -1", state: "Gas", factEN: "Yellow-green gas used as disinfectant and in table salt.", factFA: "گاز زرد-سبز که به عنوان ضدعفونی‌کننده و در نمک طعام استفاده می‌شود." },
  { n: 18, s: "Ar", nameEN: "Argon", nameFA: "آرگون", mass: 39.948, cat: "noble", group: 18, period: 3, config: "[Ne] 3s² 3p⁶", p: 18, e: 18, n_count: 22, ox: "0", state: "Gas", factEN: "Inert gas widely used inside incandescent light bulbs.", factFA: "گاز بی‌اثر که در لامپ‌های رشته‌ای استفاده می‌شود." },
  { n: 19, s: "K", nameEN: "Potassium", nameFA: "پتاسیم", mass: 39.098, cat: "alkali", group: 1, period: 4, config: "[Ar] 4s¹", p: 19, e: 19, n_count: 20, ox: "+1", state: "Solid", factEN: "Essential electrolyte for nerve impulses in biological systems.", factFA: "الکترولیت حیاتی برای انتقال پیام‌های عصبی." },
  { n: 20, s: "Ca", nameEN: "Calcium", nameFA: "کلسیم", mass: 40.078, cat: "alkaline", group: 2, period: 4, config: "[Ar] 4s²", p: 20, e: 20, n_count: 20, ox: "+2", state: "Solid", factEN: "Main structural component of human bones and teeth.", factFA: "ماده اصلی تشکیل‌دهنده استخوان‌ها و دندان‌ها." },
  { n: 29, s: "Cu", nameEN: "Copper", nameFA: "مس", mass: 63.546, cat: "transition", group: 11, period: 4, config: "[Ar] 3d¹⁰ 4s¹", p: 29, e: 29, n_count: 35, ox: "+2, +1", state: "Solid", factEN: "High electrical conductivity; forms blue vitriol when oxidised.", factFA: "رسانایی الکتریکی بالا؛ در صورت اکسیداسیون کات کبود آبی می‌سازد." },
  { n: 30, s: "Zn", nameEN: "Zinc", nameFA: "روی", mass: 65.38, cat: "transition", group: 12, period: 4, config: "[Ar] 3d¹⁰ 4s²", p: 30, e: 30, n_count: 35, ox: "+2", state: "Solid", factEN: "Used to galvanise iron steel to prevent rust.", factFA: "برای گالوانیزه کردن آهن و جلوگیری از زنگ‌زدگی استفاده می‌شود." },
  { n: 35, s: "Br", nameEN: "Bromine", nameFA: "برم", mass: 79.904, cat: "halogen", group: 17, period: 4, config: "[Ar] 3d¹⁰ 4s² 4p⁵", p: 35, e: 35, n_count: 45, ox: "+5, +1, -1", state: "Liquid", factEN: "Only nonmetallic element that is liquid at room temperature.", factFA: "تنها عنصر نافلزی که در دمای اتاق مایع است." },
  { n: 47, s: "Ag", nameEN: "Silver", nameFA: "نقره", mass: 107.87, cat: "transition", group: 11, period: 5, config: "[Kr] 4d¹⁰ 5s¹", p: 47, e: 47, n_count: 61, ox: "+1", state: "Solid", factEN: "Highest thermal and electrical conductivity of all metals.", factFA: "بالاترین رسانایی الکتریکی و گرمایی در میان تمام فلزات." },
  { n: 79, s: "Au", nameEN: "Gold", nameFA: "طلا", mass: 196.97, cat: "transition", group: 11, period: 6, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", p: 79, e: 79, n_count: 118, ox: "+3, +1", state: "Solid", factEN: "Unreactive precious metal that does not tarnish.", factFA: "فلز گرانبها و بسیار کم‌واکنش که کدر نمی‌شود." },
  { n: 80, s: "Hg", nameEN: "Mercury", nameFA: "جیوه", mass: 200.59, cat: "transition", group: 12, period: 6, config: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", p: 80, e: 80, n_count: 121, ox: "+2, +1", state: "Liquid", factEN: "Dense metal that remains liquid at STP.", factFA: "فلز سنگینی که در شرایط استاندارد مایع باقی می‌ماند." }
];

// Helper to fill procedural element cards for full 118 grid visualization
const generateFullPeriodicTable = () => {
  // Official element symbols in atomic-number order (1–118).
  const symbols = [
    "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
    "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
    "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
    "Ga", "Ge", "As", "Se", "Br", "Kr",
    "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd",
    "In", "Sn", "Sb", "Te", "I", "Xe",
    "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
    "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
    "Tl", "Pb", "Bi", "Po", "At", "Rn",
    "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
    "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn",
    "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
  ];

  const positions = (n) => {
    if (n === 1) return { group: 1, period: 1 };
    if (n === 2) return { group: 18, period: 1 };
    if (n >= 3 && n <= 4) return { group: n - 2, period: 2 };
    if (n >= 5 && n <= 10) return { group: n + 8, period: 2 };
    if (n >= 11 && n <= 12) return { group: n - 10, period: 3 };
    if (n >= 13 && n <= 18) return { group: n, period: 3 };
    if (n >= 19 && n <= 36) return { group: n - 18, period: 4 };
    if (n >= 37 && n <= 54) return { group: n - 36, period: 5 };
    if (n >= 55 && n <= 56) return { group: n - 54, period: 6 };
    if (n >= 57 && n <= 71) return { group: n - 54, period: 8 };
    if (n >= 72 && n <= 86) return { group: n - 68, period: 6 };
    if (n >= 87 && n <= 88) return { group: n - 86, period: 7 };
    if (n >= 89 && n <= 103) return { group: n - 86, period: 9 };
    return { group: n - 100, period: 7 };
  };

  const categoryFor = (n, group) => {
    if (n >= 57 && n <= 71) return "lanthanide";
    if (n >= 89 && n <= 103) return "actinide";
    if (group === 1) return "alkali";
    if (group === 2) return "alkaline";
    if (group >= 3 && group <= 12) return "transition";
    if ([5, 14, 32, 33, 51, 52].includes(n)) return "metalloid";
    if ([13, 31, 49, 50, 81, 82, 83, 84].includes(n)) return "post-transition";
    if (group === 17) return "halogen";
    if (group === 18) return "noble";
    return "nonmetal";
  };

  const detailedByNumber = new Map(DETAILED_ELEMENTS.map(element => [element.n, element]));

  return symbols.map((symbol, index) => {
    const n = index + 1;
    const position = positions(n);
    const existing = detailedByNumber.get(n);

    // Keep verified records intact, but always use the canonical symbol and position.
    if (existing) {
      return {
        ...existing,
        s: symbol,
        group: position.group,
        period: position.period,
        cat: categoryFor(n, position.group)
      };
    }

    // These entries are intentionally display placeholders, not fabricated chemistry data.
    return {
      n,
      s: symbol,
      nameEN: `Element ${n}`,
      nameFA: `عنصر ${n}`,
      mass: null,
      cat: categoryFor(n, position.group),
      group: position.group,
      period: position.period,
      config: null,
      p: n,
      e: n,
      n_count: null,
      ox: null,
      state: null,
      factEN: "This element's detailed record has not yet been verified in the site database.",
      factFA: "اطلاعات علمی تفصیلی این عنصر هنوز در پایگاه داده سایت تأیید نشده است.",
      isVerifiedRecord: false
    };
  });
};

const ALL_ELEMENTS = generateFullPeriodicTable();

// Compound Database
const KNOWN_COMPOUNDS = [
  { formula: "H2O", nameEN: "Water", nameFA: "آب", mass: 18.015, type: "Covalent", descEN: "Universal solvent essential for life.", descFA: "حلال جهانی و مایع حیاتی برای زندگی." },
  { formula: "CO2", nameEN: "Carbon Dioxide", nameFA: "دی‌اکسید کربن", mass: 44.01, type: "Covalent", descEN: "Greenhouse gas produced by breathing & combustion.", descFA: "گاز گلخانه‌ای حاصل از تنفس و سوختن." },
  { formula: "NaCl", nameEN: "Sodium Chloride", nameFA: "کلرید سدیم (نمک)", mass: 58.44, type: "Ionic Salt", descEN: "Common table salt crystal lattice structure.", descFA: "نمک خوراکی معمولی با ساختار بلوری یونی." },
  { formula: "NH3", nameEN: "Ammonia", nameFA: "آمونیاک", mass: 17.03, type: "Covalent", descEN: "Pungent nitrogen gas used in fertilizers.", descFA: "گاز نیتروژن‌دار تند مورد استفاده در کودها." },
  { formula: "CH4", nameEN: "Methane", nameFA: "متان", mass: 16.04, type: "Covalent Hydrocarbon", descEN: "Primary component of natural gas fuel.", descFA: "ماده اصلی تشکیل‌دهنده گاز طبیعی." },
  { formula: "H2SO4", nameEN: "Sulfuric Acid", nameFA: "اسید سولفوریک", mass: 98.07, type: "Strong Mineral Acid", descEN: "Highly corrosive diprotic strong acid.", descFA: "اسید معدنی قوی و بسیار خورنده." },
  { formula: "CuSO4", nameEN: "Copper(II) Sulfate (Anhydrous)", nameFA: "سولفات مس بدون آب", mass: 159.61, type: "Ionic Salt", descEN: "Pale white powder when dry.", descFA: "پودر سفید کم‌رنگ در حالت خشک." },
  { formula: "CuSO4·5H2O", nameEN: "Copper Sulfate Pentahydrate", nameFA: "کات کبود (سولفات مس پنج‌آبه)", mass: 249.68, type: "Crystal Hydrate", descEN: "Vibrant bright electric blue crystals.", descFA: "بلورهای آبی‌رنگ درخشان و بسیار زیبا." },
  { formula: "CuO", nameEN: "Copper(II) Oxide", nameFA: "اکسید مس (II)", mass: 79.55, type: "Metal Oxide", descEN: "Black insoluble powder formed by oxidizing copper.", descFA: "پودر سیاه نامحلول حاصل از اکسیداسیون مس." },
  { formula: "Cu(OH)2", nameEN: "Copper(II) Hydroxide", nameFA: "هیدروکسید مس", mass: 97.56, type: "Insoluble Base", descEN: "Pale sky-blue gelatinous precipitate.", descFA: "رسوب ژلاتینی آبی کم‌رنگ." },
  { formula: "NaHCO3", nameEN: "Sodium Bicarbonate", nameFA: "جوش شیرین", mass: 84.007, type: "Ionic Salt", descEN: "Baking soda used for antacid or leavening.", descFA: "پودر سفید پخت‌وپز و ضد اسید معده." },
  { formula: "HCl", nameEN: "Hydrochloric Acid", nameFA: "هیدروکلریک اسید", mass: 36.46, type: "Strong Acid", descEN: "Stomach acid and industrial etching reagent.", descFA: "اسید معده و ماده حکاکی صنعتی." },
  { formula: "NaOH", nameEN: "Sodium Hydroxide", nameFA: "سود سوزآور (هیدروکسید سدیم)", mass: 39.997, type: "Strong Base", descEN: "Strong caustic alkali used in soap production.", descFA: "قلیای قوی سوزاننده برای صابون‌سازی." },
  { formula: "C6H12O6", nameEN: "Glucose", nameFA: "گلوکز", mass: 180.16, type: "Carbohydrate", descEN: "Essential monosaccharide energy source.", descFA: "قند ساده و منبع اصلی انرژی سلولی." }
];

// Validated Chemical Reactions for Lab Simulation
const VALIDATED_REACTIONS = [
  {
    id: "cuso4_prep_direct",
    nameEN: "Copper Oxidation with Hot Concentrated Acid",
    nameFA: "واکنش مستقیم مس با اسید غلیظ داغ",
    reactants: { "Cu": 1, "H2SO4": 2 },
    tempRequired: 80,
    products: { "CuSO4": 1, "SO2": 1, "H2O": 2 },
    eq: "Cu + 2 H₂SO₄ (conc, heat) ➔ CuSO₄ + SO₂↑ + 2 H₂O",
    colorChange: "rgba(14, 165, 233, 0.75)",
    effervescence: true,
    ppt: null,
    ph: 1.0,
    explanationEN: "Copper metal is unreactive with dilute acids. Concentrated hot sulfuric acid acts as an oxidizing agent, releasing toxic SO₂ gas and forming blue CuSO₄.",
    explanationFA: "مس با اسید رقیق واکنش نمی‌دهد. اسید سولفوریک داغ و غلیظ به عنوان اکسیدکننده عمل کرده، گاز SO₂ آزاد می‌کند و CuSO₄ آبی می‌سازد."
  },
  {
    id: "cuso4_prep_oxide",
    nameEN: "Copper Oxide Dissolution in Dilute Acid",
    nameFA: "حل شدن اکسید مس در اسید رقیق",
    reactants: { "CuO": 1, "H2SO4": 1 },
    tempRequired: 40,
    products: { "CuSO4": 1, "H2O": 1 },
    eq: "CuO (black) + H₂SO₄ (dilute) ➔ CuSO₄ (blue) + H₂O",
    colorChange: "rgba(56, 189, 248, 0.85)",
    effervescence: false,
    ppt: null,
    ph: 2.5,
    explanationEN: "Black copper oxide powder reacts smoothly with dilute sulfuric acid to yield clear blue solution of copper sulfate without gas evolution.",
    explanationFA: "پودر سیاه اکسید مس به آرامی با اسید سولفوریک رقیق واکنش داده و محلول شفاف آبی سولفات مس تولید می‌کند."
  },
  {
    id: "titration_acid_base",
    nameEN: "Acid-Base Neutralization with Indicator",
    nameFA: "خنثی‌سازی اسید و باز با شناساگر",
    reactants: { "HCl": 1, "NaOH": 1 },
    tempRequired: 20,
    products: { "NaCl": 1, "H2O": 1 },
    eq: "HCl + NaOH ➔ NaCimport React, { useState, useEffect, useRef, useMemo } from 'react';
import AcidBaseLab from './AcidBaseLab.jsx';
import ChemistryAcademy, { LESSONS as ACADEMY_LESSONS, QUESTIONS as ACADEMY_QUESTIONS } from './ChemistryAcademy.jsx';
import { CHEMICALS as ACID_BASE_CHEMICALS, EQUIPMENT as ACID_BASE_EQUIPMENT, REACTIONS as ACID_BASE_REACTIONS } from './AcidBaseLab.jsx';
import AIChat frl + H₂O",
    colorChange: "rgba(244, 63, 94, 0.15)", // Goes from vibrant pink phenolphthalein to clear neutral
    effervescence: false,
    ppt: null,
    ph: 7.0,
    explanationEN: "Neutralization reaction yielding harmless saltwater. Phenolphthalein shifts from bright magenta pink (pH > 8.2) to colorless at pH 7.",
    explanationFA: "واکنش خنثی‌سازی که آب‌نمک تولید می‌کند. شناساگر فنل‌فتالئین از صورتی پررنگ به بی‌رنگ در pH=۷ تغییر می‌یابد."
  },
  {
    id: "gas_baking_soda",
    nameEN: "Carbon Dioxide Effervescence",
    nameFA: "تولید گاز دی‌اکسید کربن با جوش شیرین",
    reactants: { "NaHCO3": 1, "HCl": 1 },
    tempRequired: 20,
    products: { "NaCl": 1, "H2O": 1, "CO2": 1 },
    eq: "NaHCO₃ + HCl ➔ NaCl + H₂O + CO₂↑",
    colorChange: "rgba(255, 255, 255, 0.2)",
    effervescence: true,
    ppt: null,
    ph: 6.0,
    explanationEN: "Vigorous fizzing effervescence as carbon dioxide gas bubbles rapidly out of solution.",
    explanationFA: "جوشش شدید و غلیان سریع با خروج حباب‌های گاز دی‌اکسید کربن از محلول."
  },
  {
    id: "precipitation_cuoh2",
    nameEN: "Copper Hydroxide Blue Precipitation",
    nameFA: "رسوب‌گیری هیدروکسید مس آبی",
    reactants: { "CuSO4": 1, "NaOH": 2 },
    tempRequired: 20,
    products: { "Cu(OH)2": 1, "Na2SO4": 1 },
    eq: "CuSO₄ + 2 NaOH ➔ Cu(OH)₂↓ (sky blue ppt) + Na₂SO₄",
    colorChange: "rgba(2, 132, 199, 0.9)",
    effervescence: false,
    ppt: "sky-blue",
    ph: 10.5,
    explanationEN: "Double displacement reaction producing a thick gelatinous sky-blue precipitate of insoluble copper(II) hydroxide.",
    explanationFA: "واکنش جابه‌جایی دوگانه که یک رسوب ژلاتینی آبی آسمانی از هیدروکسید مس نامحلول تولید می‌کند."
  }
];

// Helper to format formulas with subscript HTML
const renderSubscriptFormula = (formula) => {
  if (!formula) return "";
  const parts = formula.split(/(\d+)/);
  return parts.map((part, idx) => {
    if (/^\d+$/.test(part)) {
      return <sub key={idx} className="text-[0.75em] font-semibold">{part}</sub>;
    }
    return <span key={idx}>{part}</span>;
  });
};

// Category Colors for Periodic Table
const CATEGORY_COLORS = {
  "alkali": "bg-red-900/40 border-red-500/60 text-red-300",
  "alkaline": "bg-amber-900/40 border-amber-500/60 text-amber-300",
  "transition": "bg-blue-900/40 border-blue-500/60 text-blue-300",
  "post-transition": "bg-teal-900/40 border-teal-500/60 text-teal-300",
  "metalloid": "bg-emerald-900/40 border-emerald-500/60 text-emerald-300",
  "nonmetal": "bg-cyan-900/40 border-cyan-500/60 text-cyan-300",
  "halogen": "bg-indigo-900/40 border-indigo-500/60 text-indigo-300",
  "noble": "bg-purple-900/40 border-purple-500/60 text-purple-300",
  "lanthanide": "bg-pink-900/40 border-pink-500/60 text-pink-300",
  "actinide": "bg-rose-900/40 border-rose-500/60 text-rose-300"
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  // App state
  const [lang, setLang] = useState('EN'); // 'EN' | 'FA'
  const [activeTab, setActiveTab] = useState('periodic'); // periodic | acidbase | academy | builder | quiz
  const [userXP, setUserXP] = useState(250);
  const [userLevel, setUserLevel] = useState(2);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selected element for Periodic Modal
  const [selectedElement, setSelectedElement] = useState(ALL_ELEMENTS[0]);
  const [elementModalOpen, setElementModalOpen] = useState(false);
  const [ptSearch, setPtSearch] = useState('');
  const [ptFilterCat, setPtFilterCat] = useState('all');

  // Atom Builder State
  const [workspaceAtoms, setWorkspaceAtoms] = useState({ H: 2, O: 1 });
  const [builderGuidance, setBuilderGuidance] = useState('');


  // Lab Notebook Log
  const [labLogs, setLabLogs] = useState([
    { id: 1, title: "Initial Lab Setup", date: "10:15 AM", details: "Calibrated electronic pH sensor and heated test tube." }
  ]);


  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);

  // AI Tutor Drawer State
  const [aiOpen, setAiOpen] = useState(false);

  // Handle XP Gains
  const addXP = (amount, reason) => {
    setUserXP(prev => {
      const nextXP = prev + amount;
      if (nextXP >= userLevel * 200) {
        setUserLevel(lvl => lvl + 1);
        addLog(`Level Up! Reached Level ${userLevel + 1}`, `Earned bonus XP: ${reason}`);
      }
      return nextXP;
    });
  };

  const addLog = (title, details) => {
    setLabLogs(prev => [
      { id: Date.now(), title, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), details },
      ...prev
    ]);
  };

  // Helper for bilingual texts
  const t = (en, fa) => (lang === 'FA' ? fa : en);

  // Snapshot of the actual bundled site knowledge sent to the private AI server.
  const siteContext = useMemo(() => ({
    website: 'Chemistry Lab: Atom to Molecule',
    language: ['Persian', 'English'],
    features: ['Periodic table UI with 118 tiles (some entries are generated placeholders, not verified element records)', 'Molecule builder', 'Acid-base educational simulator', 'Chemistry academy lessons and quizzes', 'Personal experiment notebook', 'XP and levels', 'AI tutor and reviewed knowledge additions'],
    verifiedElementRecords: DETAILED_ELEMENTS,
    periodicTable: ALL_ELEMENTS.map(element => ({ ...element, isVerifiedRecord: DETAILED_ELEMENTS.some(record => record.n === element.n) })),
    compounds: KNOWN_COMPOUNDS,
    acidBaseChemicalCatalogue: ACID_BASE_CHEMICALS,
    acidBaseEquipment: ACID_BASE_EQUIPMENT.map(({ id, fa, en, desc }) => ({ id, fa, en, desc })),
    acidBaseReactions: ACID_BASE_REACTIONS,
    academyLessons: ACADEMY_LESSONS.map(({ id, title, en, level, summary, body, example, mistake, safety }) => ({ id, title, en, level, summary, body, example, mistake, safety })),
    academyQuiz: ACADEMY_QUESTIONS,
    registeredReactions: VALIDATED_REACTIONS.map(r => ({ id: r.id, nameFA: r.nameFA, nameEN: r.nameEN, reactants: r.reactants, products: r.products, equation: r.eq, explanationFA: r.explanationFA })),
    academyTopics: ['ساختار اتم و ایزوتوپ‌ها', 'جدول تناوبی و روندها', 'پیوندهای شیمیایی و شکل مولکول', 'مول و جرم مولی', 'معادله‌نویسی و موازنه واکنش', 'اسیدها و بازها', 'تعادل شیمیایی', 'سرعت واکنش', 'انرژی و آنتالپی', 'اکسایش و کاهش', 'شیمی آلی و گروه‌های عاملی', 'محلول و غلظت', 'گازها', 'انحلال‌پذیری', 'طیف‌سنجی', 'بیوشیمی', 'شیمی هسته‌ای', 'مواد و پلیمرها', 'روش علمی'],
    aiKnowledgePolicy: 'Use the full supplied site snapshot, including lessons, verified element records, compound catalogue, acid-base chemicals, equipment, reactions and approved knowledge additions. Clearly distinguish site content from general model knowledge. Never claim missing pages or experiments exist.',
    note: 'This is a snapshot of the shipped project data, not a claim that it is a complete chemistry database.'
  }), []);

  // ==========================================
  // BUILDER LOGIC
  // ==========================================
  const addAtomToWorkspace = (symbol) => {
    setWorkspaceAtoms(prev => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + 1
    }));
  };

  const removeAtomFromWorkspace = (symbol) => {
    setWorkspaceAtoms(prev => {
      const copy = { ...prev };
      if (copy[symbol] > 1) copy[symbol]--;
      else delete copy[symbol];
      return copy;
    });
  };

  const clearWorkspace = () => setWorkspaceAtoms({});

  // Dynamic chemical formula builder
  const constructedFormula = useMemo(() => {
    const keys = Object.keys(workspaceAtoms);
    if (keys.length === 0) return "";
    
    // Sort standard Hill system order (C first, H second, rest alphabetically)
    keys.sort((a, b) => {
      if (a === 'C') return -1;
      if (b === 'C') return 1;
      if (a === 'H') return -1;
      if (b === 'H') return 1;
      return a.localeCompare(b);
    });

    return keys.map(k => `${k}${workspaceAtoms[k] > 1 ? workspaceAtoms[k] : ''}`).join('');
  }, [workspaceAtoms]);

  // Calculate Molar Mass
  const calculatedMolarMass = useMemo(() => {
    let mass = 0;
    Object.entries(workspaceAtoms).forEach(([sym, count]) => {
      const elem = ALL_ELEMENTS.find(e => e.s === sym);
      if (elem && Number.isFinite(elem.mass)) mass += elem.mass * count;
    });
    return mass > 0 ? mass.toFixed(3) : "—";
  }, [workspaceAtoms]);

  // Matched Known Compound
  const matchedCompound = useMemo(() => {
    if (!constructedFormula) return null;
    return KNOWN_COMPOUNDS.find(c => c.formula.replace('·5H2O','') === constructedFormula || c.formula === constructedFormula);
  }, [constructedFormula]);

  // Validate chemistry constraints
  useEffect(() => {
    if (Object.keys(workspaceAtoms).length === 0) {
      setBuilderGuidance(t("Add elements from the Periodic Table to synthesize a molecule.", "برای ساخت مولکول، عناصری را از جدول تناوبی اضافه کنید."));
      return;
    }
    if (matchedCompound) {
      setBuilderGuidance(t(`Stable Compound Identified: ${matchedCompound.nameEN} (${matchedCompound.type}).`, `ترکیب پایدار شناسایی شد: ${matchedCompound.nameFA} (${matchedCompound.type}).`));
    } else {
      setBuilderGuidance(t("Unstable or unverified combination. Arbitrary collections of atoms may not form stable molecules under standard chemical valence rules.", "ترکیب ناپایدار یا تایید‌نشده. ساختارهای تصادفی اتم‌ها طبق قوانین ظرفیت شیمیایی لزوماً تشکیل مولکول پایدار نمی‌دهند."));
    }
  }, [workspaceAtoms, matchedCompound, lang]);

  // Sample Quiz Questions
  const QUIZ_QUESTIONS = [
    {
      qEN: "Why does raw copper metal (Cu) NOT produce hydrogen gas when placed in cold dilute sulfuric acid (H₂SO₄)?",
      qFA: "چرا فلز مس (Cu) در اسید سولفوریک رقیق و سرد گاز هیدروژن تولید نمی‌کند؟",
      optsEN: [
        "Copper is less reactive than hydrogen in the electrochemical series",
        "Sulfuric acid is a weak acid",
        "Copper turns directly into gold",
        "The acid immediately evaporates"
      ],
      optsFA: [
        "مس در جدول واکنش‌پذیری پایین‌تر از هیدروژن قرار دارد",
        "اسید سولفوریک یک اسید ضعیف است",
        "مس مستقیماً به طلا تبدیل می‌شود",
        "اسید به سرعت تبخیر می‌شود"
      ],
      correct: 0,
      expEN: "Copper has a lower standard reduction potential than hydrogen, so it cannot displace H⁺ ions from dilute acids without an oxidizing reaction.",
      expFA: "پتانسیل کاهش استاندارد مس کمتر از هیدروژن است، بنابراین نمی‌تواند بدون عامل اکسیدکننده یون‌های ⁺H را آزاد کند."
    },
    {
      qEN: "What is the formula for vivid blue vitriol crystals?",
      qFA: "فرمول شیمیایی بلورهای درخشان کات کبود چیست؟",
      optsEN: ["CuSO₄", "CuSO₄·5H₂O", "Cu(OH)₂", "CuO"],
      optsFA: ["CuSO₄", "CuSO₄·5H₂O", "Cu(OH)₂", "CuO"],
      correct: 1,
      expEN: "Copper sulfate pentahydrate contains 5 water molecules bound in the crystal lattice, giving it its vibrant blue color.",
      expFA: "سولفات مس پنج‌آبه دارای ۵ مولکول آب درون شبکه بلوری است که رنگ آبی درخشان را ایجاد می‌کند."
    }
  ];

  return (
    <div className={`min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col ${lang === 'FA' ? 'rtl' : 'ltr'}`}>
      
      {/* HEADER BAR */}
      <header className="bg-[#111827]/90 backdrop-blur border-b border-cyan-500/20 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-lg shadow-cyan-950/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-400/30 text-cyan-400 animate-pulse">
            <Atom className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-wider">
              {t("CHEMISTRY LAB: ATOM TO MOLECULE", "آزمایشگاه شیمی: از اتم تا مولکول")}
            </h1>
            <p className="text-xs text-slate-400">
              {t("Interactive Scientific Simulation Engine", "موتور شبیه‌ساز تعاملی و علمی شیمی")}
            </p>
          </div>
        </div>

        {/* User XP & Level Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{t("Level", "سطح")} <strong className="text-amber-300 font-bold">{userLevel}</strong></span>
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden ml-1">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${(userXP % 200) / 2}%` }}
              />
            </div>
            <span className="text-cyan-400 font-mono">{userXP} XP</span>
          </div>

          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Language Switcher */}
          <button 
            onClick={() => setLang(lang === 'EN' ? 'FA' : 'EN')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/60 transition"
          >
            <Languages className="w-4 h-4" />
            <span>{lang === 'EN' ? 'فارسی' : 'English'}</span>
          </button>

          {/* AI Assistant Button */}
          <button 
            onClick={() => setAiOpen(!aiOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{t("Dr. Atomus AI", "هوش مصنوعی")}</span>
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="bg-[#0f172a] border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'periodic', labelEN: 'Periodic Table (118)', labelFA: 'جدول تناوبی (۱۱۸)', icon: Atom },
          { id: 'acidbase', labelEN: 'Acid–Base Lab', labelFA: 'مرکز اسید و باز', icon: FlaskConical },
          { id: 'academy', labelEN: 'Chemistry Academy', labelFA: 'دانشنامهٔ شیمی', icon: BookOpen },
          { id: 'builder', labelEN: 'Molecule Builder', labelFA: 'مولکول‌ساز', icon: Zap },
          { id: 'quiz', labelEN: 'Reaction Quiz', labelFA: 'کوییز و آزمون', icon: Lightbulb },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-950/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{t(tab.labelEN, tab.labelFA)}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto grid grid-cols-1 gap-6">
        
        {activeTab === 'acidbase' && (
          <AcidBaseLab lang={lang} onLog={(title, details) => addLog(title, details)} onXP={(amount, reason) => addXP(amount, reason)} />
        )}

        {activeTab === 'academy' && (
          <ChemistryAcademy lang={lang} onXP={(amount, reason) => addXP(amount, reason)} />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: INTERACTIVE 118-ELEMENT PERIODIC TABLE */}
        {/* ========================================================================= */}
        {activeTab === 'periodic' && (
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={ptSearch}
                  onChange={(e) => setPtSearch(e.target.value)}
                  placeholder={t("Search by symbol, name or number...", "جستجو براساس نماد، نام یا عدد اتمی...")}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <ListFilter className="w-4 h-4 text-cyan-400 shrink-0" />
                {["all", "alkali", "alkaline", "transition", "post-transition", "metalloid", "nonmetal", "halogen", "noble", "lanthanide", "actinide"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPtFilterCat(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition ${
                      ptFilterCat === cat 
                        ? 'bg-cyan-500 text-slate-950 font-bold' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Periodic Table Grid */}
            <div className="bg-[#0f172a]/90 p-4 rounded-3xl border border-slate-800 shadow-2xl overflow-x-auto">
              <div className="min-w-[1050px] grid grid-cols-18 auto-rows-[76px] gap-1.5 text-center">
                {ALL_ELEMENTS.map(elem => {
                  const query = ptSearch.trim().toLowerCase();
                  const matchSearch = !query ||
                                      elem.s.toLowerCase().includes(query) ||
                                      elem.nameEN.toLowerCase().includes(query) ||
                                      elem.nameFA.toLowerCase().includes(query) ||
                                      String(elem.n) === query;
                  const matchCat = ptFilterCat === 'all' || elem.cat === ptFilterCat;
                  const isHighlighted = matchSearch && matchCat;

                  const colorStyle = CATEGORY_COLORS[elem.cat] || "bg-slate-800 border-slate-700 text-slate-300";

                  return (
                    <div
                      key={elem.n}
                      onClick={() => {
                        setSelectedElement(elem);
                        setElementModalOpen(true);
                      }}
                      className={`relative p-1.5 rounded-lg border flex flex-col justify-between cursor-pointer transition-all transform hover:scale-105 hover:z-20 ${colorStyle} ${
                        !isHighlighted ? 'opacity-20 hover:opacity-100' : 'opacity-100 shadow-md'
                      }`}
                      style={{
                        gridColumn: elem.group,
                        gridRow: elem.period
                      }}
                    >
                      <span className="text-[9px] opacity-70 self-start font-mono">{elem.n}</span>
                      <span className="text-base font-black tracking-tight">{elem.s}</span>
                      <span className="text-[9px] leading-tight line-clamp-2 font-medium">{t(elem.nameEN, elem.nameFA)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Element Detail Drawer / Modal */}
            {elementModalOpen && selectedElement && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#111827] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl shadow-cyan-950 space-y-5 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex flex-col items-center justify-center text-cyan-300 font-bold shadow-inner">
                        <span className="text-xs opacity-70">{selectedElement.n}</span>
                        <span className="text-2xl">{selectedElement.s}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-100">{t(selectedElement.nameEN, selectedElement.nameFA)}</h3>
                        <span className="text-xs text-cyan-400 font-medium capitalize">{selectedElement.cat} • Period {selectedElement.period}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setElementModalOpen(false)}
                      className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">{t("Standard Atomic Weight", "جرم اتمی استاندارد")}</span>
                      <p className="text-sm font-bold text-slate-200 mt-1">{Number.isFinite(selectedElement.mass) ? `${selectedElement.mass} g/mol` : t("Not verified", "تأیید نشده")}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">{t("Electron Configuration", "آرایش الکترونی")}</span>
                      <p className="text-sm font-bold text-cyan-300 mt-1 font-mono">{selectedElement.config || t("Not verified", "تأیید نشده")}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">{t("Protons / Electrons / Neutrons", "پروتون / الکترون / نوترون")}</span>
                      <p className="text-sm font-bold text-emerald-400 mt-1">{selectedElement.p} p⁺ / {selectedElement.e} e⁻ / {selectedElement.n_count ?? t("n/a", "نامشخص")} n⁰</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400">{t("State at STP", "حالت در شرایط استاندارد")}</span>
                      <p className="text-sm font-bold text-amber-400 mt-1">{selectedElement.state || t("Not verified", "تأیید نشده")}</p>
                    </div>
                  </div>

                  <div className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-xl text-xs text-cyan-200">
                    <strong className="text-cyan-400">{t("Fact & Usage: ", "نکته علمی: ")}</strong>
                    {t(selectedElement.factEN, selectedElement.factFA)}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addAtomToWorkspace(selectedElement.s);
                        setElementModalOpen(false);
                        setActiveTab('builder');
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t("Add Atom to Molecule Builder", "افزودن اتم به مولکول‌ساز")}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MOLECULAR CONSTRUCTION WORKSHOP */}
        {/* ========================================================================= */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Quick Add Palette */}
            <div className="bg-[#111827] p-5 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Atom className="w-4 h-4" />
                <span>{t("Atom Selection Palette", "پالت اتم‌های سریع")}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {t("Click elements to add to your molecular assembly bench.", "روی اتم‌ها کلیک کنید تا به میز ساخت اضافه شوند.")}
              </p>

              <div className="grid grid-cols-3 gap-2">
                {["H", "O", "C", "Cu", "S", "Na", "Cl", "N", "Ca"].map(sym => {
                  const elem = ALL_ELEMENTS.find(e => e.s === sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => addAtomToWorkspace(sym)}
                      className="p-3 bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 rounded-2xl flex flex-col items-center justify-center transition group shadow-md"
                    >
                      <span className="text-lg font-black text-slate-200 group-hover:text-cyan-300">{sym}</span>
                      <span className="text-[10px] text-slate-400">{elem ? t(elem.nameEN, elem.nameFA) : ''}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('periodic')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{t("Browse All 118 Elements", "مرور تمام ۱۱۸ عنصر")}</span>
                </button>
              </div>
            </div>

            {/* Middle: Workspace Canvas & Dynamic Formula */}
            <div className="lg:col-span-2 bg-[#111827] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{t("Molecular Construction Bench", "میز ساخت مولکولی")}</h2>
                  <p className="text-xs text-slate-400">{t("Real-time valence analysis and molar calculation", "تحلیل زنده ظرفیت اتم‌ها و محاسبه جرم مولی")}</p>
                </div>
                <button
                  onClick={clearWorkspace}
                  className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("Clear Workspace", "پاکسازی میز")}</span>
                </button>
              </div>

              {/* Active Workspace Atom Tokens */}
              <div className="min-h-[160px] bg-slate-950/80 rounded-2xl border border-slate-800/80 p-6 flex flex-wrap items-center justify-center gap-4 relative overflow-hidden">
                {Object.keys(workspaceAtoms).length === 0 ? (
                  <div className="text-center text-slate-500 text-xs">
                    <Atom className="w-12 h-12 mx-auto mb-2 opacity-30 animate-spin" />
                    <span>{t("Workspace Empty. Add atoms to begin assembling.", "میز کار خالی است. برای ساخت، اتم اضافه کنید.")}</span>
                  </div>
                ) : (
                  Object.entries(workspaceAtoms).map(([sym, count]) => (
                    <div key={sym} className="flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/40 px-4 py-2 rounded-2xl shadow-lg animate-in zoom-in">
                      <span className="text-xl font-bold text-cyan-300">{sym}</span>
                      <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1">
                        <button 
                          onClick={() => removeAtomFromWorkspace(sym)}
                          className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-100">{count}</span>
                        <button 
                          onClick={() => addAtomToWorkspace(sym)}
                          className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Output Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400">{t("Formulated Chemical Symbol", "فرمول شیمیایی حاصل")}</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1 tracking-widest font-mono">
                    {constructedFormula ? renderSubscriptFormula(constructedFormula) : "—"}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400">{t("Calculated Molecular Mass", "جرم مولکولی محاسبه شده")}</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                    {calculatedMolarMass} <span className="text-xs text-slate-400">g/mol</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Chemistry Guidance Box */}
              <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                matchedCompound 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              }`}>
                {matchedCompound ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                <div>
                  <strong className="block font-bold mb-1">{matchedCompound ? t("Valid Stable Compound", "ترکیب پایدار تایید شده") : t("Chemical Feasibility Notice", "بررسی امکان‌پذیری شیمیایی")}</strong>
                  <p>{builderGuidance}</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: REACTION BALANCING QUIZ */}
        {/* ========================================================================= */}
        {activeTab === 'quiz' && (
          <div className="bg-[#111827] p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100">{t("Chemical Stoichiometry & Reaction Quiz", "آزمون استوکیومتری و واکنش‌های شیمیایی")}</h2>
                <p className="text-xs text-slate-400">{t("Test your conceptual understanding of chemical conservation laws.", "سنجش دانش شما در خصوص قوانین پایستگی جرم و اتم‌ها.")}</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                Score: {quizScore}
              </span>
            </div>

            {/* Quiz Question Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-xs text-cyan-400 font-bold">Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <h3 className="text-sm md:text-base font-bold text-slate-100 leading-relaxed">
                {t(QUIZ_QUESTIONS[quizIndex].qEN, QUIZ_QUESTIONS[quizIndex].qFA)}
              </h3>

              <div className="space-y-2 pt-2">
                {(lang === 'FA' ? QUIZ_QUESTIONS[quizIndex].optsFA : QUIZ_QUESTIONS[quizIndex].optsEN).map((opt, idx) => {
                  const isSelected = quizSelectedOption === idx;
                  const isCorrect = idx === QUIZ_QUESTIONS[quizIndex].correct;
                  let btnStyle = "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800";

                  if (quizAnswerChecked) {
                    if (isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                    else if (isSelected) btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                  } else if (isSelected) {
                    btnStyle = "bg-cyan-950 border-cyan-400 text-cyan-200 font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !quizAnswerChecked && setQuizSelectedOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-xs text-left transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Check Answer Button & Explanation */}
              <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                {!quizAnswerChecked ? (
                  <button
                    onClick={() => {
                      if (quizSelectedOption === null) return;
                      setQuizAnswerChecked(true);
                      if (quizSelectedOption === QUIZ_QUESTIONS[quizIndex].correct) {
                        setQuizScore(s => s + 50);
                        addXP(50, "Quiz Correct Answer");
                      }
                    }}
                    disabled={quizSelectedOption === null}
                    className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    {t("SUBMIT ANSWER", "تایید و بررسی پاسخ")}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSelectedOption(null);
                      setQuizAnswerChecked(false);
                      setQuizIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
                    }}
                    className="w-full md:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl text-xs transition"
                  >
                    {t("NEXT QUESTION ➔", "سوال بعدی ➔")}
                  </button>
                )}
              </div>

              {quizAnswerChecked && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed animate-in fade-in">
                  <strong className="text-cyan-400 block mb-1">{t("Scientific Explanation:", "توضیح علمی:")}</strong>
                  {t(QUIZ_QUESTIONS[quizIndex].expEN, QUIZ_QUESTIONS[quizIndex].expFA)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PERSONAL LAB NOTEBOOK LOGS */}
        {/* ========================================================================= */}
        <section className="bg-[#111827] p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{t("Personal Laboratory Experiment Notebook", "دفترچه ثبت آزمایش‌های شخصی")}</span>
            </h3>
            <span className="text-xs text-slate-500">{labLogs.length} {t("Entries Logged", "مورد ثبت شده")}</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {labLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs flex justify-between items-start gap-4">
                <div>
                  <strong className="text-slate-200 font-bold block">{log.title}</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono shrink-0">{log.date}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      <AIChat open={aiOpen} onClose={() => setAiOpen(false)} lang={lang} siteContext={siteContext} />

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#0b0f19] py-4 text-center text-xs text-slate-500">
        <p>{t("Chemistry Lab: Atom to Molecule • Built for Scientific Exploration", "آزمایشگاه شیمی: از اتم تا مولکول • طراحی شده برای کاوش علمی")}</p>
      </footer>

    </div>
  );
}
      </footer>

    </div>
  );
}
