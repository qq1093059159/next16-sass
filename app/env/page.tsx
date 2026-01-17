//服务器组件 不要增加`use client`
export default function Env() {
  return (
    <div>
      <h1>Home</h1>
      <p>DB_HOST: {process.env.DB_HOST}</p>
      <p>DB_USER: {process.env.DB_USER}</p>
      <p>DB_PASSWORD: {process.env.DB_PASSWORD}</p>
    </div>
  );
}
