const getPaginationParams = (
  inPage,
  inLimit,
  options = {
    page: 1,
    limit: 20,
  }
) => {
  const page = Number(inPage) || options.page;
  const limit = Number(inLimit) || options.limit;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export default getPaginationParams;
