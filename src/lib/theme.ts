import { FestivalTheme } from './types';

export interface ThemeConfig {
  name: string;
  maroon: string;
  festiveRed: string;
  coral: string;
  gold: string;
  goldLight: string;
  cream: string;
  charcoal: string;
  bgGradient: string;
  accentGradient: string;
  cardBg: string;
}

export const FESTIVAL_THEMES: Record<FestivalTheme, ThemeConfig> = {
  navratri: {
    name: 'Navratri Mahotsav',
    maroon: '#681F2B',
    festiveRed: '#C93B3B',
    coral: '#FF5149',
    gold: '#E8C477',
    goldLight: '#FFF1CF',
    cream: '#FFF4E3',
    charcoal: '#21171A',
    bgGradient: 'from-[#21171A] via-[#681F2B] to-[#21171A]',
    accentGradient: 'from-[#E8C477] via-[#FFF1CF] to-[#C93B3B]',
    cardBg: 'rgba(33, 23, 26, 0.85)',
  },
  diwali: {
    name: 'Shubh Deepavali',
    maroon: '#3A1542',
    festiveRed: '#8C1D40',
    coral: '#FF7A00',
    gold: '#FFD700',
    goldLight: '#FFF9D2',
    cream: '#FFF8EB',
    charcoal: '#1A0E22',
    bgGradient: 'from-[#1A0E22] via-[#3A1542] to-[#1A0E22]',
    accentGradient: 'from-[#FFD700] via-[#FFAE00] to-[#FF7A00]',
    cardBg: 'rgba(26, 14, 34, 0.85)',
  },
  holi: {
    name: 'Rangotsav Holi',
    maroon: '#6C1448',
    festiveRed: '#D62246',
    coral: '#FF4D6D',
    gold: '#F4A261',
    goldLight: '#FFE8D6',
    cream: '#FFFDF9',
    charcoal: '#1E121E',
    bgGradient: 'from-[#1E121E] via-[#6C1448] to-[#1E121E]',
    accentGradient: 'from-[#F4A261] via-[#E76F51] to-[#D62246]',
    cardBg: 'rgba(30, 18, 30, 0.85)',
  },
};

export const SHOWROOM_INFO = {
  brandName: 'EYEVENGERS',
  tagline: 'Premium Eyewear & Advanced Vision Care',
  city: 'Jodhpur',
  state: 'Rajasthan',
  country: 'India',
  pincode: '342014',
  landmark: 'opp. Birla School, opposite Royal Madrasi Restaurant',
  area: 'Bhadu Market, Vinayak Nagar, Katariya Choukha',
  addressLine: '137, Jhanwar Rd, opp. Birla School, opposite Royal Madrasi Restaurant, Vinayak Nagar, Katariya Choukha, Bhadu Market, Jodhpur, Rajasthan 342014',
  shortAddress: '137, Jhanwar Rd, opp. Birla School, Bhadu Market, Jodhpur',
  plusCode: '137, Jhanwar Rd, Bhadu Market, Jodhpur',
  mapsUrl: 'https://maps.google.com/?q=137,+Jhanwar+Rd,+opp.+Birla+School,+opposite+Royal+Madrasi+Restaurant,+Vinayak+Nagar,+Katariya+Choukha,+Bhadu+Market,+Jodhpur,+Rajasthan+342014',
  phone: '+91 72401 58860',
  secondaryPhone: '+91 88241 87493',
  email: 'care@eyevengers.com',
  workingHours: '10:30 AM - 9:00 PM (All 7 Days)',
};
