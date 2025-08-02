type JsonPrimitive = string | number | boolean | null;
export interface JsonArray extends Array<JsonValue> {};
export interface JsonObject extends Record<string, JsonValue> {};
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export interface SendSpecInfo {
  /** Only for ExtensionChatServer */
  portI?: number
};
