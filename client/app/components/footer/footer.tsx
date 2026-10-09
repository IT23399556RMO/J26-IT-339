"use client";

export default function FooterView() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="flex flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p>© {year} TravelMate. All rights reserved.</p>
        <p>Made with ❤️ for travellers everywhere.</p>
      </div>
    </footer>
  );
};