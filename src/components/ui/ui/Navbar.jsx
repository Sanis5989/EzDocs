"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdSunny,MdDarkMode } from "react-icons/md";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [toggleDropdown, setToggleDropdown] = useState(false);

  const { data: session } = useSession();

  const [providers, setProviders] = useState(null);


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
      
     
     {session?.user ? (
      <div className="m-6 cursor-pointer" onClick={()=>setToggleDropdown(!toggleDropdown)}>
        <IoPersonCircleOutline size={50}/>
        {toggleDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-2">
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setToggleDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {theme === 'dark' ? (
                <>
                  <MdSunny className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <MdDarkMode className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => {    
                setToggleDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <IoIosLogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      </div>): (
        <>
        {providers &&
          Object.values(providers).map((provider) => (
            <button
              type='button'
              key={provider.name}
              onClick={() => {
                signIn(provider.id);
              }}
              className='black_btn'
            >
              Sign in
            </button>
          ))}  <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex mx-6 mb-6 pb-2 items-center mr-8 hover:cursor-pointer">
        {theme === "dark" ? (
          <MdSunny size={28} />
        ) : (
          <MdSunny color="black" size={28} />
        )}
      </div>
        </>
      ) }
      

  </div>
  );
}
