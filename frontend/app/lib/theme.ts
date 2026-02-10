export const toggleTheme = () => {
  if (typeof window === "undefined") return;
  
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  
  if (isDark) {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
    return false;
  } else {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
    return true;
  }
};

export const initTheme = () => {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
};