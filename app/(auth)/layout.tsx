import Link from "next/link";

import { site } from "@/config/site";
import Image from "next/image";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-dvh items-center justify-center relative">
      <Link href="/" className="flex gap-2 top-10 absolute items-center">
        <Image src={site.logo} alt={site.title} className="w-8" />
        <span className="text-3xl font-semibold">{site.title}</span>
      </Link>

      <div className="w-full max-w-xs">{children}</div>
    </div>
  );
}
