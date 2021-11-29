export function forceShowScrollbars(): void {
  // Returns whether scrollbars show up on scrollable elements.
  // This is false on Macs when the "General > Show scroll bars" setting is
  // not set to "Always" (the default is "When scrolling"). The approach
  // taken here is to create an element that will scroll and then compare
  // its outer widthPercent (including scrollbars) to its inner widthPercent (excluding
  // scrollbars).
  function areScrollbarsVisible() {
    const scrollableElem = document.createElement("div"),
      innerElem = document.createElement("div");
    scrollableElem.style.width = "30px";
    scrollableElem.style.height = "30px";
    scrollableElem.style.overflow = "scroll";
    scrollableElem.style.borderWidth = "0";
    innerElem.style.width = "30px";
    innerElem.style.height = "60px";
    scrollableElem.appendChild(innerElem);
    document.body.appendChild(scrollableElem); // Elements only have widthPercent if they're in the layout
    const diff = scrollableElem.offsetWidth - scrollableElem.clientWidth;
    document.body.removeChild(scrollableElem);
    return diff > 0;
  }

  window.addEventListener("load", function () {
    // Show scrollbars if they're hidden.
    if (!areScrollbarsVisible()) {
      document.body.classList.add("force-show-scrollbars");
    }
  });
}
