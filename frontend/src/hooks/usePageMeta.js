import { useEffect } from "react";

const SITE_NAME = "ShopKart";

// Sets the browser tab title and the meta description for the current page
export default function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const tag = document.querySelector('meta[name="description"]');
    if (tag && description) tag.setAttribute("content", description);
  }, [title, description]);
}
