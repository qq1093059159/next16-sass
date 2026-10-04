// 占位接口：AI 对话接线位尚未通电。
// 补全方案见 README 第五章（@ai-sdk/deepseek 流式对话）。
export async function GET() {
  return Response.json(
    { message: "Not implemented: /api/chat 待实现" },
    { status: 501 },
  );
}
