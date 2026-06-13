import { useState } from "react";
import { runCode } from "../api/executionAPI.jsx";

export const useCodeExecution = () => {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(language, code, input = "") {
    setLoading(true);
    setError(null);
    try {
      const result = await runCode(language, code, input);
      if (!result) {
        setError("Internal API error occured while calling the execution's API");
        return;
      }
      setOutput(result);
      return result;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, output, handleSubmit };
};
