import { useState } from "react";
import { askPatientFAQ } from "../api/faqApi.js";

export default function PatientFAQAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitQuestion(event) {
    event.preventDefault();
    const submittedQuestion = question.trim();
    if (!submittedQuestion || loading) return;

    setMessages((current) => [
      ...current,
      { role: "you", text: submittedQuestion },
    ]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const result = await askPatientFAQ(submittedQuestion);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: result.answer },
      ]);
    } catch (requestError) {
      setError(requestError.message || "Unable to contact the FAQ assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-section faq-assistant" aria-labelledby="faq-title">
      <h2 id="faq-title">Ask AfyaCare</h2>
      <p>
        Get help with appointments and using the patient portal. This assistant
        cannot answer medical questions.
      </p>
      <p className="faq-assistant__privacy">
        Do not enter medical details or other private information. Your question
        is sent to our AI provider and is not saved by AfyaCare.
      </p>

      <div className="faq-assistant__messages" aria-live="polite">
        {messages.length === 0 && (
          <p className="faq-assistant__empty">
            Try asking: “How do I book an appointment?”
          </p>
        )}
        {messages.map((message, index) => (
          <p
            className={`faq-assistant__message faq-assistant__message--${message.role}`}
            key={`${message.role}-${index}`}
          >
            <strong>{message.role === "you" ? "You" : "AfyaCare"}:</strong>{" "}
            {message.text}
          </p>
        ))}
        {loading && <p role="status">AfyaCare is preparing an answer...</p>}
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}

      <form className="faq-assistant__form" onSubmit={submitQuestion}>
        <label className="sr-only" htmlFor="patient-faq-question">
          Your question
        </label>
        <textarea
          id="patient-faq-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          placeholder="Ask about using the patient portal..."
          rows={2}
          required
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? "Sending..." : "Ask"}
        </button>
      </form>
    </section>
  );
}
