'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SpinWheelGame } from '@/components/games/SpinWheelGame';

export default function SpinWheelPage() {
  return (
    <div className="min-h-screen bg-festive-radiant flex flex-col text-[#FFFDF7]">
      <Navbar />
      <main className="flex-1 py-6">
        <SpinWheelGame />
      </main>
      <Footer />
    </div>
  );
}
