// tools/job-clipper-bookmarklet.js
// A button YOU click while viewing a job post. It copies the page into the job-file format
// so you can paste it into jobs/. It does not click, scroll, search, or submit anything —
// it's the same as you selecting the text and pressing copy.
//
// Install: create a new browser bookmark, name it "Clip Job", and paste the ONE-LINE version
// (tools/job-clipper-bookmarklet.txt) into the URL field.

(() => {
  const pick = (sels) => {
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el && el.innerText.trim()) return el.innerText.trim();
    }
    return "";
  };
  const title = pick(["h1", "[class*='job-title']", "[class*='title']"]) || document.title;
  const company = pick(["[class*='company-name']", "[class*='company']", "[class*='employer']"]);
  const body =
    pick(["[class*='description']", "#job-details", "article", "main"]) || document.body.innerText;
  const text = `Title: ${title}\nCompany: ${company}\nURL: ${location.href}\n\n${body}`;

  navigator.clipboard.writeText(text).then(() => {
    const toast = document.createElement("div");
    toast.textContent = "✅ Job copied — paste into a new file in jobs/";
    Object.assign(toast.style, {
      position: "fixed", top: "16px", right: "16px", zIndex: 999999,
      background: "#1f7a4d", color: "#fff", padding: "10px 14px", borderRadius: "8px", font: "14px sans-serif",
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  });
})();
