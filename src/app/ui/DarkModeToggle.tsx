"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdSunny } from "react-icons/md";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex justify-between items-center">{theme === "dark" ? (
      <Image alt="logo" src={"/image.png"} width={150} className="mx-8 my-2"
      height={130}/>
    ) : (
      <Image alt="logo" src={"/image-black.png"} width={150} className="mx-8 my-2"
      height={130}/>
    )}
  <button
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="m-6 "
  >
    
    {theme === "dark" ? (
      <MdSunny size={28} />
    ) : (
      <MdSunny color="black" size={28} />
    )}

    
  </button>
</div>

    
  );
}
