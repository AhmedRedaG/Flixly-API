import { constants } from "../../config";

const { DEFAULT_PAGE, DEFAULT_LIMIT } = constants.pagination;

const getPaginationParams = (
  inPage,
  inLimit,
  options = {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
  }
) => {
  const page = Number(inPage) || options.page;
  const limit = Number(inLimit) || options.limit;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export default getPaginationParams;
