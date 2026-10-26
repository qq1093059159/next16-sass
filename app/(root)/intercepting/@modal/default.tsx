/**
 * slot 兜底：直接访问 /intercepting/photo/1（硬导航）时，
 * 拦截路由不生效，@modal slot 就渲染这个空组件。
 */
export default function ModalDefault() {
  return null;
}
