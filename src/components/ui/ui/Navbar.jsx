"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdSunny,MdDarkMode } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { Button } from "../button";

export default function Navbar() {

  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const pathname =  usePathname();

  const [toggleDropdown, setToggleDropdown] = useState(false);

  const { data: session } = useSession();

  
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
        <div className=" absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ">
          <div className="p-2 flex justify-center flex-col gap-2">
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setToggleDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md"
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
                signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md"
            >
              <IoIosLogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      </div>): (
        <>
        {/* { pathname !== "/login" &&

        <div className="flex flex-row items-center justify-end">
              <Button
              onClick={()=>{router.push("/login")
              }}
                type="submit"
                className="flex text-lg rounded-full mx-6 mb-6 pb-2 items-center mr-8 hover:cursor-pointer"
                size="default"
              >
               Log In
              </Button>
              
        </div>
        } */}
            <div
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
