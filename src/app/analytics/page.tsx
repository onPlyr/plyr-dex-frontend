import { Suspense } from 'react'
import UniswapInfo from './components/UniswapInfo'
import GlobalCharts from './components/GlobalCharts'
import LatestTransactions from './components/LatestTransactions'
import { fetchGlobalChartData } from './components/UniswapInfoFetcher'
//import { ThirdwebProvider } from "thirdweb/react";
import { loadTokenList } from "@/app/loadTokenList";
import { Loader2 } from 'lucide-react'

export default async function Main() {

  // Fetch Token List -- showWPLYR //
  const tokenList = await loadTokenList(true);

  console.log(tokenList)

  // Chart Data //
  const chartData = await fetchGlobalChartData()

  return (
    <>
      <div className="flex w-full px-6 flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12">
        <main className="container mx-auto px-0 py-8">
          <div className="mb-8">
            <Suspense fallback={<Loader2 className="w-24 h-24 animate-spin text-[#daff00]" />}>
              <GlobalCharts data={chartData} />
            </Suspense>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <UniswapInfo tokenList={tokenList} />
            </div>
            <div>
              <Suspense fallback={<Loader2 className="w-24 h-24 animate-spin text-[#daff00]" />}>
                <LatestTransactions pairAddress={undefined} tokenList={tokenList} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
