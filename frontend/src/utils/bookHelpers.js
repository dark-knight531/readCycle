import { API_ORIGIN } from "./api.js";

export const getBookImageUrl = (bookImage) => {
  if (!bookImage) return null;
  if (bookImage.startsWith("http")) return bookImage;
  return `${API_ORIGIN}${bookImage.startsWith("/") ? bookImage : `/${bookImage}`}`;
};
