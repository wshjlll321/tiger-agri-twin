declare module "dashscope" {
  export const Model: {
    call: (options: unknown) => Promise<{
      output?: { text?: string };
      requestId?: string;
    }>;
  };
}
