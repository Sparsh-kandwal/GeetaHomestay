import React from 'react';

const OpacityLoader = () => {
  return (
    <div className="absolute min-h-screen loader-overlay">
      <div className="text-black lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default OpacityLoader;
