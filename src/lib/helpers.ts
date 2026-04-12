export const getPaddedNumber = (month: number) => {
  return month < 10 ? `0${month}` : month;
};

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const isInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  );
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const logMessageIfLocalhost = (message: string) => {
  if (!window) return;
  if (window.location.hostname !== "localhost") return;

  console.log(message);
};
