"useClient";

import LoginForm from "./ui/LoginForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <div className="flex flex-col md:flex-row md:overflow-hidden">
        <div className="flex justify-center items-center">
          <Image src={"/landing_img.png"} height={600} width={600} alt="landing image of files"/>
        </div>
        
      <div className="flex">
        <LoginForm/>
      </div>
      </div>
      
    </main>
  );
}
