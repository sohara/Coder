import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EditorWrapper } from "./editor-wrapper";

// Mock the required props
const mockUser = { name: "Test User" };
const mockInitialCode = 'console.log("Hello, world!");';
const mockInitialLanguage = "javascript";
const mockSnippetId = "123";
const mockSaveCode = jest.fn().mockResolvedValue(undefined);
const mockSyncToLocalStorage = false;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
    pathname: "/",
    route: "/",
    query: {},
    asPath: "/",
    back: jest.fn(),
  }),
}));

describe("EditorWrapper", () => {
  it("renders the component with initial props", async () => {
    render(
      <EditorWrapper
        user={mockUser}
        initialCode={mockInitialCode}
        initialLanguage={mockInitialLanguage}
        snippetId={mockSnippetId}
        saveCode={mockSaveCode}
        syncToLocalStorage={mockSyncToLocalStorage}
      />,
    );

    // Wait for the initial code to be displayed within a <pre> tag
    await waitFor(() => {
      expect(screen.getByText(/console\.log\(\);/i)).toBeInTheDocument();
    });

    // Check that the initial language is set in the language selector
    expect(screen.getByRole("combobox")).toHaveTextContent("javascript");

    // // Check that the execute button is present
    expect(screen.getByTitle("Execute code (Shift+Enter)")).toBeInTheDocument();

    // Check that the save button is present and enabled
    expect(screen.getByTitle("Save")).toBeInTheDocument();
    expect(screen.getByTitle("Save")).not.toBeDisabled();
  });

  it("loads code and language from local storage if syncToLocalStorage is true", async () => {
    const localStorageCode = 'console.log("Hello from localStorage!");';
    const localStorageLanguage = "python";

    // Mock localStorage
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Set mock localStorage values
    localStorage.setItem(
      "latestCode",
      JSON.stringify({
        code: localStorageCode,
        language: localStorageLanguage,
      }),
    );

    render(
      <EditorWrapper
        user={mockUser}
        initialCode={mockInitialCode}
        initialLanguage={mockInitialLanguage}
        snippetId={mockSnippetId}
        saveCode={mockSaveCode}
        syncToLocalStorage={true}
      />,
    );

    // Wait for the code to be loaded from local storage
    await waitFor(() => {
      expect(
        screen.getByText(/"hello from localstorage!"/i),
      ).toBeInTheDocument();
    });

    // Check that the language is loaded from local storage
    expect(screen.getByRole("combobox")).toHaveTextContent("python");
  });
});
