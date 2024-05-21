import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorWrapper } from "./editor-wrapper";
import { CodeEditor } from "./code-editor";
import { afterEach } from "node:test";
import { act } from "react";

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

jest.mock("./code-editor", () => ({
  supportedLanguages: jest.requireActual("./code-editor").supportedLanguages,
  CodeEditor: jest.fn(),
}));

const mockedCodeEditor = CodeEditor as jest.MockedFunction<typeof CodeEditor>;

const originCreateRange = global.document.createRange;

describe("EditorWrapper", () => {
  beforeEach(() => {
    // jest.resetModules();
    mockedCodeEditor.mockImplementation(
      jest.requireActual("./code-editor").CodeEditor,
    );
    global.document.createRange = () =>
      ({
        setStart: () => {},
        setEnd: () => {},
        commonAncestorContainer: {
          nodeName: "BODY",
          ownerDocument: document,
        } as Node,
        getClientRects: (): DOMRectList => {
          return [] as unknown as DOMRectList;
        },
      }) as any;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it("syncs code and language to local storage when syncToLocalStorage is true", async () => {
    // Temporarily mock CodeEditor for this specific test
    global.document.createRange = originCreateRange;
    mockedCodeEditor.mockImplementation(({ code, onChange }) => (
      <div>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          data-testid="mock-code-editor"
        />
      </div>
    ));
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

    await waitFor(() => {
      expect(screen.getByText(/console\.log/i)).toBeInTheDocument();
    });

    // Change the code using the mock CodeEditor
    fireEvent.change(screen.getByTestId("mock-code-editor"), {
      target: { value: 'console.log("Updated code!");' },
    });

    // Check if the local storage is updated after code change
    await waitFor(() => {
      const localStorageString = localStorage.getItem("latestCode");
      const localStorageVal = JSON.parse(localStorageString!) as {
        code: string;
      };
      expect(localStorageVal.code).toContain('console.log("Updated code!");');
    });

    // Find and click the select trigger to open the dropdown
    await userEvent.click(screen.getByRole("combobox"));

    await userEvent.click(screen.getAllByText("python")[1]);

    // Check if the local storage is updated after language change
    await waitFor(() => {
      const localStorageValue = localStorage.getItem("latestCode");
      expect(localStorageValue).toContain('"language":"python"');
    });

    // Final check for the full local storage value
    await waitFor(() => {
      expect(localStorage.getItem("latestCode")).toEqual(
        JSON.stringify({
          code: 'console.log("Updated code!");',
          language: "python",
        }),
      );
    });
  });

  it("handles execute code functionality correctly", async () => {
    // Mock fetch to simulate API call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ result: "Execution successful" }),
      }),
    ) as jest.Mock;

    render(
      <EditorWrapper
        user={mockUser}
        initialCode={mockInitialCode}
        initialLanguage={mockInitialLanguage}
        snippetId={mockSnippetId}
        saveCode={mockSaveCode}
        syncToLocalStorage={false}
      />,
    );

    // Click the execute button
    fireEvent.click(screen.getByTitle("Execute code (Shift+Enter)"));

    // Check if the output is updated correctly
    await waitFor(() => {
      expect(screen.getByText("Execution successful")).toBeInTheDocument();
    });

    // Restore fetch to its original implementation
    global.fetch.mockRestore();
  });

  it("handles save code functionality correctly", async () => {
    render(
      <EditorWrapper
        user={mockUser}
        initialCode={mockInitialCode}
        initialLanguage={mockInitialLanguage}
        snippetId={mockSnippetId}
        saveCode={mockSaveCode}
        syncToLocalStorage={false}
      />,
    );

    // Mock the saveCode function to simulate saving code
    mockSaveCode.mockResolvedValue({ id: "456" });

    // Click the save button
    fireEvent.click(screen.getByTitle("Save"));

    // Check if the saveCode function is called
    await waitFor(() => {
      expect(mockSaveCode).toHaveBeenCalledTimes(1);
    });

    // Check if the saveCode function was called with the correct arguments
    expect(mockSaveCode).toHaveBeenCalledWith({
      code: mockInitialCode,
      language: mockInitialLanguage,
      id: mockSnippetId,
    });

    // Check if the URL is updated to the new snippet ID
    expect(screen.getByTitle("Save").closest("button")).not.toBeDisabled();
  });

  it("handles resizing correctly", async () => {
    render(
      <EditorWrapper
        user={mockUser}
        initialCode={mockInitialCode}
        initialLanguage={mockInitialLanguage}
        snippetId={mockSnippetId}
        saveCode={mockSaveCode}
        syncToLocalStorage={false}
      />,
    );

    // Simulate mouse down on the resize handler
    fireEvent.mouseDown(screen.getByRole("separator"));

    // Simulate mouse move to resize
    fireEvent.mouseMove(window, { clientX: window.innerWidth / 4 });

    // Simulate mouse up to finish resizing
    fireEvent.mouseUp(window);

    // Verify the state updates correctly
    await waitFor(() => {
      const mainElement = screen.getByRole("main");
      const gridColumnStyle =
        mainElement.querySelector(".grid")!.style.gridTemplateColumns;
      expect(gridColumnStyle).toContain("25%"); // Adjust based on the expected new width
    });
  });

  it("displays a tooltip prompting to log in when save button is hovered and user is not logged in", async () => {
    const baseDom = render(
      <EditorWrapper
        user={undefined} // User is not logged in
        initialCode={mockInitialCode}
        initialLanguage={mockInitialLanguage}
        snippetId={mockSnippetId}
        saveCode={mockSaveCode}
        syncToLocalStorage={false}
      />,
    );

    // Hover over the save button
    await act(async () => {
      userEvent.hover(screen.getByRole("button", { name: /save/i }));
    });

    // Check for the tooltip
    act(async () => {
      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(within(tooltip).getByText("Log in to save")).toBeInTheDocument();
        screen.logTestingPlaygroundURL();
      });
    });
  });

  it("handles execute code error correctly", async () => {
    // Mock fetch to simulate an API call with an error response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: "Execution timed out" }),
      }),
    ) as jest.Mock;

    render(
      <EditorWrapper
        user={mockUser}
        initialCode={mockInitialCode}
        initialLanguage={mockInitialLanguage}
        snippetId={mockSnippetId}
        saveCode={mockSaveCode}
        syncToLocalStorage={false}
      />,
    );

    // Click the execute button
    fireEvent.click(screen.getByTitle("Execute code (Shift+Enter)"));

    // Check if the error message is displayed correctly
    await waitFor(() => {
      expect(screen.getByText("Execution timed out")).toBeInTheDocument();
    });

    // Restore fetch to its original implementation
    global.fetch.mockRestore();
  });
});
