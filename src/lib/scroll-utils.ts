// Auto-scroll to results after calculation completes
// Follows UI/UX Pro Max rule: Forms & Feedback - submit-feedback
export function scrollToResults(resultId: string = "results-section") {
  // Use requestAnimationFrame to ensure DOM is updated
  requestAnimationFrame(() => {
    const element = document.getElementById(resultId);
    if (element) {
      // Scroll with smooth behavior and offset for fixed header
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  });
}
