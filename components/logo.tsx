import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" aria-label="Facheiro">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-facheiro-tres.png"
            alt="Facheiro icon"
            width={50}
            height={50}
            priority
          />
          <Image
            src="/logo-facheiro-quatro.png"
            alt="Facheiro logotype"
            width={130}
            height={60}
            priority
          />
        </div>
    </Link>
  );
}
