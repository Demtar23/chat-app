import LottieImport from 'lottie-react';
import cat404 from '../assets/cat404.json';
import { Link } from 'react-router-dom';

const Lottie =
  (LottieImport as { default?: typeof LottieImport }).default ?? LottieImport;

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1e1f22] text-white px-4">

      <div className="w-[280px] sm:w-[360px] drop-shadow-2xl">
        <Lottie animationData={cat404} loop />
      </div>

      <div className="text-center mt-2">
        <h1 className="text-7xl font-black text-[#5865f2] tracking-tight">
          404
        </h1>
        <h2 className="text-xl font-semibold mt-2 text-white">
          Сторінку не знайдено
        </h2>
        <p className="text-gray-400 mt-2 text-sm max-w-xs mx-auto leading-relaxed">
          Схоже, ця сторінка зникла в невідомому напрямку. Але чат все ще тут!
        </p>
      </div>

      <Link
        to="/chat"
        className="mt-8 px-6 py-3 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] active:scale-95 transition-all duration-150 text-sm font-medium shadow-lg shadow-[#5865f2]/20"
      >
        ← Повернутись до чату
      </Link>

      <p className="text-gray-600 text-xs mt-6">
        Якщо вважаєш що це помилка — напиши адміністратору
      </p>
    </div>
  );
}