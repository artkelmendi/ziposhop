// This initial shell is available before the React bundle downloads.
export function loadingShell(page) {
  const skeleton = '<span class="boot-block"></span>';
  return (
    "<style>" +
    ".boot{font-family:Arial,sans-serif;min-height:100vh;animation:boot-delay 200ms step-end both}" +
    ".boot-header{height:76px;box-sizing:border-box;border-bottom:1px solid #e8e8e4;padding:22px 5%}" +
    ".boot-header .boot-block{width:120px;height:30px}" +
    ".boot-content{width:90%;max-width:1512px;margin:auto;padding-top:66px}" +
    ".boot-block{display:block;background:#e5e7eb linear-gradient(102deg,transparent 24%,#f1f2f4 49%,transparent 74%);background-size:215% 100%;border-radius:10px;animation:boot-shimmer 1.7s ease-in-out infinite}" +
    ".boot-title>.boot-block{height:64px;max-width:560px;margin-bottom:28px}" +
    ".boot-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin-top:60px}.boot-grid>.boot-block{height:360px}.boot-grid>.boot-block:first-child{grid-column:1/-1;height:385px}" +
    ".boot-home{display:grid;grid-template-columns:1fr 1.3fr;gap:50px;align-items:center;min-height:470px;padding-top:0}.boot-home>.boot-block{height:380px}" +
    ".boot-contact{display:grid;grid-template-columns:.83fr 1.17fr;gap:7vw}.boot-contact>.boot-block{height:470px}" +
    "@keyframes boot-delay{from{visibility:hidden}to{visibility:visible}}@keyframes boot-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}" +
    "@media(max-width:750px){.boot-header{height:64px;padding-top:17px}.boot-grid{grid-template-columns:repeat(2,1fr);gap:14px}.boot-contact{grid-template-columns:1fr}.boot-title>.boot-block{height:100px}}" +
    "@media(max-width:520px){.boot-grid{grid-template-columns:1fr}.boot-home{display:flex;flex-direction:column;gap:30px;padding-top:28px;min-height:570px}.boot-home>*{width:100%}.boot-home>.boot-block{height:280px}}" +
    "@media(prefers-reduced-motion:reduce){.boot-block{animation:none}}" +
    '</style><div class="boot" role="status" aria-label="Duke hapur faqen…" aria-busy="true"><div class="boot-header">' +
    skeleton +
    "</div>" +
    '<div class="boot-content ' +
    (page === "home" ? "boot-home" : page === "contact" ? "boot-contact" : "") +
    '"><div class="boot-title">' +
    skeleton +
    (page === "catalog"
      ? '<div class="boot-grid">' + skeleton.repeat(5) + "</div>"
      : "") +
    "</div>" +
    (page !== "catalog" ? skeleton : "") +
    "</div></div>"
  );
}
