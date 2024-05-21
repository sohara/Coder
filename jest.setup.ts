import "@testing-library/jest-dom";

// Mock range api for codemirror issues
if (global.document) {
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
}
