/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import { z } from "zod"
const loginSchema = z.object({
  username: z.string().min(6, '用户名不能少于6位'), //zod基本用法表示这是一个字符串，并且不能少于6位
  password: z.string().min(6, '密码不能少于6位') //zod基本用法表示这是一个字符串，并且不能少于6位
})

export async function handleLogin(_prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData)) //调用zod的safeParse方法进行校验

  if (!result.success) {
    const errorMessage = z.treeifyError(result.error).properties; //调用zod的treeifyError方法将错误信息转换为对象
    let str = ''
    Object.entries(errorMessage!).forEach(([_key, value]) => {
      value.errors.forEach((error: any) => {
        str += error + '\n' //将错误信息拼接成字符串
      })
    })
    return { message: str } //返回错误信息
  }
  //校验成功，进行数据库操作逻辑
  return { message: '登录成功' } //返回成功信息
}
