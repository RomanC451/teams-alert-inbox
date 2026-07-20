const DEFAULT_ENTITY = "switch.bme680_senzor_mouse_jiggler";

function getHaConfig() {
  const baseUrl = process.env.HA_URL?.replace(/\/$/, "");
  const token = process.env.HA_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("HA_URL and HA_TOKEN must be set");
  }
  return { baseUrl, token };
}

export function getMouseJigglerEntityId(): string {
  return process.env.HA_MOUSE_JIGGLER_ENTITY ?? DEFAULT_ENTITY;
}

export async function getHaEntityState(entityId: string): Promise<{
  state: string;
  friendlyName: string;
}> {
  const { baseUrl, token } = getHaConfig();
  const res = await fetch(`${baseUrl}/api/states/${entityId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Home Assistant state failed (${res.status})`);
  }

  const data = (await res.json()) as {
    state: string;
    attributes?: { friendly_name?: string };
  };

  return {
    state: data.state,
    friendlyName: data.attributes?.friendly_name ?? entityId,
  };
}

export async function setHaSwitch(
  entityId: string,
  on: boolean
): Promise<{ state: string }> {
  const { baseUrl, token } = getHaConfig();
  const expected = on ? "on" : "off";
  const service = on ? "turn_on" : "turn_off";
  const res = await fetch(`${baseUrl}/api/services/switch/${service}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entity_id: entityId }),
  });

  if (!res.ok) {
    throw new Error(`Home Assistant switch failed (${res.status})`);
  }

  // ESPHome/local switches often lag behind the service call.
  for (let attempt = 0; attempt < 8; attempt++) {
    await sleep(150 + attempt * 100);
    const current = await getHaEntityState(entityId);
    if (current.state === expected) {
      return { state: current.state };
    }
  }

  // Service succeeded; keep the intended state even if HA is still catching up.
  return { state: expected };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
