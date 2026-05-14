import { NextResponse } from 'next/server';

// Simulating a response from Agmarknet / eNAM API
const REAL_MANDI_DATA = [
  // Wheat
  { crop: 'Wheat (Lokwan)', state: 'Madhya Pradesh', market: 'Indore', price: 2450, prev: 2380, emoji: '🌾', category: 'Cereals' },
  { crop: 'Wheat (Sarbati)', state: 'Madhya Pradesh', market: 'Sehore', price: 2700, prev: 2650, emoji: '🌾', category: 'Cereals' },
  { crop: 'Wheat (Pissi)', state: 'Madhya Pradesh', market: 'Vidisha', price: 2100, prev: 2150, emoji: '🌾', category: 'Cereals' },
  { crop: 'Wheat (Common)', state: 'Punjab', market: 'Amritsar', price: 2275, prev: 2275, emoji: '🌾', category: 'Cereals' },
  { crop: 'Wheat (Common)', state: 'Uttar Pradesh', market: 'Agra', price: 2350, prev: 2300, emoji: '🌾', category: 'Cereals' },
  { crop: 'Wheat (Common)', state: 'Rajasthan', market: 'Kota', price: 2400, prev: 2420, emoji: '🌾', category: 'Cereals' },

  // Rice
  { crop: 'Rice (Basmati)', state: 'Punjab', market: 'Ludhiana', price: 3800, prev: 3750, emoji: '🍚', category: 'Cereals' },
  { crop: 'Rice (Basmati)', state: 'Uttar Pradesh', market: 'Saharanpur', price: 3650, prev: 3700, emoji: '🍚', category: 'Cereals' },
  { crop: 'Rice (Common)', state: 'Andhra Pradesh', market: 'Guntur', price: 2100, prev: 2050, emoji: '🍚', category: 'Cereals' },
  { crop: 'Rice (Common)', state: 'Bihar', market: 'Patna', price: 2250, prev: 2250, emoji: '🍚', category: 'Cereals' },

  // Onion
  { crop: 'Onion (Red)', state: 'Maharashtra', market: 'Lasalgaon', price: 1450, prev: 1550, emoji: '🧅', category: 'Vegetables' },
  { crop: 'Onion (Red)', state: 'Maharashtra', market: 'Pune', price: 1600, prev: 1600, emoji: '🧅', category: 'Vegetables' },
  { crop: 'Onion (Red)', state: 'Karnataka', market: 'Bangalore', price: 1800, prev: 1700, emoji: '🧅', category: 'Vegetables' },
  { crop: 'Onion (White)', state: 'Gujarat', market: 'Bhavnagar', price: 1200, prev: 1250, emoji: '🧅', category: 'Vegetables' },

  // Tomato
  { crop: 'Tomato (Hybrid)', state: 'Karnataka', market: 'Kolar', price: 850, prev: 900, emoji: '🍅', category: 'Vegetables' },
  { crop: 'Tomato (Local)', state: 'Maharashtra', market: 'Naranyangaon', price: 1100, prev: 1050, emoji: '🍅', category: 'Vegetables' },
  { crop: 'Tomato (Local)', state: 'Andhra Pradesh', market: 'Madanapalle', price: 750, prev: 800, emoji: '🍅', category: 'Vegetables' },

  // Potato
  { crop: 'Potato (Jyoti)', state: 'Uttar Pradesh', market: 'Agra', price: 950, prev: 1050, emoji: '🥔', category: 'Vegetables' },
  { crop: 'Potato (Jyoti)', state: 'Punjab', market: 'Jalandhar', price: 800, prev: 850, emoji: '🥔', category: 'Vegetables' },
  { crop: 'Potato (Local)', state: 'Bihar', market: 'Nalanda', price: 1100, prev: 1000, emoji: '🥔', category: 'Vegetables' },

  // Maize
  { crop: 'Maize (Hybrid)', state: 'Bihar', market: 'Purnea', price: 1850, prev: 1800, emoji: '🌽', category: 'Cereals' },
  { crop: 'Maize (Hybrid)', state: 'Karnataka', market: 'Davangere', price: 1950, prev: 1900, emoji: '🌽', category: 'Cereals' },
  { crop: 'Maize (Local)', state: 'Madhya Pradesh', market: 'Chhindwara', price: 1750, prev: 1750, emoji: '🌽', category: 'Cereals' },

  // Mustard
  { crop: 'Mustard (Black)', state: 'Rajasthan', market: 'Alwar', price: 5400, prev: 5350, emoji: '🟡', category: 'Oilseeds' },
  { crop: 'Mustard (Black)', state: 'Madhya Pradesh', market: 'Morena', price: 5250, prev: 5200, emoji: '🟡', category: 'Oilseeds' },
  { crop: 'Mustard (Yellow)', state: 'Uttar Pradesh', market: 'Kanpur', price: 5600, prev: 5500, emoji: '🟡', category: 'Oilseeds' },

  // Soybean
  { crop: 'Soybean (Yellow)', state: 'Madhya Pradesh', market: 'Ujjain', price: 4800, prev: 4750, emoji: '🫘', category: 'Oilseeds' },
  { crop: 'Soybean (Yellow)', state: 'Maharashtra', market: 'Latur', price: 4650, prev: 4700, emoji: '🫘', category: 'Oilseeds' },
  { crop: 'Soybean (Yellow)', state: 'Rajasthan', market: 'Kota', price: 4750, prev: 4700, emoji: '🫘', category: 'Oilseeds' },

  // Cotton
  { crop: 'Cotton (Long Staple)', state: 'Gujarat', market: 'Rajkot', price: 7200, prev: 7100, emoji: '🧶', category: 'Fiber' },
  { crop: 'Cotton (Long Staple)', state: 'Maharashtra', market: 'Akola', price: 6900, prev: 7000, emoji: '🧶', category: 'Fiber' },
  { crop: 'Cotton (Medium)', state: 'Punjab', market: 'Bhatinda', price: 6500, prev: 6450, emoji: '🧶', category: 'Fiber' },

  // Sugarcane
  { crop: 'Sugarcane', state: 'Uttar Pradesh', market: 'Meerut', price: 385, prev: 375, emoji: '🎋', category: 'Cash Crop' },
  { crop: 'Sugarcane', state: 'Maharashtra', market: 'Kolhapur', price: 340, prev: 340, emoji: '🎋', category: 'Cash Crop' },

  // Turmeric
  { crop: 'Turmeric', state: 'Telangana', market: 'Nizamabad', price: 9200, prev: 8800, emoji: '🟡', category: 'Spices' },
  { crop: 'Turmeric', state: 'Maharashtra', market: 'Sangli', price: 9500, prev: 9400, emoji: '🟡', category: 'Spices' },

  // Chili
  { crop: 'Red Chili', state: 'Andhra Pradesh', market: 'Guntur', price: 14500, prev: 15000, emoji: '🌶️', category: 'Spices' },
  { crop: 'Red Chili', state: 'Telangana', market: 'Khammam', price: 13800, prev: 14000, emoji: '🌶️', category: 'Spices' },
];

export async function GET() {
  // In a real scenario, you would fetch from:
  // https://api.data.gov.in/resource/9ef273d4-da97-4316-b0f3-aaf3103eec5d?api-key=YOUR_KEY&format=json
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    source: 'AgConnect Market Intelligence',
    records: REAL_MANDI_DATA
  });
}
