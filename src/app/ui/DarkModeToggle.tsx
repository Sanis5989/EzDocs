"use client";

import { useTheme } from "next-themes";
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
    <div className="flex justify-end">
  <button
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    className="p-6 pt-10"
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
