// BRAINSAIT: Bilingual utilities for SSDP platform
// TTLINC: Translation and localization utilities
// BILINGUAL: Arabic/English RTL/LTR support

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

/**
 * BILINGUAL: Get text direction for language
 */
export function getDirection(language: Language): Direction {
  return language === 'ar' ? 'rtl' : 'ltr';
}

/**
 * BILINGUAL: Check if language is RTL
 */
export function isRTL(language: Language): boolean {
  return language === 'ar';
}

/**
 * BILINGUAL: Get opposite direction
 */
export function getOppositeDirection(direction: Direction): Direction {
  return direction === 'rtl' ? 'ltr' : 'rtl';
}

/**
 * BILINGUAL: RTL-aware spacing utilities
 */
export interface RTLSpacing {
  marginStart: string;
  marginEnd: string;
  paddingStart: string;
  paddingEnd: string;
  start: string;
  end: string;
  textAlign: string;
}

export function getRTLSpacing(isRTL: boolean): RTLSpacing {
  return {
    marginStart: isRTL ? 'mr' : 'ml',
    marginEnd: isRTL ? 'ml' : 'mr',
    paddingStart: isRTL ? 'pr' : 'pl',
    paddingEnd: isRTL ? 'pl' : 'pr',
    start: isRTL ? 'right' : 'left',
    end: isRTL ? 'left' : 'right',
    textAlign: isRTL ? 'right' : 'left',
  };
}

/**
 * BILINGUAL: Bilingual text object
 */
export interface BilingualText {
  en: string;
  ar: string;
}

/**
 * BILINGUAL: Get text in current language
 */
export function getText(text: BilingualText, language: Language): string {
  return text[language];
}

/**
 * BILINGUAL: Create bilingual text object
 */
export function createBilingualText(en: string, ar: string): BilingualText {
  return { en, ar };
}

/**
 * BILINGUAL: Format number based on locale
 */
export function formatNumber(
  value: number,
  language: Language,
  options?: Intl.NumberFormatOptions
): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * BILINGUAL: Format currency (SAR)
 */
export function formatCurrency(
  amount: number,
  language: Language,
  showCurrency: boolean = true
): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
  
  if (!showCurrency) {
    return formatted.replace(/[^\d.,]/g, '').trim();
  }
  
  return formatted;
}

/**
 * BILINGUAL: Format date based on locale
 */
export function formatDate(
  date: Date | string,
  language: Language,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * BILINGUAL: Format date and time
 */
export function formatDateTime(
  date: Date | string,
  language: Language,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * BILINGUAL: Hijri calendar utilities
 */
export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

/**
 * BILINGUAL: Convert Gregorian to Hijri date (approximate)
 * Note: For production, use a proper Hijri calendar library
 */
export function toHijri(date: Date): HijriDate {
  // Simplified conversion - use proper library in production
  const gregorianYear = date.getFullYear();
  const hijriYear = Math.floor((gregorianYear - 622) * 1.03);
  
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  const month = date.getMonth();
  
  return {
    year: hijriYear,
    month: month + 1,
    day: date.getDate(),
    monthName: hijriMonths[month]
  };
}

/**
 * BILINGUAL: Format Hijri date
 */
export function formatHijriDate(hijriDate: HijriDate, language: Language): string {
  if (language === 'ar') {
    return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} هـ`;
  } else {
    return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`;
  }
}

/**
 * BILINGUAL: Get day name
 */
export function getDayName(date: Date, language: Language): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
}

/**
 * BILINGUAL: Get month name
 */
export function getMonthName(date: Date, language: Language): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
}

/**
 * BILINGUAL: Format phone number for Saudi Arabia
 */
export function formatPhoneNumber(phone: string, language: Language): string {
  // Remove non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Saudi phone number format: +966 XX XXX XXXX
  if (cleaned.startsWith('966')) {
    const formatted = `+966 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    return language === 'ar' ? formatted : formatted;
  }
  
  // If starts with 0, format as local
  if (cleaned.startsWith('0')) {
    const formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    return formatted;
  }
  
  return phone;
}

/**
 * BILINGUAL: Product categories in both languages
 */
export const productCategories: Record<string, BilingualText> = {
  sweets: { en: 'Sweets', ar: 'حلويات' },
  arabic_sweets: { en: 'Arabic Sweets', ar: 'حلويات عربية' },
  baklava: { en: 'Baklava', ar: 'بقلاوة' },
  kunafa: { en: 'Kunafa', ar: 'كنافة' },
  maamoul: { en: 'Maamoul', ar: 'معمول' },
  basbousa: { en: 'Basbousa', ar: 'بسبوسة' },
  qatayef: { en: 'Qatayef', ar: 'قطايف' },
  halawa: { en: 'Halawa', ar: 'حلاوة' },
  dates: { en: 'Dates', ar: 'تمور' },
  chocolates: { en: 'Chocolates', ar: 'شوكولاتة' },
  nuts: { en: 'Nuts', ar: 'مكسرات' },
};

/**
 * BILINGUAL: Order status translations
 */
export const orderStatuses: Record<string, BilingualText> = {
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  confirmed: { en: 'Confirmed', ar: 'مؤكد' },
  processing: { en: 'Processing', ar: 'قيد المعالجة' },
  shipped: { en: 'Shipped', ar: 'تم الشحن' },
  delivered: { en: 'Delivered', ar: 'تم التوصيل' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
};

/**
 * BILINGUAL: Payment method translations
 */
export const paymentMethods: Record<string, BilingualText> = {
  cash: { en: 'Cash', ar: 'نقدي' },
  mada: { en: 'Mada', ar: 'مدى' },
  stc_pay: { en: 'STC Pay', ar: 'STC Pay' },
  apple_pay: { en: 'Apple Pay', ar: 'Apple Pay' },
  credit: { en: 'Credit', ar: 'آجل' },
};

/**
 * BILINGUAL: Common phrases
 */
export const commonPhrases: Record<string, BilingualText> = {
  welcome: { en: 'Welcome', ar: 'مرحباً' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  error: { en: 'Error', ar: 'خطأ' },
  success: { en: 'Success', ar: 'نجح' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  delete: { en: 'Delete', ar: 'حذف' },
  edit: { en: 'Edit', ar: 'تعديل' },
  add: { en: 'Add', ar: 'إضافة' },
  search: { en: 'Search', ar: 'بحث' },
  filter: { en: 'Filter', ar: 'تصفية' },
  export: { en: 'Export', ar: 'تصدير' },
  print: { en: 'Print', ar: 'طباعة' },
  total: { en: 'Total', ar: 'المجموع' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
  vat: { en: 'VAT (15%)', ar: 'ضريبة القيمة المضافة (15%)' },
  discount: { en: 'Discount', ar: 'خصم' },
};

/**
 * BILINGUAL: Validate Arabic text
 */
export function isArabicText(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

/**
 * BILINGUAL: Convert Arabic numerals to English
 */
export function arabicToEnglishNumbers(text: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  arabicNumbers.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), englishNumbers[index]);
  });
  
  return result;
}

/**
 * BILINGUAL: Convert English numerals to Arabic
 */
export function englishToArabicNumbers(text: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  englishNumbers.forEach((english, index) => {
    result = result.replace(new RegExp(english, 'g'), arabicNumbers[index]);
  });
  
  return result;
}

/**
 * BILINGUAL: Get cultural greeting based on time of day
 */
export function getCulturalGreeting(language: Language): string {
  const hour = new Date().getHours();
  
  if (language === 'ar') {
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  } else {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}

/**
 * BILINGUAL: Saudi-specific date utilities
 */
export function isSaudiWeekend(date: Date): boolean {
  // Friday and Saturday are weekend in Saudi Arabia
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
}

export function getNextWorkingDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (isSaudiWeekend(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}

/**
 * BILINGUAL: Ramadan/Eid detection (approximate)
 * Note: Use proper Hijri calendar library in production
 */
export function isRamadan(date: Date): boolean {
  const hijri = toHijri(date);
  return hijri.month === 9; // Ramadan is the 9th month
}

export function isEid(date: Date): boolean {
  const hijri = toHijri(date);
  // Eid al-Fitr (1st of Shawwal) or Eid al-Adha (10th of Dhul Hijjah)
  return (hijri.month === 10 && hijri.day <= 3) || (hijri.month === 12 && hijri.day >= 9 && hijri.day <= 13);
}
