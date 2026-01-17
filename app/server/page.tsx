/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs"; //引入fs模块
import mysql, { RowDataPacket } from "mysql2/promise"; //操作数据库 仅供演示 非最佳实践
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "next16-basic",
});

export default async function ServerPage() {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM goods");
  const data = fs.readFileSync("data.json", "utf-8");
  const json = JSON.parse(data);

  return (
    <div>
      <h1>Server Page</h1>
      {json.age}
      {json.name}
      {json.city}
      <h3>mysql</h3>
      {rows.map((item: any) => (
        <div key={item.id}>
          {item.name}-{item.goodsPrice}
        </div>
      ))}
    </div>
  );
}
