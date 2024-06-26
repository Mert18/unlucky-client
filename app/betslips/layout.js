import Navbar from '@/components/common/Navbar';
import React from 'react'

const BetSlips = ({ children }) => {
    return (
      <div>
        <Navbar />
        <div className="p-3 w-screen">{children}</div>
      </div>
    );
  };
  
  export default BetSlips;
  