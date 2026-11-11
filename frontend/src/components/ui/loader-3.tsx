import { cn } from "@/lib/utils";
import React, { useState } from "react";

export const Component: React.FC<{ className?: string }> = ({ className }) => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("loader", className)}>
      <div className="box box0">
        <div></div>
      </div>
      <div className="box box1">
        <div></div>
      </div>
      <div className="box box2">
        <div></div>
      </div>
      <div className="box box3">
        <div></div>
      </div>
      <div className="box box4">
        <div></div>
      </div>
      <div className="box box5">
        <div></div>
      </div>
      <div className="box box6">
        <div></div>
      </div>
      <div className="box box7">
        <div></div>
      </div>
      <div className="ground">
        <div></div>
      </div>
    </div>
  );
};

export default Component;
