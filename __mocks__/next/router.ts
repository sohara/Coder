export const useRouter = () => ({
  push: jest.fn(),
  prefetch: jest.fn(),
  pathname: "/",
  route: "/",
  query: {},
  asPath: "/",
  back: jest.fn(),
});
