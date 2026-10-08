/**
 * Where Jackson's own chatbot mounts. It renders nothing visible yet; the data attributes tell the
 * chatbot where its grounding content lives, so it only answers from what the site says.
 */
export function ChatbotSlot() {
  return (
    <div
      id="chatbot"
      data-grounding="/llms-full.txt"
      data-grounding-json="/profile.json"
      hidden
    />
  )
}
