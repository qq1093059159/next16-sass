import "server-only";
export default function ServerOnly(type: 0 | 1) {
  if (type === 0) {
    return fetch("https://api.github.com");
  } else {
    return new WebSocket("wss://api.github.com");
  }
}
