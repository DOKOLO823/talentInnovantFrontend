import { Suspense } from "react";
import { FakeProject } from "@/app/datas/ProjectList";
import ProjectReelClient from "./ProjectReelClient";

export async function generateStaticParams() {
  return FakeProject.map((project) => ({
    id: project.id.toString(),
  }));
}

export default function Page({ params }: { params: { id: string } }) {
  const initialIndex = FakeProject.findIndex(p => p.id.toString() === params.id);
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-700"></div>
      </div>
    }>
      <ProjectReelClient 
        projects={FakeProject} 
        index={initialIndex !== -1 ? initialIndex : 0} 
      />
    </Suspense>
  );
}