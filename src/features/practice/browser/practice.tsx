export function Practice() {
  return (
    <main>
      <h1>Strokes</h1>
      <p id="practice-instructions">Practice Hindi handwriting with your finger, pen, or mouse.</p>
      <svg
        role="img"
        aria-label="Hindi writing practice area"
        aria-describedby="practice-instructions"
        viewBox="0 0 100 100"
        style={{ display: "block", width: "100%", maxWidth: 480, aspectRatio: "1", border: "1px solid currentColor", boxSizing: "border-box" }}
      />
    </main>
  );
}
