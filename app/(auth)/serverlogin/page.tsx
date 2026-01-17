export default function Login() {
  //接受id参数
  async function handleLogin(id: number, formData: FormData) {
    "use server";
    const username = formData.get("username");
    const password = formData.get("password");
    const form = Object.fromEntries(formData);
    console.log(username, password, form, id);
  }
  const userFunction = handleLogin.bind(null, 1); //绑定id参数
  return (
    <div>
      <h1>登录页面</h1>
      <div className="flex flex-col gap-2 w-75 mx-auto mt-30">
        <form action={userFunction} className="flex flex-col gap-2">
          <input
            className="border border-gray-300 rounded-md p-2"
            type="text"
            name="username"
            placeholder="用户名"
          />
          <input
            className="border border-gray-300 rounded-md p-2"
            type="password"
            name="password"
            placeholder="密码"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
