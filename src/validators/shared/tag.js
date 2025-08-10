import {
  idParam,
  pagination,
  sortBy,
  stringSearchQuery,
  booleanQuery,
} from "../common.js";

export const list = [
  ...stringSearchQuery("search"),
  ...pagination,
  ...booleanQuery("popular"),
];

export const listVideos = [
  ...idParam("tagId"),
  ...pagination,
  ...sortBy(["newest", "oldest", "popular"]),
];

export const tagIdPath = [...idParam("tagId")];
