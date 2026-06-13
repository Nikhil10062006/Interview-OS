import {
  addDSAQuestion,
  getQuestions,
  getQues,
  updateFields,
  deleteQuestion,
  getSolHistory,
  toggleBookMark,
  resetSR,
  getStats,
  getDueQues,
  review,
  getSeededQuestions,
} from "../api/dsaAPI.jsx";
import { useState } from "react";

export const useDSA = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState({});
  const [questions, setQuestions] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [stats, setStats] = useState({});

  async function handleAddDSAQuestion(
    question,
    questionLink,
    topic,
    difficulty,
  ) {
    setLoading(true);
    setError(null);
    try {
      const response = await addDSAQuestion(
        question,
        questionLink,
        topic,
        difficulty,
      );
      if (!response) {
        setError("Some error occured while adding the question");
        return;
      }
      setQuestion(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetQuestions() {
    setLoading(true);
    setError(null);
    try {
      const response = await getQuestions();
      if (!response) {
        setError("Some error occured while fetching all questions");
        return;
      }
      const { questions, count } = response.data.data;
      setQuestions(questions);
      return count;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetQues(problemId) {
    setLoading(true);
    setError(null);
    try {
      const response = await getQues(problemId);
      if (!response) {
        setError("Some error occured while fetching the question");
        return;
      }
      setQuestion(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateFields(problemId, field, value) {
    setLoading(true);
    setError(null);
    try {
      const response = await updateFields(problemId, field, value);
      if (!response) {
        setError("Some error occured while updating the field");
        return;
      }
      setQuestion((prev) => ({ ...prev, [field]: response.data.data }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteQuestion(problemId) {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteQuestion(problemId);
      if (!response) {
        setError("Some error occured while deleting the question");
        return;
      }
      setQuestion(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetSolHistory(problemId) {
    setLoading(true);
    setError(null);
    try {
      const response = await getSolHistory(problemId);
      if (!response) {
        setError("Some error occured while fetching solution history");
        return;
      }
      setSolutions(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBookMark(problemId) {
    setLoading(true);
    setError(null);
    try {
      const response = await toggleBookMark(problemId);
      if (!response) {
        setError("Some error occured while toggling the bookmark");
        return;
      }
      setQuestion(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSR(problemId) {
    setLoading(true);
    setError(null);
    try {
      const response = await resetSR(problemId);
      if (!response) {
        setError("Some error occured while resetting spaced repetition");
        return;
      }
      setQuestion(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetStats() {
    setLoading(true);
    setError(null);
    try {
      const response = await getStats();
      if (!response) {
        setError("Some error occured while fetching stats");
        return;
      }
      const {
        noOfQuestions,
        dueToday,
        difficultyBreakdown,
        totalReviews,
        avgEaseFactor,
        topicBreakDown,
      } = response.data.data;
      if (
        !noOfQuestions ||
        !dueToday ||
        !totalReviews ||
        !avgEaseFactor ||
        !topicBreakDown ||
        !difficultyBreakdown
      ) {
        setError("All the fields are not present");
        return;
      }
      setStats({
        noOfQuestions,
        dueToday,
        difficultyBreakdown,
        totalReviews,
        avgEaseFactor,
        topicBreakDown,
      });
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetDueQues() {
    setLoading(true);
    setError(null);
    try {
      const response = await getDueQues();
      if (!response) {
        setError("Some error occured while fetching due questions");
        return;
      }
      setQuestions(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(problemId, quality, solution, remarks) {
    setLoading(true);
    setError(null);
    try {
      const response = await review(problemId, quality, solution, remarks);
      if (!response) {
        setError("Some error occured while submitting the review");
        return;
      }
      setQuestion(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetSeededQuestions(topic, difficulty, list, search) {
    setLoading(true);
    setError(null);
    try {
      const response = await getSeededQuestions(
        topic,
        difficulty,
        list,
        search,
      );
      if (!response) {
        setError("Some error occured while fetching seeded questions");
        return;
      }
      setQuestions(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    question,
    questions,
    solutions,
    stats,
    handleAddDSAQuestion,
    handleGetQuestions,
    handleGetQues,
    handleUpdateFields,
    handleDeleteQuestion,
    handleGetSolHistory,
    handleToggleBookMark,
    handleResetSR,
    handleGetStats,
    handleGetDueQues,
    handleReview,
    handleGetSeededQuestions,
  };
};
