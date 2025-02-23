const DEFAULT_PAGE_LIST_NUM = 10;
const DEFAULT_PER_PAGE_NUM = 100;
const DEFAULT_PAGE_NUM = 1;

/**
 * @param {Number} totalCount 메일함에있는 메일
 * @param {Object} options
 * @param {Number} options.page 현재 페이지
 * @param {Number} options.perPageNum 한페이지당 출력할 갯수
 * @returns {Object} paging result
 */

function paging(totalCount, options = {}) {
  const perPageNum = options.perPageNum || DEFAULT_PER_PAGE_NUM;
  let page = options.page || DEFAULT_PAGE_NUM;

  const totalPage = Math.ceil(totalCount / perPageNum) || 1;

  if (totalPage < page) {
    page = totalPage;
  }

  const startPage = Math.floor((page - 1) / DEFAULT_PAGE_LIST_NUM) * DEFAULT_PAGE_LIST_NUM + 1;
  let endPage = startPage + DEFAULT_PAGE_LIST_NUM - 1;
  endPage = endPage > totalPage ? totalPage : endPage;
  return { startPage, endPage, page, perPageNum, totalPage };
}

export default paging;
