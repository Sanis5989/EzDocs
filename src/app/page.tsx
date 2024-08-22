"useClient";

import LoginForm from "./ui/LoginForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
  <div className="flex flex-col md:flex-row justify-around w-full">
    <div className="flex-1 ms-32 flex justify-center items-center ">
      <Image 
        src={"/landing.png"} 
        height={750} 
        width={750} 
        style={{objectFit:"cover"}} 
        alt="landing image of files" 
        className="max-w-full mt-5"
      />
    </div>
    <div className="flex-1 flex justify-center">
      <LoginForm />
    </div>
  </div>
</main>

  );
}
