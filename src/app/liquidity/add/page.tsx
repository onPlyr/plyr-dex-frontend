import Image from "next/image";
// import { ConnectTWButton } from "@/components/thirdweb_connectbutton";

import AddLiqSection from "./addLiqSection";
import { Suspense } from "react";

import { Loader2 } from "lucide-react";
import { ThirdwebProvider } from "thirdweb/react";
import { loadTokenList } from "@/app/loadTokenList";

export default async function Main() {


  // Fetch Token List //
  const tokenList = await loadTokenList();

  return (
    <>
      {/* <Header bg={'bg-black'} /> */}
      <Suspense fallback={
        <div className="flex w-full px-6 flex-col items-center min-h-screen">
          <section className="w-full flex flex-row items-center justify-center py-8 ">
            <Image loading="eager" src="/logo/plyr_orange_black.svg" alt="Plyr | Dashboard" width={200} height={250} className="w-36 mr-4" /> <span className="text-black text-sm md:text-lg"> | DASHBOARD</span>
          </section>
          <div className="w-full flex flex-row items-center justify-center">
            <Loader2 className="w-16 h-16 animate-spin" />
          </div>
        </div>
      }>
        <ThirdwebProvider>
          <div className="flex w-full px-6 flex-col items-center justify-center min-h-screen">
            <AddLiqSection tokenList={tokenList} />
          </div>
        </ThirdwebProvider>
      </Suspense >
    </>
  );
}
