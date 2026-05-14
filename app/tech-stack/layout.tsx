import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tech Stack — AgriConnect',
  description: 'The complete technology architecture powering AgriConnect: Next.js, Gemini AI, Google Maps GIS, Neon PostgreSQL, and more.',
};

export default function TechStackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
