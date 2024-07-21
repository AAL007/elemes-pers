// 'use server'
// import { revalidatePath } from 'next/cache'
// import { redirect } from 'next/navigation'

// import { createClient } from '../../../utils/supabase/server'

// export async function validateSession(code: string){
//   const supabase = createClient()

//   const { error } = await supabase.auth.exchangeCodeForSession(code)

//   if (error) {
//     return {isError: true, message: error.message, statusCode: error.status}
//   }

// }

// export async function changePassword(password: string) {
//   const supabase = createClient()

//   // type-casting here for convenience
//   // in practice, you should validate your inputs

//   const { data, error } = await supabase.auth.updateUser({password: password})

//   if (error) {
//     return {isError: true, message: error.message, statusCode: error.status}
//   }

//   return {isError: false, message: 'Password successfully changed!', statusCode: 200}
  
// }