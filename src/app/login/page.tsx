'use client'
import { login } from './action'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '../../../utils/aceternity/cn'
import { FlipWords } from '@/components/ui/flip-words'
import { PasswordInput } from '@/components/ui/password-input'
import Link from 'next/link'

export default function LoginPage() {
  const[email, setEmail] = useState('')
  const[password, setPassword] = useState('')
  const[isLoading, setLoadingStatus] = useState(false)
  const[isError, setErrorStatus] = useState(false)
  const[errorMessage, setErrorMessage] = useState('')

  const words = ["learn", "grow", "excel"]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingStatus(true)
    let formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    try{
      const res = await login(formData)
      .then((res: any) => {
        console.log(res)
        if(res.statusCode != 200 && res.isError == true){
          setErrorMessage(res.message)
          setErrorStatus(true)
        }else{
          setErrorMessage('')
          setErrorStatus(false)
          const url = new URL(window.location.href)
          url.pathname = '/'
          window.location.href = url.href
        }
      })
    }catch(e){
      console.log(e)
      // if(e instanceof Error){
      //   setErrorStatus(true)
      //   setErrorMessage(e.message)
      // }
    }
    setLoadingStatus(false)
  };


  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-stretch justify-center px-4"
      >
        <div className="h-[20rem] flex justify-between items-center px-4">
          <div className="text-4xl mr-20 mx-auto font-normal text-neutral-600 dark:text-neutral-400 leading-normal">
            Let's
            <FlipWords words={words} />
            with Elemes University
          </div>
      
          <div className='ml-10 mr-10'></div>
          <div className="max-w-md w-full mx-auto rounded md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
            <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
              Welcome to Elemes Academy
            </h2>
            <form className="my-8" onSubmit={handleSubmit}>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" placeholder="john.doe@email.com" type="email" required onChange={(e: any) => setEmail(e.target.value)}/>
                {isError ? <span style={{ fontSize: '11px', color: 'red' }}>{errorMessage}</span> : null}
              </LabelInputContainer>

              <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" name="password" placeholder="eleme5ddmmyyyy" required onChange={(e: any) => setPassword(e.target.value)}/>
                {isError ? <span style={{ fontSize: '11px', color: 'red' }}>{errorMessage}</span> : null}
              </LabelInputContainer>
      
              <button
                className="mb-5 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  "Log In →"
                )}
                
                <BottomGradient />
              </button>
              <span style={{ fontSize: '13px', textAlign: 'center' }}>Forgot Your Password? <Link href='/forgot-password' style={{ fontSize: '13px', color: 'blue' }}>Click Here!</Link></span>
      
            </form>
          </div>
        </div>
      </motion.div>
    </AuroraBackground>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};
 
const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};