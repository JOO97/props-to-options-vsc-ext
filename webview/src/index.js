window.addEventListener("message", (res) => {
  const code = document.getElementById("code");
  const { type, data } = res.data;
  if (type === "update") {
    // document.execCommand("paste");
    code.innerHTML = data;
  }
});
