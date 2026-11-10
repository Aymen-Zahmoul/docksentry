import React from "react";
import { CloudShader } from "./cloud-shader";

export const CloudBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Unconstrained WebGL Cloud Shader */}
      <CloudShader
        className="w-full h-full"
        speed={0.4}
        count={5}
        cloudColor="#F1F5F9"
        skyTopColor="#0F172A"
        skyBottomColor="#1E293B"
      />

      {/* Subtle Soft Wash for Content Readability */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
    </div>
  );
};

export default CloudBackground;
