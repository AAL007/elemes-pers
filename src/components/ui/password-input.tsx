// Input component extends from shadcnui - https://ui.shadcn.com/docs/components/input
"use client";
import { useState } from "react";
import * as React from "react";
import { cn } from "../../../utils/aceternity/cn";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import {PiEye, PiEyeClosed } from "react-icons/pi";
import "@/components/ui/component.css"
import EyeComponent from "./eye-component";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type, ...props }, ref) => {
    const radius = 100; // change this to increase the rdaius of the hover effect
    const [visible, setVisible] = React.useState(false);
    const[isShowPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword(!isShowPassword)
    }

    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      let { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }
    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
          var(--blue-500),
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="relative p-[2px] rounded-lg transition duration-300 group/input"
      >
        <input
          type={isShowPassword ? 'text' : 'password'}
          className={cn(
            `flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm  file:border-0 file:bg-transparent 
          file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder-text-neutral-600 
          focus-visible:outline-none focus-visible:ring-[2px]  focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
           disabled:cursor-not-allowed disabled:opacity-50
           dark:shadow-[0px_0px_1px_1px_var(--neutral-700)]
           group-hover/input:shadow-none transition duration-400
           `,
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          // onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 px-3 flex items-center"
        >
          {/* {isShowPassword ? 
          <FaEyeSlash className={`icon-transition ${isShowPassword ? 'rotate-icon' : ''}`} /> 
          :<FaEye className={`icon-transition ${!isShowPassword ? 'rotate-icon' : ''}`} />} */}
          <EyeComponent isOpen={isShowPassword} toggleVisibility={togglePasswordVisibility}/>
          {/* {isShowPassword ? <PiEye className="icon-transition" /> : <PiEyeClosed className="icon-transition" />} */}
        </button>
      </motion.div>
    );
  }
);
PasswordInput.displayName = "Input";

export { PasswordInput };
