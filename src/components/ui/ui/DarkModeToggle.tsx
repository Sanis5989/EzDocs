"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdSunny } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex justify-between items-center mb-5">
      <Image
      onClick={()=>{router.push("/")}}
      alt="logo"
      src={theme === "dark" ? "/image.png" : "/image-black.png"}
      width={120}
      height={150}
      className="mx-2 my-1 w-auto h-auto max-w-[85px] md:max-w-[170px] md:mx-4 md:my-2 cursor-pointer"
      />  
      <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex mx-6 mb-6 pb-2 items-center mr-8 hover:cursor-pointer">
        {theme === "dark" ? (
          <MdSunny size={28} />
        ) : (
          <MdSunny color="black" size={28} />
        )}
      </div>
  </div>
  );
}
