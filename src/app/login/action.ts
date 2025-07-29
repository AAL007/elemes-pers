'use client'
import { useDispatch, useSelector } from 'react-redux'
import { createClient } from '../../../utils/supabase/client'
import { setUserData, userState } from '@/lib/user-slice'

interface userData {
  id: string;
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
  
    const { error } = await supabase.auth.signInWithPassword(data)
  
    if (error) {
      return {isError: true, message: error.message, statusCode: error.status}
    }

    const userData = await getUserData(data.email)
    dispatch(setUserData(userData.user as userState))
  
    window.location.href = '/'
    return {isError: false, message: '', statusCode: 200}
  }

  return { login}
}

export async function getUserData(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from('MsStaff').select(`
    StaffId,
    StaffName,
    StaffEmail,
    RoleId,
    ProfilePictureUrl
  `).eq('StaffEmail', email).single()

  if (error) {
    const {data, error} = await supabase.from('MsStudent').select(`
      StudentId,
      StudentName, 
      StudentEmail,
      RoleId,
      ProfilePictureUrl
    `).eq('StudentEmail', email).single()

    if (error) {
      return {isError: true, message: error.message, statusCode: 400}
    }

    localStorage.setItem('profilePicture', data?.ProfilePictureUrl as string)
    const roleAndRoleCategory = await getUserRole(data.RoleId)
    if(roleAndRoleCategory.isError){
      return {isError: roleAndRoleCategory.isError, message: roleAndRoleCategory.message, statusCode: roleAndRoleCategory.statusCode}
    }

    let user: userData = {
      id: data.StudentId,
      email: data.StudentEmail,
      name: data.StudentName,
      role: roleAndRoleCategory.object?.roleName,
      roleCategory: roleAndRoleCategory.object?.roleCategoryName
    }

    console.log(user)

    return {isError: false, message: '', statusCode: 200, user}
  }

  localStorage.setItem('profilePicture', data?.ProfilePictureUrl as string)

  const roleAndRoleCategory = await getUserRole(data.RoleId)
    if(roleAndRoleCategory.isError){
      return {isError: roleAndRoleCategory.isError, message: roleAndRoleCategory.message, statusCode: roleAndRoleCategory.statusCode}
    }

  let user: userData = {
    id: data.StaffId,
    email: data.StaffEmail,
    name: data.StaffName,
    role: roleAndRoleCategory.object?.roleName,
    roleCategory: roleAndRoleCategory.object?.roleCategoryName
  }

  return {isError: false, message: '', statusCode: 200, user}

}

async function getUserRole(roleId: string){
  const supabase = createClient()

  const { data, error } = await supabase.from('MsRole').select(`RoleName, RoleCategoryId`).eq('RoleId', roleId).single()

  if (error) {
    return {isError: true, message: error.message, statusCode: 400}
  }

  const roleCategoryName = await getUserRoleCategory(data.RoleCategoryId)

  if(roleCategoryName.isError){
    return {isError: roleCategoryName.isError, message: roleCategoryName.message, statusCode: roleCategoryName.statusCode}
  }

  let object = {
    roleName: data.RoleName,
    roleCategoryName: roleCategoryName.data?.RoleCategoryName
  }

  return {isError: false, message: '', statusCode: 200, object}
}

async function getUserRoleCategory(roleCategoryId: string){
  const supabase = createClient()

  const { data, error } = await supabase.from('MsRoleCategory').select('RoleCategoryName').eq('RoleCategoryId', roleCategoryId).single()

  if (error) {
    return {isError: true, message: error.message, statusCode: 400}
  }

  return {isError: false, message: '', statusCode: 200, data}
}