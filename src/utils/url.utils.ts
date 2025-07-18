export const baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL!;

export const isDevUrl = (): boolean => {
  return baseUrl !== "https://oas.edmartsystems.com";
};
