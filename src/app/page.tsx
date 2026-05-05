"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Smartphone, Globe } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF7A00] to-[#FF0069] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-pink-500/20">me</div>
            <span className="font-bold text-xl tracking-tight">LinkMe</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">Log in</Link>
            <Link href="/signup" className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors">Sign up free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#FF7A00]/20 to-[#FF0069]/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm text-sm text-white/80">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>The #1 link in bio for creators</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.1] drop-shadow-sm">
              Everything you are. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#FF0069]">In one simple link.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Join millions of creators, influencers, and brands who use LinkMe to monetize their audience and share their world.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto lg:mx-0">
              <div className="relative flex-1 w-full">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 font-semibold text-lg">link.me/</span>
                <input 
                  type="text" 
                  placeholder="yourname" 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-[88px] pr-4 text-white text-lg font-medium focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shrink-0">
                Claim <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Hero Mockup */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
             animate={{ opacity: 1, scale: 1, rotate: 0 }}
             transition={{ duration: 1, delay: 0.2, type: "spring" }}
             className="relative z-10 hidden lg:flex justify-center"
          >
             <div className="relative w-[340px] h-[680px] bg-black rounded-[3rem] border-[8px] border-white/10 shadow-2xl overflow-hidden shadow-[#FF0069]/20">
                {/* Simulated App View inside the phone */}
                <div className="absolute top-0 w-full h-[55%] z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black z-10" />
                  <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80" alt="Mockup" className="w-full h-full object-cover object-top" />
                </div>

                <div className="absolute top-[35%] w-full text-center z-20 px-4">
                   <h3 className="text-3xl font-bold text-white mb-1 drop-shadow-md">Janice Rivera</h3>
                   <p className="text-white/70 text-sm font-medium">@janicee.janicee</p>
                   
                   <div className="flex justify-center gap-3 mt-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFDC80] to-[#C13584] flex items-center justify-center shadow-lg" />
                      <div className="w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-lg" />
                      <div className="w-12 h-12 rounded-full bg-[#FFFC00] flex items-center justify-center shadow-lg" />
                   </div>
                   
                   <div className="mt-8 space-y-3">
                      <div className="h-[72px] w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/5" />
                      <div className="h-[180px] w-full rounded-3xl bg-white/10 backdrop-blur-md border border-white/5" />
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/50 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Built for the modern creator</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Everything you need to grow your audience and monetize your content, without writing a single line of code.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-6 text-pink-500 border border-pink-500/20">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Your Digital Hub</h3>
              <p className="text-white/60 leading-relaxed">Connect your TikTok, Instagram, YouTube, and storefronts in one beautiful, highly converting mobile page.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6 text-orange-500 border border-orange-500/20">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Lightning Fast</h3>
              <p className="text-white/60 leading-relaxed">Built on Next.js and edge networks. Your page loads instantly anywhere in the world, preventing drop-offs.</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 text-blue-500 border border-blue-500/20">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Mobile Optimized</h3>
              <p className="text-white/60 leading-relaxed">Pixel-perfect designs that look incredible on every device. Give your followers a premium experience.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
