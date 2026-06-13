import { useRef } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({
  value,
  language = "java",
  onChange,
  readOnly = false,
  height = "100%",
}) {
  const editorRef = useRef(null);

  function handleMount(editor) {
    editorRef.current = editor;
  }

  function handleChange(newValue) {
    if (onChange) onChange(newValue);
  }

  return (
      <Editor
        height={height}
        language={language}
        value={value}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly: readOnly,
          lineNumbers: "on",
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
        }}
      />
  );
}
