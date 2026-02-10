import { Suspense } from "react";
import ProjectReelClient from "./ProjectReelClient";

export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default async function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-700"></div>
        </div>
      }
    >
      <ProjectReelClient />
    </Suspense>
  );
}
