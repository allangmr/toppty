import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { ClaimIntro } from "@/experiments/leaderboard/components/claim-intro";
import { Faq } from "@/experiments/leaderboard/components/faq";
import { HomeClient } from "@/experiments/leaderboard/components/home-client";
import { copy } from "@/experiments/leaderboard/copy";
import { getCachedHomeSnapshot } from "@/experiments/leaderboard/queries/leaderboard";
import { homeJsonLd } from "@/experiments/leaderboard/seo";

export const revalidate = 30;

export default async function Home() {
  const snapshot = await getCachedHomeSnapshot();
  return (
    <>
      <JsonLd data={homeJsonLd(snapshot)} />
      <Header />
      <main
        id="contenido"
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-4 pb-16"
      >
        <HomeClient
          initial={snapshot}
          claim={copy.takeNumberOne}
          intro={<ClaimIntro />}
        />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
