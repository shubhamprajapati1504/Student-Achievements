import Navbar from "@/components/Navbar";
import React from "react";

export default function OverallLayout({children}:{children:React.ReactNode}) {
  return (
    <div className="bg-white">
      <Navbar/>
      {children}
    </div>
  )
}