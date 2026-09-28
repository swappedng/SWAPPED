"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, RefreshCw, Shield } from 'lucide-react';
import { loadPhoneModels } from '../lib/phone-models';
// import Spline from '@splinetool/react-spline';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    loadPhoneModels().catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-white">
  
      <section className="relative overflow-hidden h-screen">
        {/* Logo at top left */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
         <img src="/swapped-logo.png" width={32} height={32} alt="" />
          <span className="text-2xl font-black text-black tracking-tight">Swapped</span>
        </div>
        {/* Content and device imagery */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="hero-layout">
            {/* Left Content */}
            <div className="hero-copy">
              <div className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                <h1 className="text-5xl lg:text-5xl xl:text-6xl font-bold text-black mb-8">
                  Upgrade your iPhone
                  <br />
                  <span className="font-light italic">without the hassle</span>
                </h1>
                
                <p className="text-md lg:text-xl text-black/80 mb-12 max-w-xl font-medium">
               We handle everything from valuation to device swap, making your upgrade simple and transparent.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link 
                    href="/tradein" 
                    className="
                      relative flex items-center justify-center px-10 py-3 
                      bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                      rounded-full font-semibold text-white text-lg tracking-wide
                      hover:scale-105 transition-all duration-300
                      shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818,inset_0px_-3px_1px_rgba(0,0,0,0.5),inset_2.5px_-2px_3px_rgba(124,108,94,0.75),inset_0px_-3px_3px_1px_rgba(255,245,221,0.1)]
                    "
                  >
                    Start Your Upgrade
                  </Link>
                </div>

             
              </div>
            </div>

            {/* Right visual */}
            <div className="hero-phones" aria-hidden="true">
              <img src="/standing-iphone.png" alt="" className="hero-phone hero-phone-standing" />
              <img src="/lying-iphone.png" alt="" className="hero-phone hero-phone-lying" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-32 px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-50/30 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-6 tracking-tight">
              How it 
              <span className="font-light italic">works</span>
            </h2>
            <p className="text-xl text-black/70 max-w-2xl mx-auto font-medium">
              Three simple steps to upgrade your iPhone
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="
                relative inline-flex items-center justify-center w-20 h-20 mb-8
                bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                rounded-full
                shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818]
                group-hover:scale-110 transition-all duration-300
              ">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">Get Quote</h3>
              <p className="text-black/70 text-lg leading-relaxed font-medium">
                Answer quick questions about your iPhone's condition for an instant, accurate valuation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="
                relative inline-flex items-center justify-center w-20 h-20 mb-8
                bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                rounded-full
                shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818]
                group-hover:scale-110 transition-all duration-300
              ">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">Choose Model</h3>
              <p className="text-black/70 text-lg leading-relaxed font-medium">
                Select your dream iPhone from our inventory of brand new and certified devices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="
                relative inline-flex items-center justify-center w-20 h-20 mb-8
                bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                rounded-full
                shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818]
                group-hover:scale-110 transition-all duration-300
              ">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">Complete Swap</h3>
              <p className="text-black/70 text-lg leading-relaxed font-medium">
                Meet for device inspection and walk away with your upgraded iPhone in hand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-32 px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
            Ready to 
            <span className="font-light italic">upgrade?</span>
          </h2>
          <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands who've upgraded their iPhones with Swapped.
            <span className="block mt-2 text-lg text-white/60 font-normal">Get started in under 5 minutes.</span>
          </p>
          <Link 
            href="/tradein" 
            className="
              inline-flex items-center justify-center px-12 py-4 
              bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
              rounded-full font-bold text-white text-xl tracking-wide
              hover:scale-105 transition-all duration-300
              shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818]
            "
          >
            Start Your Upgrade
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-24 px-6 lg:px-8 relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/50 to-black opacity-60"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-16 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src="/swapped-logo.png" width={32} height={32} alt="" />
                <span className="text-2xl font-black tracking-tight">Swapped</span>
              </div>
              <p className="text-white/70 text-lg leading-relaxed font-medium max-w-xs">
                The easiest way to upgrade your iPhone. Fair prices, expert service.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg tracking-tight">Shop</h4>
              <ul className="space-y-4 text-white/70 font-medium">
                <li><Link href="#" className="hover:text-white transition-colors text-lg">Trade In</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-lg">Browse Phones</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-lg">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg tracking-tight">Support</h4>
              <ul className="space-y-4 text-white/70 font-medium">
                <li><Link href="#" className="hover:text-white transition-colors text-lg">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-lg">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-lg">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg tracking-tight">Company</h4>
              <ul className="space-y-4 text-white/70 font-medium">
                <li><Link href="#" className="hover:text-white transition-colors text-lg">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-lg">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-lg">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-12 flex flex-col md:flex-row justify-between items-center text-white/60 font-medium">
            <p className="text-lg">&copy; 2026 SWAPPED. All rights reserved.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors text-lg">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors text-lg">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
