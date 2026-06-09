import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" aria-label="Facheiro">
      <Image
        src="/logo-facheiro.png"
        alt="Facheiro"
        width={180}
        height={60}
        priority
      />
    </Link>
  );
}

