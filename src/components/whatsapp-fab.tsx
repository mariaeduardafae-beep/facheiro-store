import Link from "next/link";
import { MessageCircle } from "lucide-react";

const whatsappUrl = "https://wa.me/558182031185";

export function WhatsappFab() {
  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 hover:scale-105 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
    >
      <MessageCircle size={26} strokeWidth={2.2} />
    </Link>
  );
}