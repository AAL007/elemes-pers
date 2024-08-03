'use client'
import { useDispatch, useSelector } from 'react-redux'
import { createClient } from '../../../utils/supabase/client'
import { setUserData, userState } from '@/lib/user-slice'

interface userData {
  email: string;
  name: string;
  role: string;
  roleCategory: string;
}

export const useLogin = () => {
  const dispatch = useDispatch()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const login = async (formData: FormData) => {
    const supabase = createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const userData = await getUserData(data.email)
    console.log(userData)
    dispatch(setUserData(userData.user as userState))
  
    const { error } = await supabase.auth.signInWithPassword(data)
  
    if (error) {
      return {isError: true, message: error.message, statusCode: error.status}
    }
  
    window.location.href = '/'
    return {isError: false, message: '', statusCode: 200}
  }

  return { login}
}

async function getUserData(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from('MsStaff').select(`
    StaffName,
    StaffEmail,
    RoleId,
    MsRole:RoleId (
      RoleId,
      RoleName,
      RoleCategoryId,
      MsRoleCategory:RoleCategoryId (
        RoleCategoryId,
        RoleCategoryName
      )
    )
  `).eq('StaffEmail', email).single()

  if (error) {
    const {data, error} = await supabase.from('MsStudent').select(`
      StudentName, 
      StudentEmail,
      RoleId,
      MsRole:RoleId (
        RoleId,
        RoleName,
        RoleCategoryId,
        MsRoleCategory:RoleCategoryId (
          RoleCategoryId,
          RoleCategoryName
        )
      )
    `).eq('StudentEmail', email).single()

    if (error) {
      return {isError: true, message: error.message, statusCode: 400}
    }

    let user: userData = {
      email: data.StudentEmail,
      name: data.StudentName,
      role: data.MsRole.RoleName,
      roleCategory: data.MsRole.MsRoleCategory.RoleCategoryName
    }

    return {isError: false, message: '', statusCode: 200, user}
  }

  let user: userData = {
    email: data.StaffEmail,
    name: data.StaffName,
    role: data.MsRole[0].RoleName,
    roleCategory: data.MsRole[0].MsRoleCategory[0].RoleCategoryName
  }

  return {isError: false, message: '', statusCode: 200, user}

}