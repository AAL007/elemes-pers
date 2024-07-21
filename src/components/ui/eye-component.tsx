import React from 'react';
import './component.css'; // Make sure to import the CSS file

interface EyeComponentProps {
  isOpen: boolean;
  toggleVisibility: () => void;
}

const EyeComponent: React.FC<EyeComponentProps> = ({ isOpen, toggleVisibility }) => {
  return (
    <div className={`eye`} {...(!isOpen ? {} : {'data-closed': true})} onClick={toggleVisibility}>
      <div className="eye__base">
        <div className="eye__base__view">
          <div className="eye__base__view__iris"></div>
          <div className="eye__base__view__pupil"></div>
        </div>
      </div>
      <div className="eye__lid">
        <div className="eye__lid__mask"></div>
        <div className="eye__lid__lashes">
          <div className="eye__lid__lashes__line"></div>
          <div className="eye__lid__lashes__hair"></div>
        </div>
      </div>
    </div>
  );
};

export default EyeComponent;