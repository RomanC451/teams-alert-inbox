export function chatPath(conversationId: string): string {
  return `/chat/${encodeURIComponent(conversationId)}`;
}

export function parseChatRouteId(routeId: string): string {
  try {
    return decodeURIComponent(routeId);
  } catch {
    return routeId;
  }
}
