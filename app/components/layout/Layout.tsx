import { Outlet } from "react-router";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );
} 