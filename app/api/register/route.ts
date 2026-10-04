// 占位接口：注册接口接线位尚未通电。
export async function GET() {
  return Response.json(
    { message: "Not implemented: /api/register 待实现" },
    { status: 501 },
  );
}
