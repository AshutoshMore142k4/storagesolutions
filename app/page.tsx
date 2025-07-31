'use client'

import NavBar from "@/components/ui/nav";
import FileStructureUI from "@/components/ui/file-structure";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-100 mb-2">Files</h1>
          <p className="text-gray-400 text-sm">Manage your S3 storage</p>
        </div>
        <FileStructureUI />
      </main>
    </div>
  );
}
