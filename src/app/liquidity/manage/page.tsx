import ManageLiqSection from "./manageLiqSection";
//import { ThirdwebProvider } from "thirdweb/react";
import { loadTokenList } from "@/app/loadTokenList";

export default async function Main() {

  // Fetch Token List //
  const tokenList = await loadTokenList();

  return (
    <>
      <div className="flex w-full px-6 flex-col items-center justify-center pt-16 pb-24 lg:pb-12">
        <ManageLiqSection tokenList={tokenList} />
      </div>
    </>
  );
}
