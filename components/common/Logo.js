import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/">
      <Image
      className="p-2 bg-background2 rounded-md"
        src="/logo/logo-text.png"
        alt="logo"
        width={120}
        height={60}
      />
    </Link>
  );
};

export default Logo;
