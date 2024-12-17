declare module '*.json' {
  const value: Record<string, string | number | boolean | null | Record<string, unknown>>;
  export default value;
} 