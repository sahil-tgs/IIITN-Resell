import React from 'react';
import FeatureItemPreview from '../components/FeatureItemPreview';

const LandingPage = ({ isDarkMode }) => {
  const featuredItems = [
    { 
      title: "Green Soul Gaming Chair", 
      description: "Green Soul Monster Ultimate Series S Multi-Functional Ergonomic Gaming...", 
      price: 9000, 
      image: "/images/gaming-chair.jpg",
      width: "200px",
      height: "240px",
      top: "10%",
      right: "18%",
      zIndex: 10
    },
    { 
      title: "Big table", 
      description: "Sturdy table, perfect for studying", 
      price: 500, 
      image: "/images/table.jpg",
      width: "160px",
      height: "200px",
      top: "15%",
      left: "5%",
      zIndex: 11
    },
    { 
      title: "Extension Cord", 
      description: "2-socket extension cord, reliable", 
      price: 200, 
      image: "/images/extension-cord.jpg",
      width: "140px",
      height: "180px",
      top: "30%",
      left: "8%",
      zIndex: 12
    },
    { 
      title: "Analog Watch", 
      description: "Classic design, works perfectly", 
      price: 700, 
      image: "/images/watch.jpg",
      width: "120px",
      height: "160px",
      top: "50%",
      left: "3%",
      zIndex: 13
    },
    { 
      title: "Lamp", 
      description: "Adjustable brightness, compact design", 
      price: 300, 
      image: "/images/lamp.jpg",
      width: "180px",
      height: "220px",
      top: "40%",
      right: "18%",
      zIndex: 14
    },
    { 
      title: "Advanced Engineering Mathematics", 
      description: "Exam preparation, barely used", 
      price: 0, 
      image: "/images/book.jpg",
      width: "160px",
      height: "200px",
      bottom: "10%",
      right: "15%",
      zIndex: 15
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-cream text-gray-900'} flex justify-center items-center p-4 relative overflow-hidden transition-colors duration-300`}>
      {/* Left L-shaped decoration SVG */}
      <svg className="absolute left-0 top-0 h-full" width="264" viewBox="0 0 264 467" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxHeight: '100vh' }}>
        <g filter="url(#filter0_d_1039_4)">
          <rect width="117.318" height="305.026" transform="matrix(-1 0 0 1 140.412 39.3582)" fill="#2563EB"/>
          <rect width="117.318" height="254.045" transform="matrix(-0.00855998 -0.999963 -0.999963 0.00855998 260 423.853)" fill="#2563EB"/>
        </g>
        <defs>
          <filter id="filter0_d_1039_4" x="0" y="0" width="264" height="475" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1039_4"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1039_4" result="shape"/>
          </filter>
        </defs>
      </svg>

      {/* Right decoration SVG */}
      <svg className="absolute right-0 top-0 h-full" width="273" viewBox="0 0 273 524" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxHeight: '100vh' }}>
        <g filter="url(#filter0_d_1039_35)">
          <rect width="114" height="217" transform="matrix(-1 0 0 1 241 186)" fill="#2563EB"/>
          <rect width="205" height="216" transform="matrix(-1 0 0 1 241 49)" fill="#2563EB"/>
        </g>
        <defs>
          <filter id="filter0_d_1039_35" x="-4" y="0" width="281" height="532" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1039_35"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1039_35" result="shape"/>
          </filter>
        </defs>
      </svg>
      
      {/* Featured Item Previews */}
      {featuredItems.map((item, index) => (
        <FeatureItemPreview key={index} {...item} />
      ))}
      
      {/* Main content */}
      <div className="max-w-4xl w-full z-20 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-[78px] font-extrabold leading-tight mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
          Looking to<br />clear space ?
        </h1>
        <p className="text-base md:text-lg lg:text-[18px] mx-auto max-w-2xl mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
          IITN Resell is the marketplace for IIIT Nagpur students and faculty to buy and sell second-hand items.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
          <button className={`px-6 py-3 ${isDarkMode ? 'bg-blue-400 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full text-lg font-semibold transition duration-300 w-full sm:w-auto`}>
            Browse Marketplace
          </button>
          <button className={`px-6 py-3 bg-transparent ${isDarkMode ? 'text-blue-400 border-blue-400 hover:bg-blue-900' : 'text-blue-600 border-blue-600 hover:bg-blue-50'} border rounded-full text-lg font-semibold transition duration-300 w-full sm:w-auto`}>
            Sell an Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;